import { getAccessToken } from "@auth0/nextjs-auth0";

export interface ApiRequestOptions {
  path: string;
  method?: string;
  body?: any;
  noResponse?: boolean;
  accessToken?: string;
}

export function getApiUrl(relativeUrl: string) {
  return `${process.env["LETSGO_API_URL"]}${relativeUrl}`;
}

export async function apiRequest(
  options: ApiRequestOptions
): Promise<any | undefined> {
  const accessToken =
    options.accessToken || (await getAccessToken()).accessToken;
  const url = getApiUrl(options.path);
  const authorization = `Bearer ${accessToken}`;
  const method = options.method || "GET";
  const result = await fetch(
    url,
    options.body
      ? {
          method,
          headers: {
            authorization,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(options.body),
        }
      : {
          method,
          headers: {
            authorization,
          },
        }
  );

  if (!result.ok) {
    throw new Error(
      `Failed to HTTP ${method} ${url}: HTTP ${result.status} ${result.statusText}`
    );
  }

  if (options.noResponse) {
    return;
  } else {
    return await result.json();
  }
}
