import { Command } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { putItem, DBItem } from "@letsgo/db";
import chalk from "chalk";

const program = new Command();

program
  .name("put")
  .argument(
    "[value]",
    "JSON value or JavaScript object literal to store in the database"
  )
  .summary("Upsert an item to the database")
  .description(
    `Upserts and item to the database. The JSON or JavaScript object literal must have a 'category' and 'key' properties. It can be provided as a string argument or read from stdin if -s is provided.`
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option("-s, --stdin", "Read the JSON value from stdin")
  .action(async (value, options) => {
    if (options.stdin) {
      if (value) {
        console.log(
          chalk.red("If '--stdin' is specified, the argument must be omitted")
        );
        process.exit(1);
      }
    } else if (!value) {
      console.log(
        chalk.red(
          "If '--stdin' is not specified, the argument key must be provided"
        )
      );
      process.exit(1);
    }

    let v: DBItem | undefined;
    if (options.stdin) {
      // Read stdin
      const stdin = process.stdin;
      stdin.setEncoding("utf8");
      value = "";
      for await (const chunk of stdin) {
        value += chunk;
      }
    }
    try {
      v = JSON.parse(value);
    } catch {
      try {
        v = eval(`(${value})`);
      } catch {}
    }

    if (!v || !v.category || !v.key) {
      console.log(
        chalk.red(
          "The value must be a JSON object or a JavaScript object literal with 'category' and 'key' properties"
        )
      );
      process.exit(1);
    }

    await putItem(v, {
      region: options.region,
      deployment: options.deployment,
    });
  });

export default program;
