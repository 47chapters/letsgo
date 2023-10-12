import { TagKeys, VendorPrefix } from "@letsgo/constants";

export const ConfigPrefix = `/${VendorPrefix}`;

const version = require("../../../../package.json").version;

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

export function getTagsAsObject(
  region: string,
  deployment: string,
  additionalTags?: { [key: string]: string }
) {
  return getTags(region, deployment, additionalTags).reduce(
    (acc: { [key: string]: string }, cur) => {
      acc[cur.Key] = cur.Value;
      return acc;
    },
    {}
  );
}
