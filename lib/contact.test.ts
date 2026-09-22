import { describe, expect, it } from "vitest";
import { contactSchema } from "./contact";

describe("shared contact validation", () => {
  const valid = { name: "Amir", email: "amir@example.com", message: "A systems question." };
  it("trims fields before validating", () => {
    expect(contactSchema.parse({ ...valid, name: " Amir " }).name).toBe("Amir");
    expect(contactSchema.safeParse({ ...valid, message: "          " }).success).toBe(false);
  });
  it("rejects oversized fields and malformed email", () => {
    for (const changes of [{ name: "x".repeat(81) }, { email: "invalid" }, { message: "x".repeat(5001) }]) {
      expect(contactSchema.safeParse({ ...valid, ...changes }).success).toBe(false);
    }
  });
});
