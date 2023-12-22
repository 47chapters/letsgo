import { Auth0EnsureEnvironmentVariables } from "components/EnsureEnvironmentVariables";

export default Auth0EnsureEnvironmentVariables;

// Force this page to be evaluated on the server side on a per-request basis
// to make the runtime environment variables available to the page.
export const dynamic = "force-dynamic";
