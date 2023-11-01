/**
 * This route is a generic proxy that forwards requests from the browser to the API server while re-writing security.
 * Requests to this route are authenticated using the same authentication mechanism as the rest of the web application -
 * an encrypted cookie is required. Upon receiving a request, this route will forward the request to the API server after
 * adding the bearer access token of the user logged into the browser in the Authorization header, refreshing it
 * if possible and necessary.
 *
 * Request and response bodies, if present, are expected to be JSON.
 *
 * This mechanism is in place to reduce the attack surface area by not exposing API access tokens to the browser.
 */

import { getAccessToken } from "@auth0/nextjs-auth0";
import { AppRouteHandlerFnContext } from "@auth0/nextjs-auth0/dist/helpers/with-api-auth-required";
import { NextRequest, NextResponse } from "next/server";

const methods: {
  [method: string]: { proxyRequestBody: boolean; proxyResponseBody: boolean };
} = {
  GET: {
    proxyRequestBody: false,
    proxyResponseBody: true,
  },
  POST: {
    proxyRequestBody: true,
    proxyResponseBody: true,
  },
  PUT: {
    proxyRequestBody: true,
    proxyResponseBody: true,
  },
  PATCH: {
    proxyRequestBody: true,
    proxyResponseBody: true,
  },
  DELETE: {
    proxyRequestBody: false,
    proxyResponseBody: true,
  },
  HEAD: {
    proxyRequestBody: false,
    proxyResponseBody: false,
  },
  OPTIONS: {
    proxyRequestBody: false,
    proxyResponseBody: false,
  },
};

const createError = (status: number, message: string) =>
  NextResponse.json(
    {
      status,
      message,
    },
    { status }
  );

export interface ProxyOptions {
  addAccessTokenToRequest: boolean;
}

export default function proxyFactory(options: ProxyOptions) {
  return async function proxy(req: NextRequest, ctx: AppRouteHandlerFnContext) {
    const apiBaseUrl = process.env["LETSGO_API_URL"];
    if (!apiBaseUrl) {
      return createError(
        500,
        "The LETSGO_API_URL variable is not set in the web environment."
      );
    }
    const method = methods[req.method.toUpperCase()];
    if (!method) {
      return createError(
        405,
        `The web application does not support proxying of HTTP ${req.method} requests. ` +
          `Supported methods are: ${Object.keys(methods).join(", ")}.`
      );
    }
    const apiPath = ((ctx["params"]?.path as string[]) || []).join("/");
    const apiUrl = `${apiBaseUrl}/${apiPath}${req.nextUrl.search}`;
    let requestBody: any = undefined;
    if (method.proxyRequestBody) {
      try {
        const text = await req.text();
        if (text.length > 0) {
          requestBody = JSON.parse(text);
        }
      } catch (e: any) {
        return createError(
          400,
          `Error reading request body as JSON: ${e.message}`
        );
      }
    }

    let authorization: string | undefined = undefined;
    let accessTokenResponse: NextResponse | undefined = undefined;
    if (options.addAccessTokenToRequest) {
      accessTokenResponse = new NextResponse();
      const { accessToken } = await getAccessToken(req, accessTokenResponse);
      authorization = `Bearer ${accessToken}`;
    }
    let responseBody: any = undefined;
    let apiResponse: Response;
    const fetchOptions = {
      method: req.method,
      headers: {
        ...req.headers,
        ...{ authorization },
        ...(requestBody !== undefined
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(requestBody !== undefined
        ? { body: JSON.stringify(requestBody) }
        : {}),
      redirect: "manual",
      mode: "cors",
    };
    try {
      // console.log(
      //   "PROXY UPSTREAM REQUEST",
      //   JSON.stringify({ apiUrl, fetchOptions }, null, 2)
      // );
      /* @ts-ignore */
      apiResponse = await fetch(apiUrl, fetchOptions);

      // console.log(
      //   "PROXY UPSTREAM RESPONSE",
      //   JSON.stringify(
      //     {
      //       status: apiResponse.status,
      //       headers: Object.fromEntries(apiResponse.headers.entries()),
      //     },
      //     null,
      //     2
      //   )
      // );
      if (method.proxyResponseBody && apiResponse.status != 302) {
        let responseText: string;
        try {
          responseText = await apiResponse.text();
          if (responseText.length > 0) {
            responseBody = JSON.parse(responseText.toString());
          }
        } catch (e: any) {
          return createError(
            502,
            `The web component received an HTTP ${apiResponse.status} response to the HTTP ${req.method} ${apiBaseUrl} request, ` +
              `but it cannot parse the response body as JSON: ${e.message}`
          );
        }
      }
    } catch (e: any) {
      return createError(
        502,
        `The web component is unable to proxy API request HTTP ${req.method} ${apiUrl} to the API server: ${e.message}`
      );
    }

    const headers = new Headers();
    if (accessTokenResponse) {
      accessTokenResponse.headers.forEach((value, key) =>
        headers.set(key, value)
      );
    }
    apiResponse.headers.forEach((value, key) => {
      // If we don't intend to proxy the response body, do not propagate the Content-* response headers.
      // This is the case with HTTP 302 responses.
      if (responseBody || !/^content-/i.test(key)) {
        headers.set(key, value);
      }
    });
    const responseInit: ResponseInit = {
      headers: Object.fromEntries(headers.entries()),
      status: apiResponse.status,
    };

    // console.log(
    //   "PROXY DOWNSTREAM RESPONSE",
    //   JSON.stringify({ responseBody, responseInit }, null, 2)
    // );
    const res =
      responseBody !== undefined
        ? NextResponse.json(responseBody, responseInit)
        : new NextResponse(undefined, responseInit);
    // console.log("ACTUALLY SENDING RESPONSE");
    return res;
  };
}
