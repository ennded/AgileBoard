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

describe("App states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue([vi.fn(), {}]);
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

  it("submits the form and clears the inputs when the mutation succeeds", async () => {
    const createUserMock = vi.fn().mockResolvedValue({
      data: { createUser: { id: "1", name: "Sangam", email: "sangam@example.com" } },
    });

    useQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { users: [] },
    });
    useMutationMock.mockReturnValue([createUserMock, {}]);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter name"), {
      target: { value: "Sangam" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter email"), {
      target: { value: "sangam@example.com" },
    });
    fireEvent.click(screen.getByText("Create User"));

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

    useQueryMock.mockReturnValue({
      loading: false,
      error: undefined,
      data: { users: [] },
    });
    useMutationMock.mockReturnValue([createUserMock, {}]);

    render(<App />);

    fireEvent.change(screen.getByPlaceholderText("Enter name"), {
      target: { value: "Sangam" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter email"), {
      target: { value: "sangam@example.com" },
    });
    fireEvent.click(screen.getByText("Create User"));

    await waitFor(() => {
      expect(screen.getByText("Create failed")).toBeInTheDocument();
    });
  });
});
