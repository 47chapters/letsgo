## Manage trust and authentication

Your users need to log into the management dashboard ([develop the frontend](./develop-the-frontend.md)) and call your HTTP APIs ([develop the API](./develop-the-api.md)), and you need to provide a secure way for them do so. This is usually a two-stage process:

1. Authentication - having callers prove who they are.
1. Authorization - checking if they are allowed to do what they intend.

LetsGo uses Auth0 for authentication and the [Setting up authentication with Auth0](../tutorials/setting-up-authentication-with-auth0.md) tutorial walks you through the steps behind it. In this article we will look at how authentication works under the hood and how to manage trust in your LetsGo deployment.

### Access tokens

When calling an authenticated endpoint exposed by the _API_ component, the caller must present an access token in the `Authorization` header of the request, e.g.

```text
GET /v1/me
Authorization: Bearer ey....
```

The LetsGo model requires that the access token:

1. Is in [JWT](https://datatracker.ietf.org/doc/html/rfc7519) format.
1. Is signed by an issuer that is trusted.
1. Has the `aud` claim matching the audience value expected by your deployment.

The essence of the model is to decision who you trust to issue the access tokens you will accept.

### Trusted issuers

LetsGo has two types of trusted issuers of JWT tokens it accepts:

1. Third-party issuers like [Auth0](https://auth0.com).
1. Built-in issuers that use PKI credentials configured by you.

You can manage the trusted issuers with the `yarn ops issuer` command. For examle, you can see the list of trusted issuers for your deployment with:

```bash
yarn ops issuer ls
```

#### Third party issuers

You enable trust to a third-party issuer by providing two pieces of information in the configuration of your deployment:

1. The issuer identifier, corresponding to the `iss` claim in the JWT tokens created by that issuer.
1. The [JWKS](https://datatracker.ietf.org/doc/html/rfc7517) endpoint that specifies the public keys of the issuer to be used when validating signature of JWT tokens.

You enable trust to an issuer by running the following command:

```bash
yarn ops issuer add --issuer {issuer-identifier} --jwks {jwks-endpoint}
```

The [Setting up authentication with Auth0](../tutorials/setting-up-authentication-with-auth0.md) walks you through the process of configuring Auth0 as a trusted third-party issuer of JWT tokens.

#### Built-in PKI issuers

You add a built-in issuer of JWT tokens that uses a generated public/private key pair stored in your system with:

```bash
yarn ops issuer add --pki --pki-create
```

You can have multiple trusted PKI issuers configured in the system, which enables you to roll over the PKI credentials without downtime.

One of the PKI issuers can be designated as _active_. The system uses this issuer when it needs to create an access token internally for accessing the HTTP APIs. The main use case is to enable the _worker_ component to make calls to the endpoints exposed by the _API_. You can read more about it in [developing the worker](./develop-the-worker.md).

Another use of the active PKI issuer is to create ad-hoc JWT access tokens for testing. You can do this using the CLI with:

```bash
yarn ops jwt
```

You can conveniently generate such access tokens on the fly when making HTTP calls, e.g.:

```bash
curl http://localhost:3001/v1/foo/bar -H "Authorization: Bearer $(yarn -s ops jwt)"
```

You can also create those access tokens in code using the `createJwt` function exposed by the `@letsgo/trust` package:

```typescript
import { createJwt } from "@letsgo/trust";

const accessToken = await createJwt();
```

### Audience

For the access token to be trusted, the `aud` claim must match the value that your deployment expects. LetsGo uses a logical audience of `letsgo:service` by default. You can change this value to be something else using the `LETSGO_API_AUDIENCE` configuration property for the _API_ component, and the `AUTH0_AUDIENCE` configuration property for the _web_ component (assuming you have [configured Auth0 as your trusted issuer](../tutorials/setting-up-authentication-with-auth0.md)).

### Authorization

Access tokens created using the built-in issuer using either of the two methods above have the same value of the `iss` and `sub` claims. The value has the format `letsgo:{random-identifier}`. You need to account for such tokens when making any authorization decisions following a successful authentication.

### Related topics

[Setting up authentication with Auth0](../tutorials/setting-up-authentication-with-auth0.md)  
[Developing the API](./develop-the-api.md)  
[Developing the worker](./develop-the-worker.md)  
[LetsGo CLI](../reference/letsgo-cli.md)  
[@letsgo/trust](../reference/letsgo-trust.md)
