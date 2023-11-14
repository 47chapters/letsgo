## Why LetsGo?

New SaaS businesses cut corners that are hard to fix later. LetsGo provides a foundation to prevent this.

When you start a new SaaS application, you often optimize for the time to market. In the process, decisions are made that reduce the near term work while creating technical debt. If your business shows the signs of traction, the time comes to address this debt. But making fundamental architecture changes with customers in production is expensive. It is like changing breaks on a running train. At one point, many early stage SaaS businesses find themselves in a situation where it is hard to make progress and evolve the product.

![image](https://github.com/tjanczuk/letsgo/assets/822369/86a44b85-00da-49a7-b91f-7bc71d4406b1)

The root of the problem is lack of a proper foundation to build a new SaaS application on. On the operations side, AWS provides a vast selection of fantastic building blocks to build your app from, but you still have to write a lot of code to combine them all together and provide a proper devops experience around. On the product side, many of the SaaS applications solve all the same problems over and over: a marketing site, a management dashboard, API, worker behind a queue, authentication, payment processing. All of this boilerplate work stands in your way to working on the core product, so it becomes a natural target for cuts.

This is where LetsGo comes in. It provides the architecture and the tooling that will put your startup on a solid foundation from day one. It cuts months of work leading to the launch, while allowing you to focus on the essence of your product. The day you let the fist customer in, you have no technical debt. As you grow, you can continue focusing your resources on what matters most: your customers and your product.

<img width="837" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/f7fe2317-d7de-4698-b093-416a52a1a145">

LetsGo does it by providing a prescriptive architecture implemented with a modern set of technologies and a robust operational tooling for managing your app in AWS. On day one you get more than most startups build in the first two years of existence. This is what LetsGo provides you with:

- An application architecture with a **web, HTTP API, worker, and a database components**, all wired up and ready to go.
- A **devops CLI** that helps you set up CI/CD and manage several deployments of your app in AWS to help you segregate your production and development workloads or to support dedicated deployments for your customers.
- **Integration with Auth0** to authenticate your users and protect your APIs.
- **Integration with Stripe** to automate your billing and subscription lifecycle management.
- **Integration with Slack** to keep current with new customers signing up and subscriptions being paid.
- A **flexible tenancy and user model** with membership management and invitation flow.
- A set of modern yet robust technologies including Next.js and Node.js that **make your days exciting and the nights boring**.
- LetGo is **OSS under MIT**, so there is no vendor lock-in and you can always see what makes it tick.

LetsGo isn't for everybody. Not all apps have the shape that fits LetsGo architecture. The choice of technologies does not make the sense for all scenarios. Yet this architecture and tech stack works for the 80% of the products out there.

Is LetsGo for you? The best way to find out is to [go over the tutorials](./tutorials.md). You may find that by spending an hour you saved yourself a few months of work now or a year of work later.

Let's go!
