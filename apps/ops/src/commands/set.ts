import { Command } from "commander";
import { setConfig } from "../aws/ssm";
import chalk from "chalk";
import { DefaultRegion, DefaultDeployment } from "../vendor";
import dotenv from "dotenv";

const program = new Command();

program
  .name("set")
  .summary("Set configuration")
  .description(
    [
      `Set a single or multiple configuration values. If the '-s' option is not specified, `,
      `the argument must be in the form key=value and the command sets a single configuration value. `,
      `If the '-s' option is specified, the argument must be omitted and the command `,
      `sets multiple configuration values read from stdin in the .env format as configuration of the specified deployment. `,
      `Existing configuration values not specifed on stdin are left intact. `,
      `The default region is '${DefaultRegion}' and the default deployment is '${DefaultDeployment}'.`,
    ].join("")
  )
  .argument(
    "[keyValue]",
    "The configuration key and value in the form key=value"
  )
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .option(
    "-s, --stdin",
    "Read configuration settings to set from stdin in the .env format"
  )
  .action(async (maybeKeyValue, options) => {
    const [key, value] = (maybeKeyValue || "").split("=");
    if (options.stdin) {
      if (key) {
        console.log(
          chalk.red("If '--stdin' is specified, the arguent must be omitted")
        );
        process.exit(1);
      }
    } else if (!key) {
      console.log(
        chalk.red(
          "If '--stdin' is not specified, the argument key must be provided and in the form key=value"
        )
      );
      process.exit(1);
    }

    let kvs: { [key: string]: string };
    if (options.stdin) {
      // Read stdin
      const stdin = process.stdin;
      stdin.setEncoding("utf8");
      let data = "";
      for await (const chunk of stdin) {
        data += chunk;
      }
      // Parse into key-value pairs
      kvs = dotenv.parse(data);
    } else {
      kvs = { [key]: value };
    }

    await setConfig(options.region, options.deployment, kvs);
  });

export default program;
