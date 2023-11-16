## Configuring a custom domain

In this tutorial, you will configure custom domains for your _web_ and _API_ components. When you are done, you will be able to access the website and the HTTP APIs on your branded domain, e.g. https://contoso.com and https://api.contoso.com, in addition to the domain names provided by AWS.

<img width="387" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/e99a33c5-4a53-4af9-afbe-5f5c1d87d93b">

This tutorial assumes you have already [set up authentication with Auth0](setting-up-authentication-with-auth0.md) as there will be modifications necessary in your Auth0 configuration.

### Get your domain

You need to own a domain name to continue with this tutorial. You can buy a domain from one of the many domain registrars like [Namecheap](https://namecheap.com) or [GoDaddy](https://godaddy.com).

To continue with this tutorial, you must be able to manage DNS entries for your custom domain.

### Decide what domain names to use

The _web_ and _API_ components of your app will be running on distinct domain names. One common pattern is to host your website on the root domain, e.g. `contoso.com`, and the _API_ compnent on a subdomain, e.g. `api.contoso.com`.

Before continuing, decide what domain names will be used for the the _web_ and _API_ components. For illustration purposes, this tutorial will assume you are using `contoso.com` for your _web_ component, and `api.contoso.com` for the _API_.

### Configure the custom domain for the _web_ and _API_ components

Start by setting up a custom domain name for the _web_ component by running:

```bash
yarn ops domain add -a web contoso.com
```

Then set up a custom domain for the _API_ component by running:

```bash
yarn ops domain add -a api api.contoso.com
```

The output of these commands lists a number of required DNS records and will look simiar to this:

```text
...
  Required DNS records:

  Name           contoso.com.
  Type           CNAME
  Value          uuinv8zkks.us-west-2.awsapprunner.com

  Name           _cf80256c9338a3db39e16ad6eb57cdb5.contoso.com.
  Type           CNAME
  Value          _c44b8cad670f892da6fad43430e80251.smwfzlpyzn.acm-validations.aws.
  Status         PENDING_VALIDATION

  Name           _7bbeb27328981b41d0ebcb6930eaa6bf.2a57j77wh7zuoxja78n16sab4p8g6xi.contoso.com.
  Type           CNAME
  Value          _90921a66e19654e4bcf60a3ed3a8f5bd.smwfzlpyzn.acm-validations.aws.
  Status         PENDING_VALIDATION
...
```

You must now manually create these entries in your domain registrar to complete the set up of custom domains. This process is specific to the domain registrar you are using. For example, here is the process for [Namecheap](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/), and here for [GoDaddy](https://www.godaddy.com/help/manage-dns-records-680). Other domain registrars will have similar instructions.

**NOTE** Some domain name registrars have restrictions on the length of keys or values of the DNS records which may prevent you from setting up the required DNS records. As a workaround, you can set up a [Cloudflare](https://cloudflare.com) account and move the management of DNS records for your custom domain there by using Cloudflare's nameservers with your custom domain in your domain registrar.

### Monitor the status of your custom domain configuration

After you have added the required DNS records in your domain registrar, it may take up to 48 hours for the DNS system to fully propagate these changes (although it usually takes only minutes). During this time, you can monitor the status of your custom domain configuration by running this command for the _web_ component:

```bash
yarn ops domain status -a web
```

and this command for the _API_ component:

```bash
yarn ops domain status -a api
```

The output of the commands will look similar to this:

```text
  Domain         contoso.com
  Status         pending_certificate_dns_validation

  Required DNS records:

  Name           contoso.com.
  Type           CNAME
  Value          uuinv8zkks.us-west-2.awsapprunner.com

  Name           _cf80256c9338a3db39e16ad6eb57cdb5.contoso.com.
  Type           CNAME
  Value          _c44b8cad670f892da6fad43430e80251.smwfzlpyzn.acm-validations.aws.
  Status         PENDING_VALIDATION

  Name           _7bbeb27328981b41d0ebcb6930eaa6bf.2a57j77wh7zuoxja78n16sab4p8g6xi.contoso.com.
  Type           CNAME
  Value          _90921a66e19654e4bcf60a3ed3a8f5bd.smwfzlpyzn.acm-validations.aws.
  Status         PENDING_VALIDATION
```

As long as the _Status_ on the second line is different than `active`, your custom domain is not yet set up correctly. In the example output above the status is `pending_certificate_dns_validation`, which means the system was not yet able to confirm the DNS records were set up as required. This is _usually_ because of the lag in DNS record propagation and caching. Get a coffee and keep checking.

When you run the `yarn ops domain status ...` command and the output shows `active` in the top _Status_ line, your custom domain name has been configured correctly, for example:

```text
  Domain         contoso.com
  Status         active

  Required DNS records:

  Name           contoso.com.
  Type           CNAME
  Value          uuinv8zkks.us-west-2.awsapprunner.com

  Name           _cf80256c9338a3db39e16ad6eb57cdb5.contoso.com.
  Type           CNAME
  Value          _c44b8cad670f892da6fad43430e80251.smwfzlpyzn.acm-validations.aws.
  Status         SUCCESS

  Name           _7bbeb27328981b41d0ebcb6930eaa6bf.2a57j77wh7zuoxja78n16sab4p8g6xi.contoso.com.
  Type           CNAME
  Value          _90921a66e19654e4bcf60a3ed3a8f5bd.smwfzlpyzn.acm-validations.aws.
  Status         SUCCESS
```

Only after the _Status_ is `active` you can proceed to the next step.

### Update the Auth0 configuration

You must add your custom domain to the Auth0 configuration to inform Auth0 that your service is now available on a new set of URLs.

In the [Auth0 Management Dashboard](https://manage.auth0.com), navigate to _Applications / Applications_, locate the application you have created when [setting up authentication with Auth0](setting-up-authentication-with-auth0.md), go to the _Settings_ tab, find the _Application URIs_ section, and update the configuration as follows:

<!-- markdown-link-check-disable -->

- In _Allowed Callback URLs_, add the URL based on your custom domain name of the _web_ component, e.g. `https://contoso.com/api/auth/callback` (replace `contoso.com` with your domain name),
- In _Allowed logout URLs_ and in the _Allowed Web Origins_, add a URL based on your custom domain name of the _web_ component, e.g. `https://contoso.com/` (replace `contoso.com` with your custom domain name).
<!-- markdown-link-check-enable -->

<img width="1312" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/c9c9a123-21ef-4c4a-986e-0ec6503b464a">

Scroll down to the bottom of the page and click _Save Changes_.

### Re-deploy the app to AWS

Run the following command to re-deploy the app to AWS to complete the custom domain setup:

```bash
yarn ops deploy -a all
```

After deployment, you can confirm the status of the custom domain setup for the _web_ and _API_ components by running:

```bash
$ yarn ops status
...
Web
  Service
    Status         RUNNING
    Health         HTTP 200 (181ms)
    Url            https://uxb9hhcrtj.us-west-2.awsapprunner.com
    CustomDomain   contoso.com (active)
...
Api
  Service
    Status         RUNNING
    Health         HTTP 200 (157ms)
    Url            https://6ucstfkcn6.us-west-2.awsapprunner.com
    CustomDomain   api.contoso.com (active)
...
```

Notice the _CustomDomain_ properties showing the custom domain name and its status as `active` for the _web_ and _API_ components.

<!-- markdown-link-check-disable -->

### Access the website at the custom domain

Point the browser at your custom domain, e.g. `https://contoso.com`. You should see your website.

### Access the API at the custom domain

Invoke the health endpoint of your _API_ using the custom domain, e.g.

```bash
curl https://api.contoso.com/v1/health
```

<!-- markdown-link-check-enable -->

You should see an HTTP 200 response with a JSON response that includes the details, e.g.

```json
{
  "ok": true,
  "imageTag": "9225060f1903ddef",
  "updatedAt": "2023-11-04T22:08:24.392Z"
}
```

Congratulations! You have set up a custom domain for your _web_ and _API_ components! Your customers can access your website and call the HTTP APIs at the custom domain now. AWS will be taking care of providing and updating the SSL certificate for the secure endpoints.
