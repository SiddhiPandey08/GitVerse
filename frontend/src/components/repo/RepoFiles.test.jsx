import { describe, it, expect } from "vitest";
import { isSecretLike } from "./RepoFiles";

describe("RepoFiles preview protection", () => {
  it.each([".env", ".env.production", "server.pem", "id_rsa", "credentials.p12"])(
    "blocks %s",
    (name) => expect(isSecretLike(name)).toBe(true),
  );

  it("does not block ordinary source files", () => {
    expect(isSecretLike("src/App.jsx")).toBe(false);
  });
});
