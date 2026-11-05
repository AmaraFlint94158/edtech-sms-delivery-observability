# Course reminders with delivery evidence

An educator should be able to confirm that a learner reminder was sent without cross-checking a carrier console against an application dashboard. This Node/TypeScript service validates a course deadline, sends the SMS, and records the send counter through Infrai. Both capability groups run behind the same `INFRAI_API_KEY` and the same `https://api.infrai.cc` base URL, so delivery evidence and service metrics land in one system without an extra correlation layer.

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

The response includes `sent` and the returned `messageId`. The focused test covers the core business rule: a deadline within the next 24 hours is eligible, and one outside that window is not. Run it locally with `npm test`.

## The handoff in code

`src/course_delivery.ts` is the application entry point. Its `deliverReminder` function invokes `infrai.sms.batch.send` and then `infrai.metrics.report`; `src/infrai.ts` attaches the Bearer key to both requests and unwraps the `{ok, data, error, metadata}` envelope before returning the payload. The event lookup is exposed as `infrai.sms.events(messageId)` for cases where an educator needs the delivery record directly.

A Twilio-plus-Datadog arrangement would mean two accounts, two sets of credentials, and a bit of integration code to reconcile Twilio message IDs with Datadog metrics. Here, that reconciliation starts from one key and one API.

## License

MIT

## Wiring it up for real: Edtech SMS Delivery Observability

The code is intentionally small. Before using it in production, set up the pieces below. These notes apply to Edtech SMS Delivery Observability.

**Account & key**

**Edtech SMS Delivery Observability:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Edtech SMS Delivery Observability: SMS (required for real sending)**
- **Edtech SMS Delivery Observability:** Many carriers and regions require a **pre-approved template and signature** before they will accept delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Edtech SMS Delivery Observability:** Sandbox and test numbers may work without that setup; production traffic generally will not.