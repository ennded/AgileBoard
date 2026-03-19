import React from "react";
import { screen } from "@testing-library/react";
import {
  createTeamsMock,
  renderAppRoute,
} from "../helpers/appRouteTestUtils.jsx";

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows the register screen when users visit the register route", () => {
    renderAppRoute(["/register"]);

    expect(
      screen.getByRole("heading", { name: "Register" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toBeInTheDocument();
  });

  it("redirects unauthenticated users from dashboard to login", () => {
    renderAppRoute(["/dashboard"]);

    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
  });

  it("shows the dashboard when a token exists", async () => {
    localStorage.setItem("token", "integration-token");

    renderAppRoute(["/dashboard"], createTeamsMock(["Platform Team"]));

    expect(
      await screen.findByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
  });
});
