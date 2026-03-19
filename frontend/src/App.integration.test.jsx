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

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the register screen when users visit the register route", () => {
    renderApp(["/register"]);

    expect(
      screen.getByRole("heading", { name: "Register" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users from dashboard to login", () => {
    renderApp(["/dashboard"]);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("shows the dashboard when a token exists", () => {
    localStorage.setItem("token", "integration-token");

    renderApp(["/dashboard"]);

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
