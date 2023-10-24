import { DBItem } from "@letsgo/db";

export function pruneResponse(item: DBItem) {
  const response: any = { ...item };
  delete response.key;
  delete response.category;
  delete response.ttl;
  return response;
}
