import { Command, Option } from "commander";
import {
  ApiConfiguration,
  WebConfiguration,
  DefaultRegion,
  DefaultDeployment,
} from "@letsgo/constants";
import { getAppRunnerStatus, isErrorStatus } from "./status";
import chalk from "chalk";
import { removeCustomDomain } from "../aws/apprunner";
import { createLogger } from "./defaults";

const AllServiceArtifacts = ["api", "web"];

const program = new Command();

program
  .name("rm")
  .summary("Disassociate a custom domain name")
  .description(
    `Disassociate a custom domain name from the web or api component.`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option(
      "-a, --artifact [component]",
      "Service to disassociate a custom domain from"
    )
      .choices(AllServiceArtifacts)
      .makeOptionMandatory()
  )
  .action(async (options) => {
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
          `Deployment ${options.region}/${
            options.deployment
          } is associated with multiple custom domains: ${status.customDomains
            .map((d) => d.DomainName)
            .join(`, `)}. Use AWS console/CLI to manually fix the issue.`
        )
      );
      process.exit(1);
    }
    if (status.customDomains.length === 0) {
      console.log(
        chalk.yellow(
          `Deployment ${options.region}/${options.deployment} is not associated with a custom domain.`
        )
      );
      process.exit(0);
    }
    await removeCustomDomain(
      options.region,
      status.apprunner?.ServiceArn || "",
      status.customDomains[0].DomainName || "",
      createLogger(
        "aws:apprunner",
        options.region,
        options.deployment,
        options.artifact
      )
    );
    console.log(
      chalk.green(`Removed`),
      chalk.bold(`${status.customDomains[0].DomainName}`),
      chalk.green(`custom domain from the`),
      chalk.bold(`${options.artifact}`),
      chalk.green(`service in the`),
      chalk.bold(`${options.region}/${options.deployment}`),
      chalk.green(`deployment.`)
    );
  });

export default program;
