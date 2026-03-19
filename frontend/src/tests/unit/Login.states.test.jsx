import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

const useMutationMock = vi.fn();

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual("@apollo/client");
  return {
    ...actual,
    useMutation: (...args) => useMutationMock(...args),
  };
});

import Login from "../../Pages/Login";

function renderLogin() {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>,
  );
}

function fillLoginForm({
  email = "ragnar@gmail.com",
  password = "sangam@123",
} = {}) {
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: password },
  });
}

describe("Login states", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue([vi.fn(), {}]);
  });

  it("renders the login form correctly", () => {
    renderLogin();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("shows loading state when login is in progress", () => {
    useMutationMock.mockReturnValue([vi.fn(), { loading: true }]);
    renderLogin();
    expect(
      screen.getByRole("button", { name: /logging in/i }),
    ).toBeInTheDocument();
  });

  it("shows error message when login fails", () => {
    useMutationMock.mockReturnValue([
      vi.fn(),
      { error: new Error("Invalid credentials") },
    ]);
    renderLogin();
    expect(
      screen.getByText("Login failed. Please check your credentials."),
    ).toBeInTheDocument();
  });

  it("updates email and password fields on input", () => {
    renderLogin();
    fillLoginForm();
    expect(screen.getByPlaceholderText("Email")).toHaveValue(
      "ragnar@gmail.com",
    );
    expect(screen.getByPlaceholderText("Password")).toHaveValue("sangam@123");
  });

  it("calls login mutation with correct variables on submit", async () => {
    const loginMock = vi.fn().mockResolvedValue({
      data: {
        login: { token: "test-token", user: { id: "1", name: "Ragnar" } },
      },
    });
    useMutationMock.mockReturnValue([loginMock, {}]);
    renderLogin();
    fillLoginForm();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        variables: { email: "ragnar@gmail.com", password: "sangam@123" },
      });
    });
  });

  it("stores token in localStorage on successful login", async () => {
    localStorage.clear();
    const loginMock = vi.fn().mockResolvedValue({
      data: {
        login: { token: "test-token-abc", user: { id: "1", name: "Ragnar" } },
      },
    });
    useMutationMock.mockReturnValue([loginMock, {}]);
    renderLogin();
    fillLoginForm();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("test-token-abc");
    });
  });

  it("does not store token when login fails", async () => {
    localStorage.clear();
    const loginMock = vi.fn().mockRejectedValue(new Error("Login failed"));
    useMutationMock.mockReturnValue([loginMock, {}]);
    renderLogin();
    fillLoginForm();
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
    });
  });
});
