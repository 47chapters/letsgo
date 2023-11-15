## Authentication, authorization, and trust

Users of your app need to log into the management dashboard ([develop the frontend](./develop-the-frontend.md)) and call your HTTP APIs ([develop the API](./develop-the-api.md)), and you need to provide a secure way for them do so. This is usually a two-stage process:

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

1. Is in the [JWT](https://datatracker.ietf.org/doc/html/rfc7519) format.
1. Is signed by an issuer that is trusted.
1. Has the `aud` claim matching the audience value expected by your deployment (`letsgo:service` by default).

The essence of the model is the decision whom you trust to issue the access tokens.

### Trusted issuers

LetsGo has two types of trusted issuers of the JWT tokens it accepts:

1. Third-party issuers like [Auth0](https://auth0.com).
1. Built-in issuers, which use PKI credentials configured by you.

The [manage trust and authentication](../how-to/manage-trust-and-authentication.md) article explains how to set up trusted issuers in your system.

#### Third party issuers

Enabling trust to a third-party issuer requires providing two pieces of information:

1. The issuer identifier, corresponding to the `iss` claim in the JWT tokens created by that issuer.
1. The [JWKS](https://datatracker.ietf.org/doc/html/rfc7517) endpoint that specifies the public keys of the issuer to be used when validating signature of JWT tokens.

This way, the validity of an access token presented by the caller can be checked by:

1. Extracting the `iss` claim from the access token.
1. Looking up the JWKS endpoint corresponding to that `iss` value in the LetsGo configuration.
1. Obtaining the public keys of the issuer from that endpoint.
1. Validating the signature of the access token using those public keys.

The [Setting up authentication with Auth0](../tutorials/setting-up-authentication-with-auth0.md) walks you through the process of configuring Auth0 as a trusted third-party issuer of JWT tokens.

#### Built-in PKI issuers

In addition to trusting third-party issuers, you can create issuers that are internal to your LetsGo deployment. These issuers are using the private key of an RSA public/private key pair to sign the access tokens they issue. These issuers are called built-in PKI issuers.

When you add a new built-in PKI issuer, a public/private RSA key pair is automatically generated for them and stored in the system. In addition, they are associated with a unique `iss` value that is added to the access tokens they create.

This way, the validity of an access token presented by the caller can be checked by:

1. Extracting the `iss` claim from the access token.
1. Looking up the built-in PKI issuer corresponding to that `iss` value in LetsGo configuration.
1. Obtaining the public key of the issuer from the LetsGo database.
1. Validating the signature of the access token using this public key.

You can have multiple built-in PKI issuers configured in the system, which enables you to roll over the PKI credentials without downtime.

One of the PKI issuers can be designated as _active_. The system uses this issuer when it needs to create an access token internally for accessing the HTTP APIs. The main use case is to enable the _worker_ component to make calls to the endpoints exposed by the _API_. You can read more about it in [developing the worker](./develop-the-worker.md).

Another use of the active PKI issuer is to create ad-hoc JWT access tokens for testing. You can read more about it in [managing trust and authentication](../how-to/manage-trust-and-authentication.md#creating-ad-hoc-access-tokens).

### Authorization

LetsGo does not prescribe any authorization model. It is up to you to decide how you model permissions and authorization decisions in your app given an authenticated user.

Having said that, LetsGo supports a [tenancy model](./tenants-and-users.md) which has implications on the permissions of a user to perform operations related to specific tenants of your app. Out of the box, LetsGo implements a very simple authorization model for these tenant-specific operations:

1. A user who is a member of tenant can perform all operations on that tenant.
1. A user who is not a member of tenant cannot perform any operations on that tenant.
1. A caller using an access token issued by a trusted built-in PKI issuer can perform all operations on all tenants.

These authorization decisions in the _API_ component are implemented by the [authorizeTenant middleware](../how-to/develop-the-api.md#the-authorizetenant-middleware).

**NOTE** The permission of the bearer of an access token issued by a built-in issuer to perform all operations on all tenants gives a very broad authority to built-in issuers. You can easily decide whether to allow it or not on a per-HTTP-API basis using a flag passed to the [authorizeTenant middleware](../how-to/develop-the-api.md#the-authorizetenant-middleware).

Access tokens created by the built-in issuer using either of the two methods above have the same value of the `iss` and `sub` claims. The value has the format `letsgo:{random-identifier}`. You need to account for such access tokens when making authorization decisions following a successful authentication in the _API_ component.

### Related content

[Manage trust and authentication](../how-to/manage-trust-and-authentication.md)  
[Setting up authentication with Auth0](../tutorials/setting-up-authentication-with-auth0.md)  
[Developing the worker](../how-to/develop-the-worker.md)  
[Developing the API](../how-to/develop-the-api.md)
