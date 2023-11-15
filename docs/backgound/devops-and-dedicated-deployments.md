## Devops and dedicated deployments

LetsGo takes a very first class approach to devops. The [LetsGo CLI](../reference/letsgo-cli.md) is treated as an integral part of the platform. It allows for creation of new deployments of the application in AWS as well as management of existing ones. It supports managing trust, inspecting the database, checking the status of the deployment, helping with the setup of a custom domain, and managing deployment configuration.

Using the LetsGo CLI you can deploy your app to any AWS region in minutes.

### Dedicated deployments

The vast majority of SaaS applications out there start as singletons. From the customer's perspective, the application offers a fixed set of endpoints in the cloud. From the developer's perspective, it is a set of components deployed to the cloud in a specific data center that offers those endpoints.

The devops story at this stage usually revolves around the quickest path to deploying new code artifacts and configuration to the cloud. Frequently, elements of the architecture that require a one-time setup are created manually at the start of the project, and there is no repeated, automated way to re-deploying them (e.g. IAM policies, ECR repositories, S3 buckets). Often this situation degenerates into other parts of the application making assumptions about the existence of such components.

This is a source of major technical debt once you reach the point of maturity that requires the management of multiple deployments. Multiple deployments may be necessary for a variety of reasons:

- You may want to segragete your production and staging environments.
- You may want every developer on your team to have their own environment in the cloud.
- Your customers, are asking for a dedicated deployment option either on your AWS account or on theirs. This is often the case with B2B apps.
- Your customers demand that certain data locality requiremets are met, which requires multiple, isolated deployments in various geographical locations.

At that point, an application that started off as a singleton in the cloud singleton faces a major hurdle - how to put itself back in-the-box of a repeatable devops process that can start from the bare cloud infrastructure and re-create all application components from scratch.

LetsGo solves this problem for you by providing this repeatable process on day one:

- The LetsGo CLI allows you to create a manage your application in the cloud regardless of the number of instances you need. It works just as well when you run a singleton instance as a public, shared SaaS offering, as well as when you run 100s of dedicated deployments for your customers.
- Every LetsGo deployment is fully independent from other deployments (there are no components shared between deployments).
- Every LetsGo deployment is highly isolated from other deployments. The default IAM policies prevent code of one deployment from accessing data of another.

Read more about how to [manage multiple deployments](../how-to/manage-multiple-deployments.md).

### Related topics

[LetsGo CLI](../reference/letsgo-cli.md)  
[Why LetsGo?](../why.md)  
[Architecture and technology choices](./architecture-and-technology-choices.md)
