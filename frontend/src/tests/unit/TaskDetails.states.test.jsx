import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import { GET_COMMENTS } from "../../graphql/queries/commentQueries";
import { ADD_COMMENT } from "../../graphql/mutations/commentQueries";

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
  refetch = vi.fn(),
  addComment = vi.fn(),
  mutationState = {},
  taskId = "task-1",
} = {}) {
  useQueryMock.mockReturnValue({
    data: loading || error ? undefined : { comments },
    loading,
    error,
    refetch,
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
});
