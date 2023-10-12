import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { AllServiceArtifacts, createStartStopCommanderAction } from "./service";

const program = new Command();

program
  .name("stop")
  .summary("Stop services")
  .description(`Stop all or selected services of a deployment.`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(
    new Option("-a, --artifact [component...]", "Service to stop").choices(
      AllServiceArtifacts
    )
  )
  .action(createStartStopCommanderAction(false));

export default program;
