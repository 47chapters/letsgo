![Check Markdown Links](https://github.com/47chapters/letsgo/actions/workflows/action.yaml/badge.svg?event=push)

# LetsGo - A Starter Kit for Starting Startups

New SaaS businesses cut corners that are hard to fix later. LetsGo gives you a foundation to prevent this.

This project provides you with the architecture and the tooling that will put your startup on a solid foundation from day one. It helps you save months of work leading to the launch while allowing you to focus on the essence of your product. The day you let the first customer in, you have no technical debt. As you grow, you can continue focusing your resources on what matters most: your customers and your product.

<img width="950" alt="LetsGo Architecture" src="https://github.com/47chapters/letsgo/assets/822369/c9e803b3-c2ee-4b2e-b8a4-16e107342c4e">

LetsGo does it by providing a prescriptive architecture implemented with a modern set of technologies and robust operational tooling for managing your app in AWS. On day one you get more than most startups build in the first two years:

- An application architecture with a **web, HTTP API, worker, and database components**, all wired up and ready to go.
- A **devops CLI** that helps you set up CI/CD and manage several deployments of your app in AWS to help you segregate your production and development workloads or to **support dedicated deployments** for your customers.
- **Integration with Auth0** to authenticate your users and protect your APIs.
- **Integration with Stripe** to automate your billing and subscription lifecycle management.
- **Integration with Slack** to keep current with new customers signing up and subscriptions being paid.
- A **flexible tenancy and user model** with membership management and invitation flow.
- A set of modern yet robust technologies including Next.js, Node.js, and Typescript that **make your days exciting and the nights boring**.
- LetsGo is **OSS under MIT**, so there is no vendor lock-in and you can always see what makes it tick.

## Getting started

Learn more about the [architecture, technology choices, and principles](./docs/backgound/architecture-and-technology-choices.md) or jump right into [your first deployment to AWS](./docs/tutorials/first-deployment-to-aws.md) tutorial.

If you run into a problem or have a question, [file an issue](https://github.com/tjanczuk/letsgo/issues)

Let's go!

## Documentation

### Overview

[Why LetsGo?](./docs/backgound/why.md)

### Tutorials

[First deployment to AWS](./docs/tutorials/first-deployment-to-aws.md)  
[Building and running locally](./docs/tutorials/building-and-running-locally.md)  
[Re-deploying to AWS](./docs/tutorials/re-deploying-to-aws.md)  
[Setting up authentication with Auth0](./docs/tutorials/setting-up-authentication-with-auth0.md)  
[Setting up payments with Stripe](./docs/tutorials/setting-up-payments-with-stripe.md)  
[Configuring a custom domain](./docs/tutorials/configuring-custom-domain.md)

### How-Tos

[How to use LetsGo?](./docs/how-to/how-to-use-letsgo.md)  
[Run locally](./docs/how-to/run-locally.md)  
[Run tests](./docs/how-to/run-tests.md)  
[Develop the frontend](./docs/how-to/develop-the-frontend.md)  
[Develop the API](./docs/how-to/develop-the-api.md)  
[Develop the worker](./docs/how-to/develop-the-worker.md)  
[Enqueue asynchronous work](./docs/how-to/enqueue-asynchronous-work.md)  
[Schedule asynchronous work](./docs/how-to/schedule-asynchronous-work.md)  
[Access data in the database from code](./docs/how-to/access-data-in-the-database-from-code.md)  
[Process the contact form](./docs/how-to/process-the-contact-form.md)  
[Manage configuration](./docs/how-to/manage-configuration.md)  
[Manage multiple deployments](./docs/how-to/manage-multiple-deployments.md)  
[Manage trust and authentication](./docs/how-to/manage-trust-and-authentication.md)  
[Get deployment status](./docs/how-to/get-deployment-status.md)  
[Manage the pricing model and Stripe integration](./docs/how-to/manage-the-pricing-model.md)  
[Send notifications to Slack](./docs/how-to/send-notifications-to-slack.md)  
[Manage scalability](./docs/how-to/manage-scalability.md)  
[Remove deployments](./docs/how-to/remove-deployments.md)

### Background Concepts

[Architecture and technology choices](./docs/backgound/architecture-and-technology-choices.md)  
[Tenants and users](./docs/backgound/tenants-and-users.md)  
[Data model](./docs/backgound/data-model.md)  
[Authentication, authorization, and trust](./docs/backgound/authentication-authorization-and-trust.md)  
[DevOps and dedicated deployments](./docs/backgound/devops-and-dedicated-deployments.md)

### Reference

[LetsGo CLI (yarn ops)](./docs/reference/letsgo-cli.md)  
[System database categories](./docs/reference/system-database-categories.md)  
[@letsgo/constants](./docs/reference/letsgo-constants/README.md)  
[@letsgo/db](./docs/reference/letsgo-db/README.md)  
[@letsgo/pricing](./docs/reference/letsgo-pricing/README.md)  
[@letsgo/queue](./docs/reference/letsgo-queue/README.md)  
[@letsgo/slack](./docs/reference/letsgo-slack/README.md)  
[@letsgo/stripe](./docs/reference/letsgo-stripe/README.md)  
[@letsgo/tenant](./docs/reference/letsgo-tenant/README.md)  
[@letsgo/trust](./docs/reference/letsgo-trust/README.md)  
[@letsgo/types](./docs/reference/letsgo-types/README.md)
