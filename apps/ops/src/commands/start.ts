import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "../vendor";
import { AllServiceArtifacts, createStartStopCommanderAction } from "./service";

const program = new Command();

program
  .name("start")
  .summary("Start services")
  .description(`Start all or selected services of a deployment.`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option("-a, --artifact [component...]", "Service to start").choices(
      AllServiceArtifacts
    )
  )
  .action(createStartStopCommanderAction(true));

export default program;
