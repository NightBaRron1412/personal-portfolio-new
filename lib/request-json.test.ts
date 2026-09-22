import { expect, it } from "vitest";
import { readRequestJson } from "./request-json";

it("parses a valid request and rejects invalid JSON", async () => {
  expect(await readRequestJson(new Request("http://localhost", { method: "POST", body: '{"name":"Amir"}' }))).toEqual({ name: "Amir" });
  await expect(readRequestJson(new Request("http://localhost", { method: "POST", body: "{" }))).rejects.toThrow();
});
it("bounds actual bytes without a content-length header", async () => {
  await expect(readRequestJson(new Request("http://localhost", { method: "POST", body: '"'.repeat(33) }), 32)).rejects.toBeInstanceOf(RangeError);
});
