import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { AllServiceArtifacts, createStartStopCommanderAction } from "./service";
import { createArtifactOption } from "./defaults";

const program = new Command();

program
  .name("start")
  .summary("Start services")
  .description(`Start all or selected services of a deployment.`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(createArtifactOption(AllServiceArtifacts, "Service to start"))
  .action(createStartStopCommanderAction(true));

export default program;
