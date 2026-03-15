import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("@apollo/client/react", async () => {
  const actual = await vi.importActual("@apollo/client/react");

  return {
    ...actual,
    useQuery: (...args) => useQueryMock(...args),
    useMutation: (...args) => useMutationMock(...args),
  };
});

import App from "./App.jsx";

function renderAppWithQueryState({ loading = false, error, users = [] } = {}) {
  useQueryMock.mockReturnValue({
    loading,
    error,
    data: loading || error ? undefined : { users },
  });

  render(<App />);
}

function submitUserForm({ name = "Sangam", email = "sangam@example.com" } = {}) {
  fireEvent.change(screen.getByPlaceholderText("Enter name"), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText("Enter email"), {
    target: { value: email },
  });
  fireEvent.click(screen.getByText("Create User"));
}

describe("App states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue([vi.fn(), {}]);
  });

  it("shows a loading message while the query is in flight", () => {
    renderAppWithQueryState({ loading: true });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an empty state when no users are returned", () => {
    renderAppWithQueryState();

    expect(screen.getByText("No users found.")).toBeInTheDocument();
  });

  it("shows the GraphQL error message when the query fails", () => {
    renderAppWithQueryState({ error: new Error("Backend unavailable") });

    expect(screen.getByText("Error: Backend unavailable")).toBeInTheDocument();
  });

  it("submits the form and clears the inputs when the mutation succeeds", async () => {
    const createUserMock = vi.fn().mockResolvedValue({
      data: { createUser: { id: "1", name: "Sangam", email: "sangam@example.com" } },
    });

    useMutationMock.mockReturnValue([createUserMock, {}]);
    renderAppWithQueryState();
    submitUserForm();

    await waitFor(() => {
      expect(createUserMock).toHaveBeenCalledWith({
        variables: { name: "Sangam", email: "sangam@example.com" },
      });
    });

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Enter name")).toHaveValue("");
      expect(screen.getByPlaceholderText("Enter email")).toHaveValue("");
    });
  });

  it("shows the mutation error message when submit fails", async () => {
    const createUserMock = vi.fn().mockRejectedValue(new Error("Create failed"));

    useMutationMock.mockReturnValue([createUserMock, {}]);
    renderAppWithQueryState();
    submitUserForm();

    await waitFor(() => {
      expect(screen.getByText("Create failed")).toBeInTheDocument();
    });
  });
});
