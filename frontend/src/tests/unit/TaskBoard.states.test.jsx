import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { GET_TASK_BOARD } from "../../graphql/queries/taskQueries";
import {
  CREATE_TASK,
  UPDATE_TASK_STATUS,
} from "../../graphql/mutations/taskMutations";

const useQueryMock = vi.fn();
const useMutationMock = vi.fn();
const navigateMock = vi.fn();
let latestDragEndHandler;
let draggableState = {
  attributes: {},
  listeners: {},
  setNodeRef: vi.fn(),
  transform: null,
  isDragging: false,
};

vi.mock("@apollo/client", async () => {
  const actual = await vi.importActual("@apollo/client");
  return {
    ...actual,
    useQuery: (...args) => useQueryMock(...args),
    useMutation: (...args) => useMutationMock(...args),
  };
});

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@dnd-kit/core", async () => {
  const ReactModule = await vi.importActual("react");

  return {
    DndContext: ({ children, onDragEnd }) => {
      latestDragEndHandler = onDragEnd;
      return ReactModule.createElement("div", null, children);
    },
    pointerWithin: vi.fn(),
    useDraggable: () => draggableState,
    useDroppable: () => ({
      setNodeRef: vi.fn(),
      isOver: false,
    }),
  };
});

import TaskBoard from "../../Pages/TaskBoard";

function expectStatusUpdateCall(updateTaskStatus, { taskId, status, projectId }) {
  expect(updateTaskStatus).toHaveBeenCalledWith({
    variables: { taskId, status },
    refetchQueries: [{ query: GET_TASK_BOARD, variables: { projectId } }],
    awaitRefetchQueries: true,
  });
}

async function triggerDragEnd(event) {
  await act(async () => {
    await latestDragEndHandler?.(event);
  });
}

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
  createMutationState = {},
  updateTaskStatus = vi.fn(),
  updateMutationState = {},
  projectId = "project-1",
} = {}) {
  useQueryMock.mockReturnValue({
    data: loading || error ? undefined : { taskBoard },
    loading,
    error,
    refetch,
  });

  useMutationMock.mockImplementation((mutation) => {
    if (mutation === UPDATE_TASK_STATUS) {
      return [updateTaskStatus, updateMutationState];
    }

    if (mutation === CREATE_TASK) {
      return [createTask, createMutationState];
    }

    throw new Error("Unexpected mutation");
  });

  render(
    <MemoryRouter initialEntries={[`/project/${projectId}`]}>
      <Routes>
        <Route path="/project/:projectId" element={<TaskBoard />} />
        <Route path="/task/:taskId" element={<p>Task details page</p>} />
      </Routes>
    </MemoryRouter>,
  );

  return { createTask, refetch, updateTaskStatus };
}

