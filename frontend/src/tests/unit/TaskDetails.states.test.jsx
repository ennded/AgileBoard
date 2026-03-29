import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { GET_COMMENTS } from "../../graphql/queries/commentQueries";
import { ADD_COMMENT } from "../../graphql/mutations/commentQueries";
import { GET_TASK } from "../../graphql/queries/taskQueries";

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

import TaskDetails from "../../Pages/TaskDetails";

function formatExpectedCommentTime(createdAt) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(createdAt));
}

function renderTaskDetails({
  loading = false,
  error = undefined,
  comments = [],
  task = {
    id: "task-1",
    title: "Task Details",
    description: "Task summary",
    status: "TODO",
    priority: "HIGH",
    assignedTo: { name: "Jane Doe" },
    createdBy: { name: "Alex Reporter" },
  },
  refetch = vi.fn(),
  addComment = vi.fn(),
  mutationState = {},
  taskId = "task-1",
} = {}) {
  useQueryMock.mockImplementation((query) => {
    if (query === GET_COMMENTS) {
      return {
        data: loading || error ? undefined : { comments },
        loading,
        error,
        refetch,
      };
    }

    if (query === GET_TASK) {
      return {
        data: loading || error ? undefined : { task },
        loading,
        error,
      };
    }

    throw new Error(`Unexpected query: ${String(query)}`);
  });

  useMutationMock.mockReturnValue([addComment, mutationState]);

  render(
    <MemoryRouter initialEntries={[`/task/${taskId}`]}>
      <Routes>
        <Route path="/task/:taskId" element={<TaskDetails />} />
      </Routes>
    </MemoryRouter>,
  );

  return { addComment, refetch };
}

