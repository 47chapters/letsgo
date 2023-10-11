import { Command, Option } from "commander";
import {
  DefaultRegion,
  DefaultDeployment,
  ApiConfiguration,
  WebConfiguration,
} from "../vendor";
import { getAppRunnerStatus, isErrorStatus } from "./status";
import chalk from "chalk";
import { CustomDomain } from "@aws-sdk/client-apprunner";

const AllServiceArtifacts = ["api", "web"];

const program = new Command();

function printLine(key: string, value: string) {
  console.log(`  ${chalk.bold(key.padEnd(15, " "))}${value}`);
}

function getStatusColor(status: string) {
  return status === "active" || status === "SUCCESS"
    ? chalk.green
    : status === "pending_certificate_dns_validation" ||
      status === "PENDING_VALIDATION"
    ? chalk.yellow
    : chalk.red;
}

export function printDomain(
  options: any,
  domain: CustomDomain,
  primaryDomain: string
) {
  console.log(
    chalk.green(`Custom domain of the`),
    chalk.bold(options.artifact),
    chalk.green("service in the"),
    chalk.bold(`${options.region}/${options.deployment}`),
    chalk.green(`deployment:`)
  );
  console.log();
  printLine(
    "Domain",
    `${domain.DomainName}${
      domain.EnableWWWSubdomain ? `, www.${domain.DomainName}` : ""
    }`
  );
  const statusColor = getStatusColor(domain.Status || "");
  printLine("Status", statusColor(domain.Status || ""));
  console.log();
  console.log("  Required DNS records:");
  console.log();
  printLine("Name", `${domain.DomainName || ""}.`);
  printLine("Type", "CNAME");
  printLine("Value", primaryDomain);
  domain.CertificateValidationRecords?.forEach((record) => {
    console.log();
    printLine("Name", record.Name || "");
    printLine("Type", record.Type || "");
    printLine("Value", record.Value || "");
    const statusColor = getStatusColor(record.Status || "");
    printLine("Status", statusColor(record.Status || ""));
  });
}

program
  .name("status")
  .summary("Get status of a custom domain")
  .description(
    `Get status and DNS records of a custom domain associated with the web or api component.`
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
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
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
          `The ${options.artifact} service in the ${options.region}/${
            options.deployment
          } deployment is associated with multiple custom domains: ${status.customDomains
            .map((d) => d.DomainName)
            .join(`, `)}. Use AWS console/CLI to manually fix the issue.`
        )
      );
      process.exit(1);
    }
    if (status.customDomains.length === 0) {
      console.log(
        chalk.yellow(
          `The ${options.artifact} service in the ${options.region}/${options.deployment} deployment is not associated with a custom domain.`
        )
      );
      process.exit(0);
    }
    if (options.output === "json") {
      console.log(status.customDomains[0]);
    } else {
      printDomain(
        options,
        status.customDomains[0],
        status.apprunner?.ServiceUrl || ""
      );
      if (
        status.customDomains[0].Status === "pending_certificate_dns_validation"
      ) {
        console.log();
        console.log(
          chalk.bold(`NOTE:`),
          "It may take 24-48h after you added the DNS records to your registry for the domain name to be validated."
        );
        console.log();
      }
    }
  });

export default program;
