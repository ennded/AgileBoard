import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LOGIN, REGISTER } from "./graphql/mutations/authMutation";
import Login from "./Pages/Login";
import Register from "./Pages/Register";

const loginSuccessMock = {
  request: {
    query: LOGIN,
    variables: { email: "ragnar@gmail.com", password: "sangam@123" },
  },
  result: {
    data: {
      login: {
        token: "mock-token-123",
        user: { id: "1", name: "Ragnar" },
      },
    },
  },
};

const loginErrorMock = {
  request: {
    query: LOGIN,
    variables: { email: "wrong@gmail.com", password: "wrongpass" },
  },
  error: new Error("Invalid credentials"),
};

const registerSuccessMock = {
  request: {
    query: REGISTER,
    variables: {
      name: "Ragnar",
      email: "ragnar@gmail.com",
      password: "sangam@123",
    },
  },
  result: {
    data: {
      register: {
        token: "mock-register-token",
        user: { id: "1", name: "Ragnar" },
      },
    },
  },
};

const registerErrorMock = {
  request: {
    query: REGISTER,
    variables: {
      name: "Ragnar",
      email: "existing@gmail.com",
      password: "sangam@123",
    },
  },
  error: new Error("Email already exists"),
};

// ─── Login integration tests ───────────────────────────────────────────────

describe("Login integration", () => {
  it("renders login page with all elements", () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
  });

  it("successfully logs in and stores token", async () => {
    localStorage.clear();
    render(
      <MockedProvider mocks={[loginSuccessMock]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "ragnar@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "sangam@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("mock-token-123");
    });
  });

  it("shows error message on failed login", async () => {
    render(
      <MockedProvider mocks={[loginErrorMock]}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "wrong@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpass" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Login failed. Please check your credentials."),
      ).toBeInTheDocument();
    });
  });

  it("navigates to register page when Register link is clicked", () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.click(screen.getByRole("link", { name: /register/i }));
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
  });
});

// ─── Register integration tests ────────────────────────────────────────────

describe("Register integration", () => {
  it("renders register page with all elements", () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </MockedProvider>,
    );

    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /login/i })).toBeInTheDocument();
  });

  it("successfully registers and stores token", async () => {
    localStorage.clear();
    render(
      <MockedProvider mocks={[registerSuccessMock]}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Ragnar" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "ragnar@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "sangam@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("mock-register-token");
    });
  });

  it("shows error message on failed registration", async () => {
    render(
      <MockedProvider mocks={[registerErrorMock]}>
        <MemoryRouter>
          <Register />
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "Ragnar" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "existing@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "sangam@123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Registration failed. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("navigates to login page when Login link is clicked", () => {
    render(
      <MockedProvider mocks={[]}>
        <MemoryRouter initialEntries={["/register"]}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </MemoryRouter>
      </MockedProvider>,
    );

    fireEvent.click(screen.getByRole("link", { name: /login/i }));
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });
});
