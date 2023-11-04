import { Command, Option } from "commander";
import { getConfig } from "../aws/ssm";
import chalk from "chalk";
import { DefaultRegion } from "@letsgo/constants";

const program = new Command();

program
  .name("ls")
  .description("List deployments in a region")
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .action(async (options) => {
    const config = await getConfig(options.region);
    const result = Object.keys(config);
    if (options.output === "text") {
      if (result.length === 0) {
        console.log(
          chalk.yellow(`No deployments found in the`),
          chalk.bold(options.region),
          chalk.yellow(`region.`)
        );
      } else {
        console.log(
          chalk.green("Deployments in the"),
          chalk.bold(options.region),
          chalk.green("region:")
        );
        console.log(result.sort().join("\n"));
      }
    } else {
      // json
      console.log(JSON.stringify(result, null, 2));
    }
  });

export default program;
