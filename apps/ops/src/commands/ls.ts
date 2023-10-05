import { Command, Option } from "commander";
import { getConfig } from "../aws/ssm";
import chalk from "chalk";

const program = new Command();

program
  .name("ls")
  .description("List deployments")
  .addOption(
    new Option("-o, --output <format>", "Output format")
      .choices(["text", "json"])
      .default("text")
  )
  .action(async (options) => {
    const config = await getConfig();
    const result: { [region: string]: string[] } = {};
    Object.keys(config).forEach((region) => {
      Object.keys(config[region]).forEach((deployment) => {
        result[region] = result[region] || [];
        result[region].push(deployment);
      });
    });
    if (options.output === "text") {
      if (Object.keys(result).length === 0) {
        console.log(chalk.yellow("No deployments found"));
      } else {
        console.log(chalk.green("Deployments:"));
        Object.keys(result)
          .sort()
          .forEach((region) => {
            result[region].sort().forEach((deployment) => {
              console.log(`${chalk.dim(region)}${chalk.dim("/")}${deployment}`);
            });
          });
      }
    } else {
      // json
      console.log(JSON.stringify(result, null, 2));
    }
  });

export default program;
