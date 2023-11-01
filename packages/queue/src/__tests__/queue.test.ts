import "dotenv/config";
process.env.LETSGO_LOCAL_QUEUE_URL = "http://localhost:3102";
import { enqueue } from "..";
import { createServer, Server } from "http";

describe("queue", () => {
  let server: Server;
  let messages: any[] = [];

  beforeAll(async () => {
    await new Promise(
      (resolve) =>
        (server = createServer((req, res) => {
          let body = "";
          req.on("data", (chunk) => (body += chunk));
          req.on("end", async () => {
            let parsedBody: any;
            try {
              parsedBody = JSON.parse(body);
            } catch (e: any) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: e.message }));
              return;
            }
            messages.push(parsedBody);
            res.statusCode = 201;
            res.end();
          });
        }).listen(3102, () => {
          resolve(undefined);
        }))
    );
  });

  beforeEach(async () => {
    messages = [];
  });

  afterAll(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve(undefined)))
    );
  });

  it("enqueue exists", async () => {
    expect(enqueue).toBeDefined();
  });

  it("enqueue works", async () => {
    const result = await enqueue({ type: "custom", payload: "test" });
    expect(result).toBeDefined();
    expect(result.messageId).toBeDefined();
    expect(messages.length).toBe(1);
    expect(messages[0].Records).toBeDefined();
    expect(messages[0].Records.length).toBe(1);
    expect(messages[0].Records[0]).toMatchObject({
      messageId: result.messageId,
      // receiptHandle: "79joa41mt7d",
      body: '{"type":"custom","payload":"test"}',
      attributes: {
        ApproximateReceiveCount: "1",
        // "SentTimestamp": "1698859997224",
        // "SenderId": "letsgo:local:tomek",
        // "ApproximateFirstReceiveTimestamp": "1698859997224"
      },
      messageAttributes: {},
      md5OfBody: "{md5}",
      eventSource: "letsgo:local",
      // "eventSourceARN": "letsgo:local:tomek",
      // "awsRegion": "us-west-2"
    });
  });
});
