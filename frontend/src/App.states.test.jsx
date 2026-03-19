import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App.jsx";

function renderApp(initialEntries = ["/"]) {
  render(
    <MockedProvider mocks={[]}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </MockedProvider>,
  );
}

describe("App states", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the login page on the default route", () => {
    renderApp();

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders the register page on the register route", () => {
    renderApp(["/register"]);

    expect(
      screen.getByRole("heading", { name: "Register" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
  });

  it("redirects unauthenticated users away from the dashboard", () => {
    renderApp(["/dashboard"]);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("renders the dashboard for authenticated users", () => {
    localStorage.setItem("token", "test-token");

    renderApp(["/dashboard"]);

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
