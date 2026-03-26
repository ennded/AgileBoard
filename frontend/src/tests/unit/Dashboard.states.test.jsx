import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual("@apollo/client");
  return {
    ...actual,
    useQuery: (...args) => useQueryMock(...args),
    useMutation: (...args) => useMutationMock(...args),
  };
});

import Dashboard from "../../Pages/Dashboard";

function renderDashboard({
  loading = false,
  error = undefined,
  teams = [],
  refetch = vi.fn(),
  createTeam = vi.fn(),
  mutationState = {},
  initialEntries = ["/"],
} = {}) {
  useQueryMock.mockReturnValue({
    data: loading || error ? undefined : { teams },
    loading,
    error,
    refetch,
  });

  useMutationMock.mockReturnValue([createTeam, mutationState]);

  render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/team/:teamId" element={<p>Projects page</p>} />
      </Routes>
    </MemoryRouter>,
  );

  return { refetch, createTeam };
}

function fillTeamName(name = "Platform Team") {
  fireEvent.change(screen.getByPlaceholderText("Team name"), {
    target: { value: name },
  });
}

describe("Dashboard states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    vi.restoreAllMocks();
  });

  it("shows a loading message while teams are loading", () => {
    renderDashboard({ loading: true });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the teams query fails", () => {
    renderDashboard({ error: new Error("Query failed") });

    expect(screen.getByText("Error loading teams")).toBeInTheDocument();
  });

  it("renders the dashboard heading and fetched teams", () => {
    renderDashboard({
      teams: [
        { id: "1", name: "Platform Team" },
        { id: "2", name: "Design Team" },
      ],
    });

    expect(
      screen.getByRole("heading", { name: "Dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Platform Team")).toBeInTheDocument();
    expect(screen.getByText("Design Team")).toBeInTheDocument();
  });

  it("navigates to the projects page when a team is clicked", async () => {
    renderDashboard({
      teams: [{ id: "1", name: "Platform Team" }],
    });

    fireEvent.click(screen.getByRole("button", { name: "Platform Team" }));

    expect(await screen.findByText("Projects page")).toBeInTheDocument();
  });

  it("updates the team name input as the user types", () => {
    renderDashboard();

    fillTeamName("Growth Team");

    expect(screen.getByPlaceholderText("Team name")).toHaveValue("Growth Team");
  });

  it("does not call the mutation when the team name is empty", () => {
    const createTeam = vi.fn();
    renderDashboard({ createTeam });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(createTeam).not.toHaveBeenCalled();
  });

  it("creates a team, clears the input and refetches the list", async () => {
    const createTeam = vi.fn().mockResolvedValue({
      data: {
        createTeam: { id: "3", name: "Growth Team" },
      },
    });
    const refetch = vi.fn().mockResolvedValue({});

    renderDashboard({ createTeam, refetch });
    fillTeamName("Growth Team");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalledWith({
        variables: { name: "Growth Team" },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Team name")).toHaveValue("");
    });
  });

  it("shows the mutation loading state while creating a team", () => {
    renderDashboard({
      mutationState: { loading: true },
    });

    expect(
      screen.getByRole("button", { name: "Adding..." }),
    ).toBeDisabled();
  });

  it("shows an error message when team creation fails", () => {
    renderDashboard({
      mutationState: { error: new Error("Create failed") },
    });

    expect(screen.getByText("Error creating team")).toBeInTheDocument();
  });

  it("keeps the input value when the mutation rejects", async () => {
    const createTeam = vi.fn().mockRejectedValue(new Error("Mutation failed"));
    const refetch = vi.fn();

    renderDashboard({ createTeam, refetch });
    fillTeamName("Ops Team");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createTeam).toHaveBeenCalled();
    });

    expect(refetch).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Team name")).toHaveValue("Ops Team");
  });
});
