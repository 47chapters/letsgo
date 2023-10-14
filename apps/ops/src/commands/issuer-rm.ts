import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { deleteIssuer, getIssuer } from "@letsgo/trust";
import chalk from "chalk";

const program = new Command();

program
  .name("rm")
  .summary("Remove a JWT issuer")
  .description(
    [
      `Removes a trusted issuer of JWT tokens from the system. All JWT tokens issued by this issuer will be rejected.`,
    ].join("")
  )
  .argument("<issuer>", "The issuer (iss) to remove")
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .action(async (issuer, options) => {
    const result = await getIssuer(issuer, options);
    if (!result) {
      console.log(chalk.yellow("Issuer not found"));
    } else {
      await deleteIssuer(issuer, options);
      console.log(chalk.green("Issuer removed"));
    }
  });

export default program;
