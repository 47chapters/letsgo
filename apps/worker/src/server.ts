import "dotenv/config";
import { handler } from "./index";
import { createServer, ServerResponse } from "http";
import { EventBridgeEvent } from "aws-lambda";
import parser from "cron-parser";

// Set up an HTTP listener to receive messages simulating invocations from SQS Event Source Mapping

const port = process.env.PORT || 3002;

const httpError = (
  res: ServerResponse,
  statusCode: number,
  message: string
) => {
  res.statusCode = statusCode;
  res.end(JSON.stringify({ statusCode, message }, null, 2));
};

const server = createServer((req, res) => {
  if (req.method !== "POST" || req.url !== "/") {
    return httpError(res, 400, "Bad request. Only POST / is accepted.");
  }
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", async () => {
    let parsedBody: any;
    try {
      parsedBody = JSON.parse(body);
    } catch (e: any) {
      return httpError(res, 400, "Bad request. Body must be JSON.");
    }
    res.statusCode = 201;
    res.end();
    try {
      const result = await handler(parsedBody, {} as any, (error, result) => {
        throw new Error(
          "Handler's callback call is not supported. Return a promise instead."
        );
      });
    } catch (e: any) {
      console.log(
        "WORKER HANDLER ERROR PROCESSING QUEUED MESSAGE:",
        e.stack || e.message || e
      );
    }
  });
});

server.listen(port, () => {
  console.log(`worker running on ${port}`);
});

// Set up timer to simulate events scheduled by the EventBridge scheduler

const schedule = process.env.LETSGO_WORKER_SCHEDULE;
const timezone = process.env.LETSGO_WORKER_SCHEDULE_TIMEZONE || "UTC";

function createSyntheticScheduledEvent(): EventBridgeEvent<
  "Scheduled Event",
  any
> {
  return {
    version: "0",
    id: "f365819b-db33-4179-972f-434b0c783b3c",
    "detail-type": "Scheduled Event",
    source: "aws.scheduler",
    account: "123456789012",
    time: new Date().toISOString(),
    region: "us-west-2",
    resources: [
      "arn:aws:scheduler:us-west-2:123456789012:schedule/letsgo-main-worker/letsgo-main-worker",
    ],
    detail: "{}",
  };
}

async function scheduleEvent() {
  try {
    const result = await handler(
      createSyntheticScheduledEvent(),
      {} as any,
      (error, result) => {
        throw new Error(
          "Handler's callback call is not supported. Return a promise instead."
        );
      }
    );
  } catch (e: any) {
    console.log(
      "WORKER HANDLER ERROR PROCESSING SCHEDULED EVENT:",
      e.stack || e.message || e
    );
  }
}

function runCron(cron: string) {
  const schedule = parser.parseExpression(cron, { tz: timezone });
  let next: parser.CronDate;
  try {
    next = schedule.next();
  } catch (e: any) {
    console.log(
      `ERROR: unable to evalue CRON expression '${cron}' with timezone '${timezone}': ${e.message}. The scheduler is disabled.`
    );
    return;
  }
  setTimeout(() => {
    scheduleEvent();
    runCron(cron);
  }, next.getTime() - new Date().getTime()).unref();
}

function runRate(rate: number) {
  setInterval(scheduleEvent, rate).unref();
}

if (schedule) {
  let match = schedule.match(/cron\(([^\)]+)\)/);
  const cron = match?.[1];
  match = schedule.match(
    /rate\((\d+)\s+(minute|minutes|hour|hours|day|days)\)/
  );
  const [rateValue, rateUnit] = match?.slice(1) || [];

  if (!cron && (!rateValue || !rateUnit)) {
    console.log(
      `WARNING: invalid LETSGO_WORKER_SCHEDULE value of "${schedule}". Must be "cron(<cron expression>)" or "rate(<value> <unit>)". The scheduler is disabled.`
    );
  } else if (rateValue && rateUnit) {
    let rate: number | undefined = undefined;
    switch (rateUnit) {
      case "minute":
      case "minutes":
        rate = 1000 * 60 * parseInt(rateValue);
        break;
      case "hour":
      case "hours":
        rate = 1000 * 60 * 60 * parseInt(rateValue);
        break;
      case "day":
      case "days":
        rate = 1000 * 60 * 60 * 24 * parseInt(rateValue);
        break;
    }
    console.log("worker scheduler running with", schedule);
    rate && runRate(rate);
  } else if (cron) {
    console.log("worker scheduler running with", schedule);
    runCron(cron);
  }
} else {
  console.log(
    `INFO: The scheduler is disabled. Set the LETSGO_WORKER_SCHEDULE to run the scheduler. `
  );
}
