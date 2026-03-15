import { describe, expect, it } from "vitest";

import client from "./client.js";

describe("Apollo client", () => {
  it("creates a configured client instance", () => {
    expect(client).toBeDefined();
    expect(client.cache.extract()).toEqual({});
    expect(client.link).toBeDefined();
  });
});
