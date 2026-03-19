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

import Register from "./Pages/Register";

function renderRegister() {
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>,
  );
}

function fillRegisterForm({
  name = "Ragnar",
  email = "ragnar@gmail.com",
  password = "sangam@123",
} = {}) {
  fireEvent.change(screen.getByPlaceholderText("Name"), {
    target: { value: name },
  });
  fireEvent.change(screen.getByPlaceholderText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByPlaceholderText("Password"), {
    target: { value: password },
  });
}

describe("Register states", () => {
  beforeEach(() => {
    useMutationMock.mockReset();
    useMutationMock.mockReturnValue([vi.fn(), {}]);
  });

  it("renders the register form correctly", () => {
    renderRegister();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("shows loading state when registration is in progress", () => {
    useMutationMock.mockReturnValue([vi.fn(), { loading: true }]);
    renderRegister();
    expect(
      screen.getByRole("button", { name: /registering/i }),
    ).toBeInTheDocument();
  });

  it("shows error message when registration fails", () => {
    useMutationMock.mockReturnValue([
      vi.fn(),
      { error: new Error("Email already exists") },
    ]);
    renderRegister();
    expect(
      screen.getByText("Registration failed. Please try again."),
    ).toBeInTheDocument();
  });

  it("updates name, email and password fields on input", () => {
    renderRegister();
    fillRegisterForm();
    expect(screen.getByPlaceholderText("Name")).toHaveValue("Ragnar");
    expect(screen.getByPlaceholderText("Email")).toHaveValue(
      "ragnar@gmail.com",
    );
    expect(screen.getByPlaceholderText("Password")).toHaveValue("sangam@123");
  });

  it("calls register mutation with correct variables on submit", async () => {
    const registerMock = vi.fn().mockResolvedValue({
      data: {
        register: { token: "test-token", user: { id: "1", name: "Ragnar" } },
      },
    });
    useMutationMock.mockReturnValue([registerMock, {}]);
    renderRegister();
    fillRegisterForm();
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        variables: {
          name: "Ragnar",
          email: "ragnar@gmail.com",
          password: "sangam@123",
        },
      });
    });
  });

  it("stores token in localStorage on successful registration", async () => {
    localStorage.clear();
    const registerMock = vi.fn().mockResolvedValue({
      data: {
        register: {
          token: "register-token-xyz",
          user: { id: "1", name: "Ragnar" },
        },
      },
    });
    useMutationMock.mockReturnValue([registerMock, {}]);
    renderRegister();
    fillRegisterForm();
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("register-token-xyz");
    });
  });

  it("does not store token when registration fails", async () => {
    localStorage.clear();
    const registerMock = vi
      .fn()
      .mockRejectedValue(new Error("Register failed"));
    useMutationMock.mockReturnValue([registerMock, {}]);
    renderRegister();
    fillRegisterForm();
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBeNull();
    });
  });
});