describe("TaskBoard states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
    navigateMock.mockReset();
    latestDragEndHandler = undefined;
    draggableState = {
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: false,
    };
  });

  it("shows a loading message while the task board is loading", () => {
    renderTaskBoard({ loading: true });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the task board query fails", () => {
    renderTaskBoard({ error: new Error("Query failed") });

    expect(screen.getByText("Error loading task board.")).toBeInTheDocument();
  });

  it("shows a not-found message when the project has no task board", () => {
    renderTaskBoard({ taskBoard: null });

    expect(screen.getByText("Project not found.")).toBeInTheDocument();
  });

  it("queries the task board using the project id from the route", () => {
    renderTaskBoard({ projectId: "project-77" });

    expect(useQueryMock).toHaveBeenCalledWith(GET_TASK_BOARD, {
      variables: { projectId: "project-77" },
    });
    expect(useMutationMock).toHaveBeenNthCalledWith(1, UPDATE_TASK_STATUS);
    expect(useMutationMock).toHaveBeenNthCalledWith(2, CREATE_TASK);
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

  it("applies drag styles while a task card is being dragged", () => {
    draggableState = {
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: { x: 12, y: 24 },
      isDragging: true,
    };

    renderTaskBoard({
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
    });

    const taskCard = screen.getByText("Write specs").closest("div");

    expect(taskCard).toHaveStyle({
      transform: "translate(12px, 24px)",
      opacity: "0.5",
    });
  });

  it("navigates to the task details when a task title is clicked", () => {
    renderTaskBoard({
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
    });

    fireEvent.click(screen.getByText("Write specs"));

    expect(navigateMock).toHaveBeenCalledWith("/task/1");
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

  it("does not call the create task mutation when the title is only spaces", () => {
    const createTask = vi.fn();

    renderTaskBoard({ createTask });

    fireEvent.change(screen.getByPlaceholderText("Task title"), {
      target: { value: "   " },
    });
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
      target: { value: "  Ship notifications  " },
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

  it("shows the adding state while the create mutation is running", () => {
    renderTaskBoard({
      createMutationState: { loading: true },
    });

    expect(
      screen.getByRole("button", { name: "Adding..." }),
    ).toBeDisabled();
  });

  it("shows a create-task error message when the mutation fails", async () => {
    const createTask = vi.fn().mockRejectedValue(new Error("Create failed"));

    renderTaskBoard({ createTask });

    fireEvent.change(screen.getByPlaceholderText("Task title"), {
      target: { value: "Ship notifications" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(
      await screen.findByText("Create failed"),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Task title")).toHaveValue(
      "Ship notifications",
    );
  });

  it("shows a create-task error from the mutation state", () => {
    renderTaskBoard({
      createMutationState: { error: new Error("Backend rejected task") },
    });

    expect(screen.getByText("Backend rejected task")).toBeInTheDocument();
  });

  it("updates a task status with a board refetch query", async () => {
    const updateTaskStatus = vi.fn().mockResolvedValue({
      data: {
        UpdateTaskStatus: { id: "1", status: "IN_PROGRESS" },
      },
    });

    renderTaskBoard({
      updateTaskStatus,
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
      projectId: "project-42",
    });

    fireEvent.click(screen.getByRole("button", { name: "In Progress" }));

    await waitFor(() => {
      expectStatusUpdateCall(updateTaskStatus, {
        taskId: "1",
        status: "IN_PROGRESS",
        projectId: "project-42",
      });
    });
  });

  it("updates a task to done with a board refetch query", async () => {
    const updateTaskStatus = vi.fn().mockResolvedValue({
      data: {
        UpdateTaskStatus: { id: "1", status: "DONE" },
      },
    });

    renderTaskBoard({
      updateTaskStatus,
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
      projectId: "project-43",
    });

    fireEvent.click(screen.getByRole("button", { name: "Done" }));

    await waitFor(() => {
      expectStatusUpdateCall(updateTaskStatus, {
        taskId: "1",
        status: "DONE",
        projectId: "project-43",
      });
    });
  });

  it("refetches the board when a status update fails", async () => {
    const updateTaskStatus = vi.fn().mockRejectedValue(new Error("Update failed"));
    const refetch = vi.fn().mockResolvedValue({});

    renderTaskBoard({
      updateTaskStatus,
      refetch,
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "In Progress" }));

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("refetches the board when a drag status update fails", async () => {
    const updateTaskStatus = vi.fn().mockRejectedValue(new Error("Update failed"));
    const refetch = vi.fn().mockResolvedValue({});

    renderTaskBoard({
      updateTaskStatus,
      refetch,
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
    });

    await triggerDragEnd({
      active: { id: "1" },
      over: { id: "DONE" },
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });

  it("updates a task status when a card is dropped in a new column", async () => {
    const updateTaskStatus = vi.fn().mockResolvedValue({
      data: {
        UpdateTaskStatus: { id: "1", status: "DONE" },
      },
    });

    renderTaskBoard({
      updateTaskStatus,
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
      projectId: "project-88",
    });

    await triggerDragEnd({
      active: { id: "1" },
      over: { id: "DONE" },
    });

    await waitFor(() => {
      expectStatusUpdateCall(updateTaskStatus, {
        taskId: "1",
        status: "DONE",
        projectId: "project-88",
      });
    });
  });

  it("does not update task status when a card is dropped outside a column", async () => {
    const updateTaskStatus = vi.fn();

    renderTaskBoard({
      updateTaskStatus,
      taskBoard: {
        todo: [{ id: "1", title: "Write specs" }],
        inProgress: [],
        done: [],
      },
    });

    await triggerDragEnd({
      active: { id: "1" },
      over: null,
    });

    expect(updateTaskStatus).not.toHaveBeenCalled();
  });
});
