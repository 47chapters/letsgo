import { Command, Option } from "commander";
import { getConfig } from "../aws/ssm";
import chalk from "chalk";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";

const program = new Command();

program
  .name("get")
  .summary("Get configuration")
  .description(
    `Get the value of a specific configuration key or all configuration keys for a deployment.`
  )
  .argument("[key]", `The configuration key`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "env", "json"])
      .default("text")
  )
  .action(async (key, options) => {
    const config = await getConfig(options.region, options.deployment);
    const deploymentConfig = config[options.region]?.[options.deployment];
    if (deploymentConfig === undefined) {
      console.log(
        chalk.red(`Configuration for deployment`),
        chalk.bold(`${options.region}/${options.deployment}`),
        chalk.red(`not found.`)
      );
      process.exit(1);
    }
    const filteredConfig =
      key === undefined
        ? deploymentConfig
        : deploymentConfig[key]
        ? { [key]: deploymentConfig[key] }
        : undefined;
    if (filteredConfig === undefined) {
      console.log(
        chalk.red(`Configuration key`),
        chalk.bold(`${options.region}/${options.deployment}/${key}`),
        chalk.red(`not found.`)
      );
      process.exit(1);
    }
    if (options.output === "json") {
      console.log(JSON.stringify(filteredConfig, null, 2));
    } else {
      // text or env
      if (!key && options.output === "text") {
        console.log(
          chalk.green(`Configuration of deployment`),
          chalk.bold(`${options.region}/${options.deployment}`) +
            chalk.green(`:`)
        );
      }
      if (key && options.output === "text") {
        console.log(filteredConfig[key]);
      } else {
        Object.keys(filteredConfig)
          .sort()
          .forEach((key) => {
            console.log(`${key}=${filteredConfig[key]}`);
          });
      }
    }
  });

export default program;
