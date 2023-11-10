## LetsGo - a Shoppify of software startups

You have a great idea and you are starting a startup that will change the world.

You are running lean in the race with time to hang the shingle. You cut the product scope to the bare minimum of the MVP. Even so, a lot of work remains. You start to cut corners where possible. A one-off, manual deployment of your app to AWS. Pricing page with fake signup buttons just to see if people click. Running async work in the web tier on a shoestring. The day you are ready for the first customer, you already have a mountain of technical debt. That debt will take ages to address once the engine is running. And it will compete for your time with all the product work your customers expect.

![image](https://github.com/tjanczuk/letsgo/assets/822369/86a44b85-00da-49a7-b91f-7bc71d4406b1)

Sounds familiar? Does it have to be this way? Can you start your startup on a solid foundation _without_ spending the time building it?

This is where LetsGo comes in. It provides the boilerplate architecture and the tooling that will put your startup on a solid foundation from day one. It cuts months of work leading to the launch, while allowing you to focus on the essence of your product. The day you let the fist customer in, you have no technical debt. As you grow, you can continue focusing your resources on what matters most: your customers and your product.

<img width="837" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/f7fe2317-d7de-4698-b093-416a52a1a145">

LetsGo does it by providing a prescriptive architecture implemented with a modern set of technologies and a robust operational tooling. On day one you get more than most startups build in the first two years of existence. This is what LetsGo provides you with:

- An application architecture with a **web, HTTP API, worker, and a database components**, all wired up and ready to go.
- A **devops CLI** that helps you set up CI/CD and manage several deployments of your app in AWS to help you segregate your production and development workloads or to support dedicated deployments for your customers.
- **Integration with Auth0** to authenticate your users.
- **Integration with Stripe** to automate your billing and subscription lifecycle management.
- **Integration with Slack** to keep current with new customers signing up and subscriptions being paid.
- A **flexible tenancy and user model** with membership management and invitation flow.
- A set of modern yet robust technologies including Next.js and Node.js that **make your days exciting and the nights boring**.
- LetGo is **OSS under MIT**, so there is no vendor lock-in and you can always see what makes it tick.

LetsGo isn't for everybody. Not all apps have the shape that fits LetsGo architecture. The choice of technologies does not make the cut for all scenarios. Yet this architecture and tech stack works for a great many products out there.

Is LetsGo for you? The best way to find out is to go over the tutorials, starting from [Your first deployment to AWS](tutorials/first-deployment-to-aws.md). You may find that by spending an hour you saved yourself a few months of work.

Let's go!
