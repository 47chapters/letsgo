import chalk from "chalk";

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
  return newArtifacts;
}
