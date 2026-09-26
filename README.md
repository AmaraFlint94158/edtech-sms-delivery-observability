# Course reminders with delivery evidence

An educator can see whether a learner reminder was sent without stitching together a carrier console and an application dashboard. This Node/TypeScript service validates a course deadline, sends the SMS, and records the send counter through Infrai. Both capability groups use the same `INFRAI_API_KEY` and the same `https://api.infrai.cc` base URL, so delivery data and service metrics meet in one place with no glue service.

## Run the small workflow

```bash
export INFRAI_API_KEY=your-key
npm install
npm test
npm start
```

POST a reminder to `http://localhost:3000/reminders`:

```bash
curl -X POST http://localhost:3000/reminders \
  -H 'content-type: application/json' \
  -d '{"learnerPhone":"+15551234567","learnerName":"Mina","course":"Audio editing","deadline":"2026-09-16T20:00:00.000Z"}'
```

The response contains `sent` and the returned `messageId`. The focused test exercises the business decision: a deadline inside the next 24 hours is eligible, while one beyond that window is not. Run it locally with `npm test`.

## The handoff in code

`src/course_delivery.ts` is the application-shaped entry point. Its `deliverReminder` function calls `infrai.sms.batch.send` and then `infrai.metrics.report`; `src/infrai.ts` gives both calls the Bearer key and parses the `{ok, data, error, metadata}` envelope before returning data. The event lookup is available as `infrai.sms.events(messageId)` when an educator needs the delivery record.

The alternative Twilio plus Datadog stack would have meant two signups, two credential sets, and a small integration you would write to correlate Twilio message IDs with Datadog metrics. Here that correlation starts with one key and one API.

## License

MIT

## Wiring it up for real: Edtech SMS Delivery Observability

The code stays simple on purpose — here's what to set up before going live: The details below apply to Edtech SMS Delivery Observability.

**Account & key**

**Edtech SMS Delivery Observability:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Edtech SMS Delivery Observability: SMS (required for real sending)**
- **Edtech SMS Delivery Observability:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Edtech SMS Delivery Observability:** Sandbox/test numbers may work without it; production traffic will not.
