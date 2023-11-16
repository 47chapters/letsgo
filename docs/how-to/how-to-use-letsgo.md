## How to use LetsGo?

LetsGo is organized as a monorepo. Using LetsGo means cloning the repository and then modifying it to implement your own application. In the course of the development, you will be modifying the boilerplate code of the three major components included in the monorepo: the website, the HTTP API, and the worker. You will be also using the devops tool included in the repository to help manage the development lifecycle: deploy the application to AWS, manage production/stage environments, manage configuration, etc.

This is the high level flow of the steps you will follow when working with LetsGo along with the commands you will use:

```mermaid
flowchart LR
  subgraph sg1 ["Initial setup"]
    direction TB
    s1("Clone the repo

git clone")
    s2("Install dependencies

yarn install")
    s3("First deployment

yarn build
yarn buildx
yarn ops deploy")
    s4("Integrate Auth0 and Stripe

yarn ops config set
yarn ops deploy")
    s5("Setup custom domain

yarn ops domain add
yarn ops deploy")
    s1 --> s2 --> s3 --> s4 --> s5
  end

  subgraph sg2 ["Development cycle"]
    direction TB
    d1("Implement changes

code apps/...
code packages/...")
    d2("Run and test locally

yarn dev")
    d3("Deploy to AWS

yarn buildx
yarn ops deploy")
    d1 --> d2 --> d3 --> d1
  end

  sg1 --> sg2
```

The [First deployment to AWS](../tutorials/first-deployment-to-aws.md) tutorial covers the _Clone the repo_, _Install dependencies_, and _First deployment_ steps. The [Setting up authentication with Auth0](../tutorials/setting-up-authentication-with-auth0.md) shows how to integrate Auth0, and [Setting up payments with Stripe](../tutorials/setting-up-payments-with-stripe.md) walks you through integration with Stripe. Finally, [Configuring a custom domain](../tutorials/configuring-custom-domain.md) shows you how to host LetsGo in AWS using your own domain name.

The [Develop the frontend](./develop-the-frontend.md), [Develop the API](./develop-the-api.md), and [Develop the worker](./develop-the-worker.md) provide a good start point for writing code specific to your application. There are also many more specific [How-to](../README.md) topics relevant to specific aspects of development. The [Building and running locally](../tutorials/building-and-running-locally.md) tutorial show you how to run and test your app on your devevelopment machine. The [Re-deploying to AWS](../tutorials/re-deploying-to-aws.md) walks you through the deployment of the local changes you made to AWS.
