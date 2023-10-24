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

import {
  getAccessToken,
  getSession,
  updateSession,
  withApiAuthRequired,
} from "@auth0/nextjs-auth0";
import { AppRouteHandlerFnContext } from "@auth0/nextjs-auth0/dist/helpers/with-api-auth-required";
import { NextRequest, NextResponse } from "next/server";
import { sortTenants } from "../../../../components/common";

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

const proxy = withApiAuthRequired(async function proxy(
  req: NextRequest,
  ctx: AppRouteHandlerFnContext
) {
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
      requestBody = await req.json();
    } catch (e: any) {
      return createError(
        400,
        `Error reading request body as JSON: ${e.message}`
      );
    }
  }
  const accessTokenResponse = new NextResponse();
  const { accessToken } = await getAccessToken(req, accessTokenResponse);
  const authorization = `Bearer ${accessToken}`;
  let responseBody: any = undefined;
  let apiResponse: Response;
  try {
    apiResponse = await fetch(apiUrl, {
      method: req.method,
      headers: { ...req.headers, authorization },
      ...(requestBody !== undefined
        ? { body: JSON.stringify(requestBody) }
        : {}),
    });

    if (method.proxyResponseBody) {
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

  const responseInit = {
    headers: { ...accessTokenResponse.headers, ...apiResponse.headers },
    status: apiResponse.status,
  };

  const res =
    responseBody !== undefined
      ? NextResponse.json(responseBody, responseInit)
      : new NextResponse(undefined, responseInit);

  if (
    apiPath === "v1/tenant" &&
    req.method.toUpperCase() === "POST" &&
    apiResponse.status === 200 &&
    responseBody
  ) {
    // The logged in user created a new tenant. Add it to the list of tenants in the user profile in the session
    const session = await getSession(req, res);
    if (session) {
      const tenants = session.user.tenants || [];
      tenants.push(responseBody);
      session.user.tenants = sortTenants(tenants);
      await updateSession(req, res, session);
    }
  }

  return res;
});

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

// Prevent any caching of responses
export const dynamic = "force-dynamic";
