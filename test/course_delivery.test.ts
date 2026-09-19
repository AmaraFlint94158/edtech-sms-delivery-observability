import assert from "node:assert/strict";
import { shouldRemind } from "../src/course_delivery.js";

const now = new Date("2026-09-16T08:00:00.000Z");
assert.equal(shouldRemind(new Date("2026-09-16T20:00:00.000Z"), now), true);
assert.equal(shouldRemind(new Date("2026-09-18T08:01:00.000Z"), now), false);
console.log("deadline decision test passed");
