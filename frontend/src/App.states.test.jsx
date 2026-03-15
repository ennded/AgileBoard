import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const useQueryMock = vi.fn();

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");

  return {
    ...actual,
    useQuery: (...args) => useQueryMock(...args),
  };
});

import App from "./App.jsx";

describe("App states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it("shows a loading message while the query is in flight", () => {
    useQueryMock.mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
    });

    render(<App />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an empty state when no users are returned", () => {
    useQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { users: [] },
    });

    render(<App />);

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("shows the GraphQL error message when the query fails", () => {
    useQueryMock.mockReturnValue({
      loading: false,
      error: new Error("Backend unavailable"),
      data: undefined,
    });

    render(<App />);

    expect(screen.getByText("Error: Backend unavailable")).toBeInTheDocument();
  });
});
