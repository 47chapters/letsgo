import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { listItems } from "@letsgo/db";
import chalk from "chalk";

const DefaultLimit = 100;

const program = new Command();

program
  .name("ls")
  .argument("<category>", "The data category to query")
  .argument("[keyPrefix]", "The key prefix of the items to return")
  .summary("List items in the database")
  .description(
    `List items in the database that belong to a specifc category and have a specific key prefix.`
  )
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
  .action(async (category, keyPrefix, options) => {
    const result = await listItems(category, keyPrefix || "", {
      region: options.region,
      deployment: options.deployment,
      limit: parseInt(options.limit),
      nextToken: options.nextToken,
    });
    if (options.output === "json") {
      console.log(result);
    } else {
      if (result.items.length === 0) {
        console.log(chalk.yellow("No matching items found"));
      } else {
        for (const item of result.items) {
          if (options.full) {
            console.log(chalk.blue.bold(item.key));
            console.log(JSON.stringify(item, null, 2));
            console.log();
          } else {
            console.log(item.key);
          }
        }
        if (result.nextToken) {
          if (!options.full) {
            console.log();
          }
          console.log(
            chalk.yellow(
              "More items are available and can be listed with this command:"
            )
          );
          console.log(
            `yarn ops db ls '${category}'${keyPrefix ? ` '${keyPrefix}'` : ""}${
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
