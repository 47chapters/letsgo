## Architecture and technology choices

LetsGo provides a foundation for a SaaS application which is opinionated in some areas an unopininated in others. This article should help you decide if it is a good fit for your app.

### Architecture

Many SaaS applications consist of similar set components:

- A marketing website
- A management dashboard for customers
- HTTP APIs
- A worker behind a queue to process asynchronous work
- A database

LetsGo includes all of these components in the LetsGo platform:

<img width="837" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/f7fe2317-d7de-4698-b093-416a52a1a145">

The _web_ component implements both the marketing website and the management dashboard. The management dashboard portion of the _web_ component requires user authentication, which is part of the LetsGo platform.

The _API_ component exposes HTTP APIs of your application. These APIs are meant to be consumed by the management dashboard in the _web_ component, as well as by your customers directly. LetsGo supports securing the HTTP APIs. LetsGo also provides an implementation of a number of endpoints related to concepts it has an opinion about, for example [Tenants and users](./tenants-and-users.md).

The _worker_ component processes asynchronous work and is deployed behind a queue. New work for the _worker_ is enqueued by the _API_ component in the implementation of the various HTTP endpoints. The worker contains scaffolding for some aspects of the app, for example [Stripe webhooks](../how-to/develop-the-worker.md), while remaining extensible to other types of asynchronous work you may want to introduce.

The _database_ component supports persistent storage of data in your app. It is used from the _API_ and _worker_ components.

Part of the LetsGo platform is a prescriptive model for [authentication and trust](./authentication-authorization-and-trust.md). It provides a way for securing access to the management dasboard that is part of the _web_ component, as well as the HTTP APIs implemented in the _API_ component.

Many SaaS businesses offer a subscription-based pricing models. LetsGo supports managing the subscription lifecycle for tenants of your app.

As part of the platform, LetsGo supports a [tenancy model](./tenants-and-users.md) that provides a basis for building B2B applications. It enables you to have multiple tenants, each with several users. Users can also have access to several tenants. LetsGo supports membership management, including a user invitation flow.

Lastly, a very important part of the LetsGo platform is the [devops model and tooling](./devops-and-dedicated-deployments.md). It was designed to facilitate your own devops story including CI/CD, but also support dedicated deployments of your app for your B2B customers.

### Technology choices

The technology choices in LetsGo had been dictated by the desire to make working with LetsGo exciting during the day and boring at night, while future-proofing your application to the foreseable extent. This means striking a balance between modern technologies that are at the same time battle-tested and avoiding vendor-specific solutions.

LetsGo embraces JavaScript-based technologies, including [Node.js](https://nodejs.org/) and [Typescript](https://www.typescriptlang.org/), across all of the components containing code (_web_, _API_, _worker_). While other technologies are more suitable in specific circumstances, JavaScript remains the most popular programming language on the planet, with a readily available expertise and talent base.

LetsGo targets excusively [Amazon Web Services](https://aws.amazon.com/) (AWS) as the cloud provider of choice. While no strong technical reason exists to choose AWS over other cloud providers, it was a matter of focusing the energy on the one cloud provider that is the leader of the pack and the popular choice for new SaaS applications.

LetsGo normalizes on [Docker](https://www.docker.com/), specifically Docker images, as a packaging mechanism for application code, and on environment variables as a runtime representation of all configuration settings. This applies to all code components of your app (_web_, _API_, _worker_). While AWS often provides a vendor-specific code distribution mechanisms that may be more efficient, docker images provides the most flexibility when it comes to changing your hosting model in the future, including moving to a different cloud provider.

The _web_ component is a [Next.js](https://nextjs.org/) application based on the [App Router](https://nextjs.org/docs/app) paradigm. Next.js is based on the [React](https://react.dev/) framework, which remains the most popular frontend framework today with an ongoing investments and support.

The _API_ component is an [Express](https://expressjs.com/) HTTP server. Express is the most popular server-side framework for implementing HTTP applications and it existed for years.

Both the _web_ and _API_ components are deployed as separate [AWS AppRunner](https://aws.amazon.com/apprunner/) services. Across the different ways of hosting HTTP workloads in AWS, the AppRunner strikes a balance between simplicity and control that feels adequate for new SaaS applications. Given that integration with the AppRunner relies on Docker images, there is a relatively easy migration path to a more complex and flexible hosting solution like AWS ECS if your app needs it in the future.

The _worker_ component is a TypeScript module deployed as an [AWS Lambda function](https://aws.amazon.com/pm/lambda) behind an [AWS SQS Standard Queue](https://aws.amazon.com/pm/sqs). This is a rather conventional way of implementing the worker in AWS with a long history behind it and the stability that comes with it.

The _database_ consists of a single [DynamoDB](https://aws.amazon.com/pm/dynamodb) table with a very specific structure and usage patten desribed in [Data model](./data-model.md). AWS offers a large selection of database solutions, and many would not even consider DynamoDB a "database" (although it certinaly meets the [Merriam-Webster definition](https://www.merriam-webster.com/dictionary/database)). Dynamo was selected for a few reasons. It has a long history behind it with the stability that comes with it. It has a pure play-as-you-go pricing model. Lastly, and perhaps most importantly, its feature set is very limited, which makes the migration to a more sophisticated database solution easy, in case you need it.

### Technology un-choices

One of the areas where LetsGo is completely unopinionated is the UI framework or a design system for the _web_ component. This is where most apps want to bring out their own ideas to differentiate themselves. LetsGo makes it abundantly clear you need to bring your own UI framework and design system by using plain HTML with the black Times New Roman font on white background across all components of the _web_.

### Related topics

[Tenants and users](./tenants-and-users.md)  
[Data model](./data-model.md)  
[Authentication, authorization, and trust](./authentication-authorization-and-trust.md)  
[Devops and dedicated deployments](./devops-and-dedicated-deployments.md)
