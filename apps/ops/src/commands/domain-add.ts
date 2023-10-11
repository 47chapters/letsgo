import { Command, Option } from "commander";
import {
  DefaultRegion,
  DefaultDeployment,
  ApiConfiguration,
  WebConfiguration,
} from "../vendor";
import { getAppRunnerStatus, isErrorStatus } from "./status";
import chalk from "chalk";
import { addCustomDomain } from "../aws/apprunner";
import { createLogger } from "./defaults";
import { printDomain } from "./domain-status";

const AllServiceArtifacts = ["api", "web"];

const program = new Command();

program
  .name("add")
  .argument("<domain>", "The custom domain name to associate, e.g. contoso.com")
  .summary("Add a custom domain name")
  .description(`Add a custom domain name for the web or api component.`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option(`-w, --www`, `Enable www.{domain}`)
  .addOption(
    new Option(
      "-a, --artifact [component]",
      "Service to add a custom domain to"
    )
      .choices(AllServiceArtifacts)
      .makeOptionMandatory()
  )
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .action(async (domain, options) => {
    const settings =
      options.artifact === "api" ? ApiConfiguration : WebConfiguration;
    const status = await getAppRunnerStatus(
      options.region,
      options.deployment,
      settings
    );
    if (!status) {
      console.log(
        chalk.red(
          `Deployment ${options.region}/${options.deployment} not found.`
        )
      );
      process.exit(1);
    }
    if (isErrorStatus(status)) {
      console.log(chalk.red(status.error));
      process.exit(1);
    }
    if (status.customDomains.length > 1) {
      console.log(
        chalk.red(
          `The ${options.artifact} service in the ${options.region}/${
            options.deployment
          } deployment is associated with multiple custom domains: ${status.customDomains
            .map((d) => d.DomainName)
            .join(`, `)}. Use AWS console/CLI to manually fix the issue.`
        )
      );
      process.exit(1);
    }
    if (status.customDomains.length === 1) {
      console.log(
        chalk.red(
          `The ${options.artifact} service in the ${options.region}/${
            options.deployment
          } deployment is already associated with a custom domain: ${status.customDomains
            .map((d) => d.DomainName)
            .join(`, `)}.`
        )
      );
      process.exit(1);
    }
    const result = await addCustomDomain(
      options.region,
      status.apprunner?.ServiceArn || "",
      domain,
      !!options.www,
      options.output === "json",
      createLogger(
        "aws:apprunner",
        options.region,
        options.deployment,
        options.artifact
      )
    );
    if (options.output === "json") {
      console.log(result);
    } else {
      printDomain(options, result, status.apprunner?.ServiceUrl || "");
      console.log();
      console.log(`Please add the DNS records above to your DNS registry.`);
      console.log(
        `You can then monitor the status of domain name validation using this command:`
      );
      console.log();
      console.log(
        `   yarn ops domain status -r ${options.region} -d ${options.deployment} -a ${options.artifact}`
      );
      console.log();
      console.log(
        chalk.bold(`NOTE:`),
        "It may take 24-48h for the domain name to be validated."
      );
      console.log();
    }
  });

export default program;
