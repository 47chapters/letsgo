import { Command } from "commander";
import {
  DefaultRegion,
  DefaultDeployment,
  ApiConfiguration,
} from "@letsgo/constants";
import { createJwt } from "@letsgo/trust";
import chalk from "chalk";
import {
  describeCustomDomains,
  describeService,
  listLetsGoAppRunnerServices,
} from "../aws/apprunner";

const program = new Command();

program
  .name("jwt")
  .summary("Create JWT to authenticate to the API")
  .description(
    [
      `Creates a JWT token using the active PKI issuer that can be used to authenticate access to the API. `,
      `If no PKI issuer is specified, the active issuer will be used. `,
      `If no --aud options are provided, the audience of the token will be set to the local development server, `,
      `the 'api' service URL provided by AppRunner, and the custom domain URL associated with the 'api' service (if any).`,
    ].join("")
  )
  .argument("[issuer]", "The PKI issuer (iss) to use")
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option(`-a --aud [audience...]`, `The audience (aud) of the JWT token`)
  .option(
    `-e, --expires-in <time>`,
    `The expiration time of the JWT token, e.g. 60s, 1h, 1d, or 0 for non-expiring tokens`,
    "8h"
  )
  .option(`-v --verbose`, `Verbose output`)
  .action(async (issuer, options) => {
    try {
      if (!options.aud) {
        const services = await listLetsGoAppRunnerServices(
          options.region,
          options.deployment,
          ApiConfiguration.Name
        );
        if (services.length === 0) {
          throw new Error(
            `No ${ApiConfiguration.Name} services found in the ${options.deployment} deployment in the ${options.region} region.`
          );
        }
        if (services.length > 1) {
          throw new Error(
            `More then one ${ApiConfiguration.Name} service found in the ${options.deployment} deployment in the ${options.region} region; expected one.`
          );
        }
        const customDomains = await describeCustomDomains(
          options.region,
          services[0].ServiceArn || ""
        );
        options.aud = [
          "http://localhost:3001",
          `https://${services[0].ServiceUrl}`,
        ];
        customDomains.forEach((domain) => {
          options.aud.push(`https://${domain.DomainName}`);
          if (domain.EnableWWWSubdomain) {
            options.aud.push(`https://www.${domain.DomainName}`);
          }
        });
      }
      const jwt = await createJwt({
        ...options,
        iss: issuer,
        exp: options.expiresIn,
      });
      console.log(jwt);
    } catch (e: any) {
      console.log(
        chalk.red(options.verbose ? e.stack || e.message : e.message)
      );
    }
  });

export default program;
