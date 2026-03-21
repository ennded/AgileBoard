import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { GET_TASK_BOARD } from "../../graphql/queries/taskQueries";

const useQueryMock = vi.fn();

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual("@apollo/client");
  return {
    ...actual,
    useQuery: (...args) => useQueryMock(...args),
  };
});

import TaskBoard from "../../Pages/TaskBoard";

function renderTaskBoard({
  loading = false,
  error = undefined,
  taskBoard = {
    todo: [],
    inProgress: [],
    done: [],
  },
  projectId = "project-1",
} = {}) {
  useQueryMock.mockReturnValue({
    data: loading || error ? undefined : { taskBoard },
    loading,
    error,
  });

  render(
    <MemoryRouter initialEntries={[`/project/${projectId}`]}>
      <Routes>
        <Route path="/project/:projectId" element={<TaskBoard />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("TaskBoard states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
  });

  it("shows a loading message while the task board is loading", () => {
    renderTaskBoard({ loading: true });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the task board query fails", () => {
    renderTaskBoard({ error: new Error("Query failed") });

    expect(screen.getByText("Error loading task board.")).toBeInTheDocument();
  });

  it("queries the task board using the project id from the route", () => {
    renderTaskBoard({ projectId: "project-77" });

    expect(useQueryMock).toHaveBeenCalledWith(GET_TASK_BOARD, {
      variables: { projectId: "project-77" },
    });
  });

  it("renders the heading, columns, and tasks returned by the query", () => {
    renderTaskBoard({
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [{ id: "2", title: "Build board" }],
        done: [{ id: "3", title: "Set up project" }],
      },
    });

    expect(
      screen.getByRole("heading", { name: "Task Board", level: 2 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Todo", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "In Progress", level: 3 }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Done", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Write specs")).toBeInTheDocument();
    expect(screen.getByText("Build board")).toBeInTheDocument();
    expect(screen.getByText("Set up project")).toBeInTheDocument();
  });
});
