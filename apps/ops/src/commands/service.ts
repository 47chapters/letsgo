import chalk from "chalk";
import {
  ApiConfiguration,
  WebConfiguration,
  WorkerConfiguration,
} from "@letsgo/constants";
import { createLogger, getArtifacts } from "./defaults";
import { enableOrDisableService } from "../aws/apprunner";
import { enableOrDisableEventSourceMapping } from "../aws/lambda";

export const AllServiceArtifacts = ["all", "api", "web", "worker"];

export function createStartStopCommanderAction(start: boolean) {
  return async (options: any): Promise<void> => {
    options.artifact = options.artifact || [];
    if (options.artifact.length === 0) {
      console.log(
        chalk.yellow(
          `No services to ${
            start ? "start" : "stop"
          } specified. Use the '-a' option.`
        )
      );
      process.exit(0);
    }
    console.log(
      `${start ? "Starting" : "Stopping"} ${chalk.bold(
        options.artifact.sort().join(", ")
      )} services in deployment ${chalk.bold(
        `${options.region}/${options.deployment}`
      )}...`
    );
    const artifacts = getArtifacts(options.artifact, AllServiceArtifacts);
    const logger = createLogger(
      "aws:service",
      options.region,
      options.deployment
    );
    const parallel: Promise<any>[] = [
      ...(artifacts.api
        ? [
            enableOrDisableService(
              options.region,
              options.deployment,
              ApiConfiguration,
              start,
              logger
            ),
          ]
        : []),
      ...(artifacts.web
        ? [
            enableOrDisableService(
              options.region,
              options.deployment,
              WebConfiguration,
              start,
              logger
            ),
          ]
        : []),
      ...(artifacts.worker
        ? [
            enableOrDisableEventSourceMapping(
              options.region,
              options.deployment,
              WorkerConfiguration.getLambdaFunctionName(options.deployment),
              start,
              logger
            ),
          ]
        : []),
    ];
    await Promise.all(parallel);
    console.log(
      `${start ? "Started" : "Stopped"} ${chalk.bold(
        options.artifact.sort().join(", ")
      )} services in deployment ${chalk.bold(
        `${options.region}/${options.deployment}`
      )}`
    );
  };
}
