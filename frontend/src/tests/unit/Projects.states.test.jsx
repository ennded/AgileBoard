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

import Project from "../../Pages/Projects";

function renderProjects({
  loading = false,
  error = undefined,
  projects = [],
  refetch = vi.fn(),
  createProject = vi.fn(),
  mutationState = {},
  teamId = "team-1",
} = {}) {
  useQueryMock.mockReturnValue({
    data: loading || error ? undefined : { projects },
    loading,
    error,
    refetch,
  });

  useMutationMock.mockReturnValue([createProject, mutationState]);

  render(
    <MemoryRouter initialEntries={[`/team/${teamId}`]}>
      <Routes>
        <Route path="/team/:teamId" element={<Project />} />
        <Route path="/project/:projectId" element={<p>Task board page</p>} />
      </Routes>
    </MemoryRouter>,
  );

  return { createProject, refetch };
}

function fillProjectName(name = "Roadmap") {
  fireEvent.change(screen.getByPlaceholderText("Project name"), {
    target: { value: name },
  });
}

describe("Projects states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    vi.restoreAllMocks();
  });

  it("shows a loading message while projects are loading", () => {
    renderProjects({ loading: true });

    expect(screen.getByText("Loading..")).toBeInTheDocument();
  });

  it("shows an error message when the projects query fails", () => {
    renderProjects({ error: new Error("Query failed") });

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("renders the heading and fetched projects", () => {
    renderProjects({
      projects: [
        { id: "1", name: "Roadmap" },
        { id: "2", name: "Backlog" },
      ],
    });

    expect(
      screen.getByRole("heading", { name: "Projects", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Roadmap")).toBeInTheDocument();
    expect(screen.getByText("Backlog")).toBeInTheDocument();
  });

  it("navigates to the task board when a project is clicked", async () => {
    renderProjects({
      projects: [{ id: "1", name: "Roadmap" }],
    });

    fireEvent.click(screen.getByRole("button", { name: "Roadmap" }));

    expect(await screen.findByText("Task board page")).toBeInTheDocument();
  });

  it("updates the project input as the user types", () => {
    renderProjects();

    fillProjectName("Sprint Board");

    expect(screen.getByPlaceholderText("Project name")).toHaveValue(
      "Sprint Board",
    );
  });

  it("does not call the mutation when the project name is empty", () => {
    const createProject = vi.fn();
    renderProjects({ createProject });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(createProject).not.toHaveBeenCalled();
  });

  it("creates a project, clears the input and refetches the list", async () => {
    const createProject = vi.fn().mockResolvedValue({
      data: {
        createProject: { id: "3", name: "Sprint Board" },
      },
    });
    const refetch = vi.fn().mockResolvedValue({});

    renderProjects({ createProject, refetch, teamId: "team-77" });
    fillProjectName("Sprint Board");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createProject).toHaveBeenCalledWith({
        variables: { name: "Sprint Board", teamId: "team-77" },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Project name")).toHaveValue("");
    });
  });

  it("shows the mutation loading state while creating a project", () => {
    renderProjects({
      mutationState: { loading: true },
    });

    expect(
      screen.getByRole("button", { name: "Adding..." }),
    ).toBeDisabled();
  });

  it("shows an error message when project creation fails", () => {
    renderProjects({
      mutationState: { error: new Error("Create failed") },
    });

    expect(screen.getByText("Error creating project")).toBeInTheDocument();
  });

  it("logs the error and keeps the input value when the mutation rejects", async () => {
    const createProject = vi
      .fn()
      .mockRejectedValue(new Error("Mutation failed"));
    const refetch = vi.fn();
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    renderProjects({ createProject, refetch, teamId: "team-88" });
    fillProjectName("Release Train");
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled();
    });

    expect(refetch).not.toHaveBeenCalled();
    expect(screen.getByPlaceholderText("Project name")).toHaveValue(
      "Release Train",
    );
  });
});
