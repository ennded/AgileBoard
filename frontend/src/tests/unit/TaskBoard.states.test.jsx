import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { GET_TASK_BOARD } from "../../graphql/queries/taskQueries";
import { CREATE_TASK } from "../../graphql/mutations/taskMutations";

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

import TaskBoard from "../../Pages/TaskBoard";

function renderTaskBoard({
  loading = false,
  error = undefined,
  taskBoard = {
    todo: [],
    inProgress: [],
    done: [],
  },
  refetch = vi.fn(),
  createTask = vi.fn(),
  mutationState = {},
  projectId = "project-1",
} = {}) {
  useQueryMock.mockReturnValue({
    data: loading || error ? undefined : { taskBoard },
    loading,
    error,
    refetch,
  });

  useMutationMock.mockReturnValue([createTask, mutationState]);

  render(
    <MemoryRouter initialEntries={[`/project/${projectId}`]}>
      <Routes>
        <Route path="/project/:projectId" element={<TaskBoard />} />
      </Routes>
    </MemoryRouter>,
  );

  return { createTask, refetch };
}

describe("TaskBoard states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
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
    expect(useMutationMock).toHaveBeenCalledWith(CREATE_TASK);
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

  it("renders the create task form and updates the input as the user types", () => {
    renderTaskBoard();

    fireEvent.change(screen.getByPlaceholderText("Task title"), {
      target: { value: "Ship notifications" },
    });

    expect(
      screen.getByRole("heading", { name: "Create Task", level: 2 }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Task title")).toHaveValue(
      "Ship notifications",
    );
  });

  it("does not call the create task mutation when the title is empty", () => {
    const createTask = vi.fn();
    renderTaskBoard({ createTask });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(createTask).not.toHaveBeenCalled();
  });

  it("creates a task, clears the input and refetches the board", async () => {
    const createTask = vi.fn().mockResolvedValue({
      data: {
        createTask: { id: "4", title: "Ship notifications", status: "TODO" },
      },
    });
    const refetch = vi.fn().mockResolvedValue({});

    renderTaskBoard({ createTask, refetch, projectId: "project-99" });

    fireEvent.change(screen.getByPlaceholderText("Task title"), {
      target: { value: "Ship notifications" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith({
        variables: {
          title: "Ship notifications",
          projectId: "project-99",
        },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Task title")).toHaveValue("");
    });
  });
});
