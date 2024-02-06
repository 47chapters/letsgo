import { Command } from "commander";
import {
  DefaultRegion,
  DefaultDeployment,
  ApiConfiguration,
  StaticJwtAudience,
} from "@letsgo/constants";
import {
  createJwt,
  getActiveIssuer,
  getIssuer,
  isPkiIssuer,
} from "@letsgo/trust";
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
    ].join("")
  )
  .argument("[issuer]", "The PKI issuer (iss) to use")
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option(
    `-a --aud <audience>`,
    `The audience (aud) of the JWT token`,
    StaticJwtAudience
  )
  .option(
    `-e, --expires-in <time>`,
    `The expiration time of the JWT token, e.g. 60s, 1h, 1d, or 0 for non-expiring tokens`,
    "8h"
  )
  .option(
    "-c, --claim [key=value...]",
    `Additional claims to include in the JWT`
  )
  .option(`-v --verbose`, `Verbose output`)
  .action(async (issuer, options) => {
    try {
      const claims: { [key: string]: any } = {};
      if (options.claim) {
        for (const claim of options.claim) {
          const parts = claim.split("=");
          if (parts.length !== 2) {
            throw new Error(
              `Invalid claim: '${claim}'. The claim must be in the format 'key=value'.`
            );
          }
          claims[parts[0]] = parts[1];
        }
      }
      const activeIssuer = issuer
        ? await getIssuer(issuer, options)
        : await getActiveIssuer(options);
      if (!activeIssuer) {
        throw new Error(
          `${
            issuer ? "Specified" : "Active"
          } issuer not found. You can create a new PKI issuer using 'yarm ops issuer add --pki-create'`
        );
      }
      if (!isPkiIssuer(activeIssuer)) {
        throw new Error(`Issuer ${activeIssuer.key} is not a PKI issuer.`);
      }

      const jwt = await createJwt({
        issuer: activeIssuer,
        audience: options.aud,
        expiresIn: options.expiresIn,
        claims,
      });
      console.log(jwt);
    } catch (e: any) {
      console.log(
        chalk.red(options.verbose ? e.stack || e.message : e.message)
      );
    }
  });

export default program;
