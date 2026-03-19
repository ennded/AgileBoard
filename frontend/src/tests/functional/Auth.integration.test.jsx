import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { LOGIN, REGISTER } from "../../graphql/mutations/authMutation";
import Login from "../../Pages/Login";
import Register from "../../Pages/Register";

const validLogin = {
  email: "ragnar@gmail.com",
  password: "sangam@123",
};

const invalidLogin = {
  email: "wrong@gmail.com",
  password: "wrongpass",
};

const validRegistration = {
  name: "Ragnar",
  email: "ragnar@gmail.com",
  password: "sangam@123",
};

const duplicateRegistration = {
  name: "Ragnar",
  email: "existing@gmail.com",
  password: "sangam@123",
};

function createMutationSuccessMock(query, variables, fieldName, token) {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data: {
        [fieldName]: {
          token,
          user: { id: "1", name: "Ragnar" },
        },
      },
    },
  };
}

function createMutationErrorMock(query, variables, message) {
  return {
    request: {
      query,
      variables,
    },
    error: new Error(message),
  };
}

const loginSuccessMock = createMutationSuccessMock(
  LOGIN,
  validLogin,
  "login",
  "mock-token-123",
);

const loginErrorMock = createMutationErrorMock(
  LOGIN,
  invalidLogin,
  "Invalid credentials",
);

const registerSuccessMock = createMutationSuccessMock(
  REGISTER,
  validRegistration,
  "register",
  "mock-register-token",
);

const registerErrorMock = createMutationErrorMock(
  REGISTER,
  duplicateRegistration,
  "Email already exists",
);

function renderWithProviders(ui, { mocks = [], initialEntries = ["/"] } = {}) {
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </MockedProvider>,
  );
}

function renderAuthPage(Component, options) {
  renderWithProviders(<Component />, options);
}

function renderAuthRoutes(initialEntries) {
  renderWithProviders(
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>,
    { initialEntries },
  );
}

function fillForm(fields) {
  Object.entries(fields).forEach(([placeholder, value]) => {
    fireEvent.change(screen.getByPlaceholderText(placeholder), {
      target: { value },
    });
  });
}

function submitForm(buttonName) {
  fireEvent.click(screen.getByRole("button", { name: buttonName }));
}

const renderCases = [
  {
    title: "login",
    Component: Login,
    heading: "Login",
    fields: ["Email", "Password"],
    buttonName: /login/i,
    linkName: /register/i,
  },
  {
    title: "register",
    Component: Register,
    heading: "Register",
    fields: ["Name", "Email", "Password"],
    buttonName: /register/i,
    linkName: /login/i,
  },
];

describe("Auth integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it.each(renderCases)(
    "renders the $title page with all elements",
    ({ Component, heading, fields, buttonName, linkName }) => {
      renderAuthPage(Component);

      expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
      fields.forEach((field) => {
        expect(screen.getByPlaceholderText(field)).toBeInTheDocument();
      });
      expect(screen.getByRole("button", { name: buttonName })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: linkName })).toBeInTheDocument();
    },
  );

  it("successfully logs in and stores token", async () => {
    renderAuthPage(Login, { mocks: [loginSuccessMock] });

    fillForm({
      Email: validLogin.email,
      Password: validLogin.password,
    });
    submitForm(/login/i);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("mock-token-123");
    });
  });

  it("shows error message on failed login", async () => {
    renderAuthPage(Login, { mocks: [loginErrorMock] });

    fillForm({
      Email: invalidLogin.email,
      Password: invalidLogin.password,
    });
    submitForm(/login/i);

    await waitFor(() => {
      expect(
        screen.getByText("Login failed. Please check your credentials."),
      ).toBeInTheDocument();
    });
  });

  it("successfully registers and stores token", async () => {
    renderAuthPage(Register, { mocks: [registerSuccessMock] });

    fillForm({
      Name: validRegistration.name,
      Email: validRegistration.email,
      Password: validRegistration.password,
    });
    submitForm(/register/i);

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("mock-register-token");
    });
  });

  it("shows error message on failed registration", async () => {
    renderAuthPage(Register, { mocks: [registerErrorMock] });

    fillForm({
      Name: duplicateRegistration.name,
      Email: duplicateRegistration.email,
      Password: duplicateRegistration.password,
    });
    submitForm(/register/i);

    await waitFor(() => {
      expect(
        screen.getByText("Registration failed. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("navigates between auth pages using the footer links", () => {
    renderAuthRoutes(["/"]);

    fireEvent.click(screen.getByRole("link", { name: /register/i }));
    expect(screen.getByRole("heading", { name: "Register" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /login/i }));
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });
});