describe("TaskDetails states", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useMutationMock.mockReset();
  });

  it("shows a loading message while comments are loading", () => {
    renderTaskDetails({ loading: true });

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows an error message when the comments query fails", () => {
    renderTaskDetails({ error: new Error("Query failed") });

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("queries comments using the task id from the route", () => {
    renderTaskDetails({ taskId: "task-77" });

    expect(useQueryMock).toHaveBeenCalledWith(GET_COMMENTS, {
      variables: { taskId: "task-77" },
    });
    expect(useQueryMock).toHaveBeenCalledWith(GET_TASK, {
      variables: { id: "task-77" },
    });
    expect(useMutationMock).toHaveBeenCalledWith(ADD_COMMENT);
  });

  it("renders the task details heading and fetched comments", () => {
    renderTaskDetails({
      comments: [
        { id: "1", message: "Looks good", user: { name: "Ragnar" } },
        { id: "2", message: "Ship it", user: { name: "Lagertha" } },
      ],
    });

    expect(
      screen.getByRole("heading", { name: "Task Details", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Ragnar")).toBeInTheDocument();
    expect(screen.getByText("Lagertha")).toBeInTheDocument();
    expect(screen.getByText("Looks good")).toBeInTheDocument();
    expect(screen.getByText("Ship it")).toBeInTheDocument();
  });

  it("renders the task description, priority, and reporter from the task query", () => {
    renderTaskDetails({
      task: {
        id: "task-1",
        title: "Task Details",
        description: "Investigate the board creation flow",
        status: "IN_PROGRESS",
        priority: "CRITICAL",
        assignedTo: { name: "Jane Doe" },
        createdBy: { name: "Alex Reporter" },
      },
    });

    expect(
      screen.getAllByText("Investigate the board creation flow").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getAllByText("Alex Reporter").length).toBeGreaterThan(0);
  });

  it("shows safe fallbacks when description, priority, or reporter are missing", () => {
    renderTaskDetails({
      task: {
        id: "task-1",
        title: "Task Details",
        description: null,
        status: "TODO",
        priority: null,
        assignedTo: null,
        createdBy: null,
      },
    });

    expect(
      screen.getAllByText("No description provided.").length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getAllByText("Unknown").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unassigned").length).toBeGreaterThan(0);
  });

  it("formats long task ids and comment timestamps for the issue view", () => {
    const createdAt = "2026-03-23T10:15:00.000Z";

    renderTaskDetails({
      taskId: "1234567890abcdef",
      comments: [
        {
          id: "1",
          message: "Looks good",
          createdAt,
          user: { name: "Ragnar" },
        },
      ],
    });

    expect(screen.getAllByText("TASK-12345678")).toHaveLength(2);
    expect(
      screen.getByText(formatExpectedCommentTime(createdAt)),
    ).toBeInTheDocument();
  });

  it("updates the comment input as the user types", () => {
    renderTaskDetails();

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "Please update the copy" },
    });

    expect(screen.getByPlaceholderText("Write a comment...")).toHaveValue(
      "Please update the copy",
    );
  });

  it("does not call the add comment mutation when the message is empty", () => {
    const addComment = vi.fn();

    renderTaskDetails({ addComment });

    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(addComment).not.toHaveBeenCalled();
  });

  it("does not call the add comment mutation when the message is only spaces", () => {
    const addComment = vi.fn();

    renderTaskDetails({ addComment });

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(addComment).not.toHaveBeenCalled();
  });

  it("adds a comment, clears the input and refetches comments", async () => {
    const addComment = vi.fn().mockResolvedValue({
      data: {
        addComment: { id: "3", message: "Please update the copy" },
      },
    });
    const refetch = vi.fn().mockResolvedValue({});

    renderTaskDetails({ addComment, refetch, taskId: "task-99" });

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "  Please update the copy  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(addComment).toHaveBeenCalledWith({
        variables: {
          taskId: "task-99",
          message: "Please update the copy",
        },
      });
    });

    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
      expect(screen.getByPlaceholderText("Write a comment...")).toHaveValue("");
    });
  });

  it("shows the mutation loading state while adding a comment", () => {
    renderTaskDetails({
      mutationState: { loading: true },
    });

    expect(
      screen.getByRole("button", { name: "Adding..." }),
    ).toBeDisabled();
  });

  it("shows an add comment error message when the mutation rejects", async () => {
    const addComment = vi.fn().mockRejectedValue(new Error("Create failed"));

    renderTaskDetails({ addComment });

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "Please update the copy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(await screen.findByText("Create failed")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Write a comment...")).toHaveValue(
      "Please update the copy",
    );
  });

  it("shows a fallback error when the mutation rejects without a message", async () => {
    const addComment = vi.fn().mockRejectedValue({});

    renderTaskDetails({ addComment });

    fireEvent.change(screen.getByPlaceholderText("Write a comment..."), {
      target: { value: "Please update the copy" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add" }));

    expect(
      await screen.findByText("Unable to add comment right now."),
    ).toBeInTheDocument();
  });

  it("shows the mutation error from apollo when present", () => {
    renderTaskDetails({
      mutationState: { error: new Error("Apollo mutation error") },
    });

    expect(
      screen.getByText("Apollo mutation error"),
    ).toBeInTheDocument();
  });

  it("shows Unknown User when the comment has no user name", () => {
    renderTaskDetails({
      comments: [{ id: "1", message: "No name comment", user: { name: null } }],
    });

    expect(screen.getByText("Unknown User")).toBeInTheDocument();
  });

  it("shows Just now when a comment has no createdAt", () => {
    renderTaskDetails({
      comments: [{ id: "1", message: "No timestamp", user: { name: "Bob" } }],
    });

    expect(screen.getAllByText("Just now").length).toBeGreaterThan(0);
  });

  it("shows Just now when a comment has an invalid createdAt date", () => {
    renderTaskDetails({
      comments: [
        {
          id: "1",
          message: "Bad date comment",
          createdAt: "not-a-date",
          user: { name: "Bob" },
        },
      ],
    });

    expect(screen.getAllByText("Just now").length).toBeGreaterThan(0);
  });

  it("renders an empty comment list when data has no comments field", () => {
    useQueryMock.mockImplementation((query) => {
      if (query === GET_COMMENTS) {
        return {
          data: { comments: null },
          loading: false,
          error: undefined,
          refetch: vi.fn(),
        };
      }

      if (query === GET_TASK) {
        return {
          data: {
            task: {
              id: "task-1",
              title: "Task Details",
              description: "Task summary",
              status: "TODO",
              priority: "HIGH",
              assignedTo: { name: "Jane Doe" },
              createdBy: { name: "Alex Reporter" },
            },
          },
          loading: false,
          error: undefined,
        };
      }

      throw new Error(`Unexpected query: ${String(query)}`);
    });
    useMutationMock.mockReturnValue([vi.fn(), {}]);

    render(
      <MemoryRouter initialEntries={["/task/task-1"]}>
        <Routes>
          <Route path="/task/:taskId" element={<TaskDetails />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("No comments yet")).toBeInTheDocument();
  });
});
