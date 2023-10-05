import { VendorPrefix, ConfigRegion } from "../vendor";

export const ConfigPrefix = `/${VendorPrefix}`;

const version = require("../../../../package.json").version;

export const TagKeys = {
  LetsGoVersion: "LetsGoVersion",
  LetsGoDeployment: "LetsGoDeployment",
  LetsGoRegion: "LetsGoRegion",
  LetsGoUpdated: "LetsGoUpdated",
  LetsGoComponent: "LetsGoComponent",
};

export function getTags(
  region: string,
  deployment: string,
  additionalTags?: { [key: string]: string }
) {
  let tags = [
    {
      Key: TagKeys.LetsGoVersion,
      Value: version,
    },
    {
      Key: TagKeys.LetsGoDeployment,
      Value: deployment,
    },
    {
      Key: TagKeys.LetsGoRegion,
      Value: region,
    },
    {
      Key: TagKeys.LetsGoUpdated,
      Value: new Date().toISOString(),
    },
  ];
  if (additionalTags) {
    tags.push(
      ...Object.entries(additionalTags).map(([Key, Value]) => ({ Key, Value }))
    );
  }
  return tags;
}
