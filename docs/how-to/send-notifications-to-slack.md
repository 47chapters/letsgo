## Send notifications to Slack

One challenge with middle-tier and background work is that it happens behind the scenes, and the outcome of the processing is difficult to observe as it happens. Logs are collected in CloudWatch, but these are usually used for post-mortem analysis.

In the early stages of product development, and in the early stages of startup life, it is often useful and exciting to be notified in real-time about interesting events happening in the system. A customer just paid you a monthly subscription fee. A new customer signed up. A customer upgraded their plan from freemium to paid. A customer churned. One useful way of staying on top of such events is to send an automated notification to Slack.

LetsGo boilerplate makes sending notifications to Slack easy.

First, create a [Slack incoming webhook](https://api.slack.com/messaging/webhooks) that allows sending notifications to a specific channel in your Slack workspace. You will end up with a URL that looks similar to `https://hooks.slack.com/services/T05U3L3AHGV/B0....QNB/U0F....RrQ`.

Add a new environment variable to `apps/worker/.env` and `apps/api/.env` files to enable slack notifications when [running locally](../tutorials/building-and-running-locally.md):

```bash
LETSGO_SLACK_URL={your-slack-incoming-webhook-url}
```

Set the same environment variable in your cloud deployment and re-deploy the _worker_ and _API_ components:

```bash
yarn ops config set LETSGO_SLACK_URL={your-slack-incoming-webhook-url}
yarn ops deploy -a worker -a api
```

And you are done! Out of the gate, LetsGo will now be sending notifications to Slack when new tenants are created, existing tenants are deleted, and on all Stripe events received via Stripe webhooks, including the most precious one:

<img width="388" alt="image" src="https://github.com/tjanczuk/letsgo/assets/822369/73166dd0-bee4-4cbf-9cad-f279eaef6211">

If you want to add Slack notifications for a message handler you are adding to the _worker_ component or a new endpoint in the _API_, you can use the `sendSlackMessage` facility function provided by LetsGo in the `@letsgo/slack` package:

```typescript
import { sendSlackMessage } from "@letsgo/slack";

await sendSlackMessage(":boom::moneybag: New mega deal closed!");
```

You can leave the calls to `sendSlackMessage` in the code - they become a no-op if the `LETSGO_SLACK_URL` variable is not defined in the environment.

### Related topics

[Develop the worker](./develop-the-worker.md)  
[Develop the API](./develop-the-api.md)  
[@letsgo/slack](../reference/letsgo-slack/README.md)
