import { beforeEach, describe, expect, it, vi } from "vitest";

const GRAPHQL_URI = "http://localhost:5001/graphql";

async function loadClientModule() {
  vi.resetModules();

  const cacheInstance = { kind: "cache" };
  const httpLinkInstance = { kind: "http-link" };
  const combinedLink = { kind: "combined-link" };
  const captured = {};

  const concatMock = vi.fn(() => combinedLink);
  const HttpLinkMock = vi.fn().mockImplementation((config) => ({
    ...httpLinkInstance,
    ...config,
  }));
  const InMemoryCacheMock = vi.fn().mockImplementation(() => cacheInstance);
  const ApolloLinkMock = vi.fn().mockImplementation((handler) => {
    captured.handler = handler;
    return {
      concat: concatMock,
    };
  });
  const ApolloClientMock = vi.fn().mockImplementation((config) => ({
    ...config,
  }));

  vi.doMock("@apollo/client", () => ({
    ApolloClient: ApolloClientMock,
    HttpLink: HttpLinkMock,
    InMemoryCache: InMemoryCacheMock,
    ApolloLink: ApolloLinkMock,
  }));

  const module = await import("../../apollo/client.js");

  return {
    client: module.default,
    captured,
    mocks: {
      ApolloClientMock,
      ApolloLinkMock,
      HttpLinkMock,
      InMemoryCacheMock,
      concatMock,
    },
    instances: {
      cacheInstance,
      combinedLink,
      httpLinkInstance,
    },
  };
}

describe("Apollo client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.unstubAllEnvs();
  });

  it("creates a configured client instance", async () => {
    const { client, mocks, instances } = await loadClientModule();

    expect(mocks.HttpLinkMock).toHaveBeenCalledWith({ uri: GRAPHQL_URI });
    expect(mocks.InMemoryCacheMock).toHaveBeenCalledTimes(1);
    expect(mocks.concatMock).toHaveBeenCalledWith({
      ...instances.httpLinkInstance,
      uri: GRAPHQL_URI,
    });
    expect(mocks.ApolloClientMock).toHaveBeenCalledWith({
      link: instances.combinedLink,
      cache: instances.cacheInstance,
    });
    expect(client).toEqual({
      link: instances.combinedLink,
      cache: instances.cacheInstance,
    });
  });

  it("prefers the configured GraphQL URL from the Vite environment", async () => {
    vi.stubEnv("VITE_GRAPHQL_URL", "https://api.example.com/graphql");

    const { mocks } = await loadClientModule();

    expect(mocks.HttpLinkMock).toHaveBeenCalledWith({
      uri: "https://api.example.com/graphql",
    });
  });

  it("adds the bearer token to request headers when one exists", async () => {
    localStorage.setItem("token", "token-123");
    const { captured } = await loadClientModule();

    const operation = {
      setContext: vi.fn((updater) => {
        operation.context = updater({ headers: { "x-test": "1" } });
      }),
    };
    const forward = vi.fn(() => "forward-result");

    const result = captured.handler(operation, forward);

    expect(operation.setContext).toHaveBeenCalledTimes(1);
    expect(operation.context).toEqual({
      headers: {
        "x-test": "1",
        authorization: "Bearer token-123",
      },
    });
    expect(forward).toHaveBeenCalledWith(operation);
    expect(result).toBe("forward-result");
  });

  it("uses an empty authorization header when no token exists", async () => {
    const { captured } = await loadClientModule();

    const operation = {
      setContext: vi.fn((updater) => {
        operation.context = updater({});
      }),
    };
    const forward = vi.fn(() => "forward-result");

    captured.handler(operation, forward);

    expect(operation.context).toEqual({
      headers: {
        authorization: "",
      },
    });
  });
});
