import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { listIssuers, isJwksIssuer, getActiveIssuer } from "@letsgo/trust";
import chalk from "chalk";
import e from "express";

const DefaultLimit = 100;

const program = new Command();

function printLine(key: string, value: string) {
  console.log(`${chalk.bold(key.padEnd(15, " "))}${value}`);
}

program
  .name("ls")
  .summary("List JWT token issuers")
  .description(`List trusted JWT token issuers registered in the system.`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option(`-f, --full`, `Return the full item instead of just the key`)
  .option(
    `-l, --limit <number>`,
    `Limit of the number of items to return`,
    DefaultLimit.toString()
  )
  .option(
    `-n, --next-token <token>`,
    `Continuation token from a previous invocation`
  )
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .action(async (options) => {
    const result = await listIssuers({
      region: options.region,
      deployment: options.deployment,
      limit: parseInt(options.limit),
      nextToken: options.nextToken,
    });
    const activeIssuer = await getActiveIssuer(options);
    if (options.output === "json") {
      console.log(result);
    } else {
      if (result.items.length === 0) {
        console.log(chalk.yellow("No issuers found"));
      } else {
        for (const item of result.items) {
          if (options.full) {
            if (isJwksIssuer(item)) {
              printLine("Issuer (iss)", item.key);
              printLine("Type", "JWKS");
              printLine("JWKS URL", item.jwks);
              printLine("CreatedAt", item.createdAt);
            } else {
              if (activeIssuer && activeIssuer.key === item.key) {
                printLine(
                  "Issuer (iss)",
                  `${item.key} ${chalk.green("(active)")}`
                );
              } else {
                printLine("Issuer (iss)", item.key);
              }
              printLine("Type", "PKI");
              printLine("Key ID (kid)", item.kid);
              printLine("CreatedAt", item.createdAt);
            }
            console.log();
          } else {
            console.log(
              item.key,
              activeIssuer && activeIssuer.key === item.key
                ? chalk.green(`(active)`)
                : ""
            );
          }
        }
        if (result.nextToken) {
          if (!options.full) {
            console.log();
          }
          console.log(
            chalk.yellow(
              "More issuers are available and can be listed with this command:"
            )
          );
          console.log(
            `yarn ops issuer ls ${
              options.region !== DefaultRegion ? ` -r ${options.region}` : ""
            }${
              options.deployment !== DefaultDeployment
                ? ` -d ${options.deployment}`
                : ""
            }${options.full ? " -f" : ""}${
              options.limit ? ` -l ${options.limit}` : ""
            } -n ${result.nextToken}`
          );
        }
      }
    }
  });

export default program;
