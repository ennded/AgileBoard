import React from "react";
import { screen } from "@testing-library/react";
import {
  createTeamsMock,
  renderAppRoute,
} from "../helpers/appRouteTestUtils.jsx";

describe("App states", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the login page on the default route", () => {
    renderAppRoute();

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  it("renders the register page on the register route", () => {
    renderAppRoute(["/register"]);

    expect(
      screen.getByRole("heading", { name: "Register" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
  });

  it("redirects unauthenticated users away from the dashboard", () => {
    renderAppRoute(["/dashboard"]);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Dashboard" }),
    ).not.toBeInTheDocument();
  });

  it("renders the dashboard for authenticated users", async () => {
    localStorage.setItem("token", "test-token");

    renderAppRoute(["/dashboard"], createTeamsMock());

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
