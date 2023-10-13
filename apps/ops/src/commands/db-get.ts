import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { getItem } from "@letsgo/db";
import chalk from "chalk";

const program = new Command();

program
  .name("get")
  .argument("<category>", "Item category")
  .argument("<key>", "Item key")
  .summary("Gets one item from the database")
  .description(
    `Gets a single item identified by the 'category' and 'key' from the database`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .action(async (category, key, options) => {
    const item = await getItem(category, key, {
      region: options.region,
      deployment: options.deployment,
    });
    if (!item) {
      console.log(chalk.red("Item not found"));
      process.exit(1);
    }
    console.log(JSON.stringify(item, null, 2));
  });

export default program;
