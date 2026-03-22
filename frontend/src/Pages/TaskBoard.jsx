import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_TASK_BOARD } from "../graphql/queries/taskQueries";
import {
  CREATE_TASK,
  UPDATE_TASK_STATUS,
} from "../graphql/mutations/taskMutations";

function TaskBoard() {
  const [title, setTitle] = useState("");
  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS);
  const [submitError, setSubmitError] = useState("");
  const [createTask, { loading: isCreating, error: mutationError }] =
    useMutation(CREATE_TASK);
  const { projectId } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_TASK_BOARD, {
    variables: { projectId },
  });

  if (loading) return <p className="p-4">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-500">Error loading task board.</p>;

  const { todo, inProgress, done } = data.taskBoard;

  const handleCreateTask = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle || isCreating) return;

    setSubmitError("");

    try {
      await createTask({
        variables: {
          title: trimmedTitle,
          projectId,
        },
      });

      setTitle("");
      await refetch();
    } catch (error) {
      setSubmitError(error.message || "Unable to create task right now.");
    }
  };

  const handleStatusChange = async (taskId, status) => {
    await updateTaskStatus({
      variables: { taskId, status },
    });
    refetch();
  };

  const createErrorMessage =
    submitError || mutationError?.message || "Unable to create task right now.";

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Task Board</h2>
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Create Task</h2>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleCreateTask}
            disabled={isCreating}
            className="bg-blue-500 text-white px-4 rounded"
          >
            {isCreating ? "Adding..." : "Add"}
          </button>
        </div>
        {(submitError || mutationError) && (
          <p className="mt-2 text-sm text-red-500">{createErrorMessage}</p>
        )}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Column title="Todo" tasks={todo} onStatusChange={handleStatusChange} />
        <Column
          title="In Progress"
          tasks={inProgress}
          onStatusChange={handleStatusChange}
        />
        <Column title="Done" tasks={done} onStatusChange={handleStatusChange} />
      </div>
    </div>
  );
}

export default TaskBoard;

function Column({ title, tasks, onStatusChange }) {
  return (
    <div className="bg-white p-4 rounded shadow ">
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 bg-gray-100 rounded shadow-sm">
            <p className="mb-2">{task.title}</p>
            <div>
              <button
                onClick={() => onStatusChange(task.id, "IN_PROGRESS")}
                className="text-xs bg-yellow-400 px-2 py-1 rounded"
              >
                In Progress
              </button>
              <button
                onClick={() => onStatusChange(task.id, "DONE")}
                className="text-sm bg-green-500 text-white px-2 py-1 rounded"
              >
                Done
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
