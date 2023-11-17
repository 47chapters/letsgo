import { Auth0Server, initAuth0 } from "@auth0/nextjs-auth0";

let auth0: Omit<Auth0Server, "withMiddlewareAuthRequired"> | undefined =
  undefined;

// Delay creation of Auth0 instance until first request is received to pick up
// the runtime environment variables.
export function getAuth0() {
  if (!auth0) {
    auth0 = initAuth0({
      secret: process.env["AUTH0_SECRET"],
      issuerBaseURL: process.env["AUTH0_ISSUER_BASE_URL"],
      baseURL: process.env["AUTH0_BASE_URL"],
      clientID: process.env["AUTH0_CLIENT_ID"],
      clientSecret: process.env["AUTH0_CLIENT_SECRET"],
    });
  }
  return auth0;
}
