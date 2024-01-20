import chalk from "chalk";
import { Option } from "commander";

export type Logger = (message: string, prefixOverride?: string) => void;

export function createLogger(
  prefix: string,
  region: string,
  deployment: string,
  component?: string
): Logger {
  return (message: string, prefixOverride?: string) =>
    console.log(
      `${prefixOverride || prefix}:${chalk.bold(
        `${region}/${deployment}${component ? `/${component}` : ""}`
      )}: ${message}`
    );
}

export function getArtifacts(artifacts: string[], allArtifacts: string[]) {
  const newArtifacts = (
    artifacts.indexOf("all") >= 0 ? allArtifacts : artifacts
  ).reduce((acc: { [artifact: string]: boolean }, artifact: string) => {
    acc[artifact] = true;
    return acc;
  }, {} as { [artifact: string]: boolean });
  if (newArtifacts.worker) {
    newArtifacts["worker-queue"] = true;
    newArtifacts["worker-scheduler"] = true;
  }
  return newArtifacts;
}

export function createArtifactOption(
  artifacts: string[],
  description: string = "Artifact"
): Option {
  const option = new Option(
    "-a, --artifact [component...]",
    description
  ).choices(artifacts);
  option.makeOptionMandatory(true);
  option.required = true;
  return option;
}
