import { createServer } from "node:http";
import { z } from "zod";
import { infrai } from "./infrai.js";

export const reminderBody = z.object({
  learnerPhone: z.string().min(7),
  learnerName: z.string().min(1),
  course: z.string().min(1),
  deadline: z.string().datetime()
});

export function shouldRemind(deadline: Date, now: Date): boolean {
  const hours = (deadline.getTime() - now.getTime()) / 3_600_000;
  return hours >= 0 && hours <= 24;
}

export async function deliverReminder(input: z.infer<typeof reminderBody>, now = new Date()) {
  const deadline = new Date(input.deadline);
  if (!shouldRemind(deadline, now)) return { sent: false, reason: "outside-window" as const };
  const text = `${input.learnerName}, your ${input.course} deadline is ${deadline.toISOString()}.`;
  const sent = await infrai.sms.batch.send({ messages: [{ to: input.learnerPhone, body: text }] });
  await infrai.metrics.report({ type: "counter", name: "course.reminder.sent", value: 1, tags: { course: input.course } });
  return { sent: true, messageId: sent.message_id };
}

if (process.argv[1]?.endsWith("course_delivery.ts")) {
  createServer(async (req, res) => {
    if (req.method !== "POST" || req.url !== "/reminders") { res.writeHead(404).end(); return; }
    try {
      const chunks: Buffer[] = [];
      for await (const chunk of req) chunks.push(Buffer.from(chunk));
      const parsed = reminderBody.safeParse(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      if (!parsed.success) { res.writeHead(400, { "Content-Type": "application/json" }).end(JSON.stringify({ error: "invalid request" })); return; }
      const result = await deliverReminder(parsed.data);
      res.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify(result));
    } catch (error) { res.writeHead(502, { "Content-Type": "application/json" }).end(JSON.stringify({ error: String(error) })); }
  }).listen(Number(process.env.PORT ?? 3000));
}
