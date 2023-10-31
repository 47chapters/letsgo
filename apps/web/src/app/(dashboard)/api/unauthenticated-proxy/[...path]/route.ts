/**
 * This route is a generic proxy that forwards _unauthenticated_ requests from the browser to the API server .
 * Requests to this route are authenticated using the same authentication mechanism as the rest of the web application -
 * an encrypted cookie is required. Upon receiving a request, this route will forward the request to the API server _without_
 * adding the bearer access token of the user logged into the browser.
 *
 * Request and response bodies, if present, are expected to be JSON.
 */

import proxyFactory from "../../proxy";

const proxy = proxyFactory({ addAccessTokenToRequest: false });

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;

// Prevent any caching of responses
export const dynamic = "force-dynamic";
