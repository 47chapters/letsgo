import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";

let accountId: string;

export async function getAccountId(): Promise<string> {
  if (!accountId) {
    const sts = new STSClient({});
    const result = await sts.send(new GetCallerIdentityCommand({}));
    accountId = result.Account || "";
  }
  return accountId;
}
