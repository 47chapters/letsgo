import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { listItems, deleteItem } from "@letsgo/db";
import chalk from "chalk";

const program = new Command();

program
  .name("rm")
  .argument("<category>", "The data category")
  .argument("[keyOrKeyPrefix]", "The key or key prefix of the items to remove")
  .summary("Remove items from the database")
  .description(
    `Remove items from the database that belong to a specifc category and have a specific key or a key prefix if -p is specified.`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option(`-p, --prefix`, `Remove all items with keys matching the key prefix`)
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .action(async (category, keyOrKeyPrefix, options) => {
    if (!options.prefix && !keyOrKeyPrefix) {
      console.log(
        chalk.red("The key must be provided if the -p option is not specified.")
      );
      process.exit(1);
    }
    let count = 0;
    if (options.prefix) {
      let nextToken: string | undefined;
      do {
        const result = await listItems(category, keyOrKeyPrefix || "", {
          region: options.region,
          deployment: options.deployment,
          nextToken,
        });
        while (result.items.length > 0) {
          const parallel: Promise<void>[] = [];
          while (parallel.length < 10 && result.items.length > 0) {
            const item = result.items.pop()!;
            parallel.push(
              deleteItem(category, item.key, {
                region: options.region,
                deployment: options.deployment,
              })
            );
            count++;
          }
          await Promise.all(parallel);
        }
        nextToken = result.nextToken;
      } while (nextToken);
    } else {
      await deleteItem(category, keyOrKeyPrefix, {
        region: options.region,
        deployment: options.deployment,
      });
      count = 1;
    }
    if (options.output === "json") {
      console.log(JSON.stringify({ removedCount: count }, null, 2));
    } else {
      if (count === 0) {
        console.log(chalk.yellow(`No items removed.`));
      } else {
        console.log(
          chalk.green(`Removed ${count} item${count === 1 ? "" : "s"}`)
        );
      }
    }
  });

export default program;
