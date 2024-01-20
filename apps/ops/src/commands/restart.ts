import { Command, Option } from "commander";
import { DefaultRegion, DefaultDeployment } from "@letsgo/constants";
import { AllServiceArtifacts, createStartStopCommanderAction } from "./service";
import { createArtifactOption } from "./defaults";

const program = new Command();

program
  .name("restart")
  .summary("Retart services")
  .description(`Retart all or selected services of a deployment.`)
  .option(`-r, --region <region>`, `The AWS region`, DefaultRegion)
  .option(`-d, --deployment <deployment>`, `The deployment`, DefaultDeployment)
  .addOption(createArtifactOption(AllServiceArtifacts, "Service to restart"))
  .action(async (options) => {
    const stop = createStartStopCommanderAction(false);
    const start = createStartStopCommanderAction(true);

    await stop(options);
    await start(options);
  });

export default program;
