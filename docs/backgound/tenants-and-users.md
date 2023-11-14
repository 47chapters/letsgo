## Tenants and users

Most B2B applications have a concept of a _tenant_ which is separate from the concept of a _user_. LetsGo has a first class support for modeling tenants and users and their relationship, along with related concepts like subscription plans and invitations.

<img width="778" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/d9b562e8-363d-444c-a3ea-2bdebe4ccbd2">

A _tenant_ is unit of organization specific to the customer of the app. The concept may have different names depending on the domain of the app, for example a _team_, a _project_, an _organization_, or a _workspace_.

A _user_ of the app is a unique identity from the [authentication](./authentication-authorization-and-trust.md) perspective. In practical terms, in the context of accessing the app's functionality thorugh the browser, a user is a physical human being.

A _tenant_ may have multiple _users_. This represents a situation where multiple users have access to the same project, workspace, or a team, and is a frequent pattern in B2B apps.

A _user_ in turn may have access to multiple _tenants_. For example, Fubar and Fubaz are companies who are customers of your app. They are different _tenants_ in your system. Now, John is a contractor who works for both Fubar and Fubaz. John is a _user_ in our app who can access either _tenant_ Fubar or _tenant_ Fubaz. The way this manifests itself in the UI presented to the user in the _web_ component is via the tenant selector dropdown:

<img width="254" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/7ff31d3a-c2b3-4f96-8b69-11d931179dc8">

LetsGo also helps you manage subscription plans. In the LetsGo model, a _tenant_ is at all times associated with a specific _plan_ which describes the parameters of the service the app offers to that tenant. A plan may be a _freemium_ plan or a paid plan associated with a Stripe subscription.

### Invitations

LetsGo supports an invitation mechanism using which one user with access to a specic tenant can invite another user. By accepting the invitation, the other user also gains access to the tenant.
