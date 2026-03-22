import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_TASK_BOARD } from "../graphql/queries/taskQueries";
import { CREATE_TASK } from "../graphql/mutations/taskMutations";

function TaskBoard() {
  const [title, setTitle] = useState("");
  const [createTask] = useMutation(CREATE_TASK);
  const { projectId } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_TASK_BOARD, {
    variables: { projectId },
  });

  if (loading) return <p className="p-4">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-500">Error loading task board.</p>;

  const { todo, inProgress, done } = data.taskBoard;

  const handleCreateTask = async () => {
    if (!title) return;
    await createTask({
      variables: {
        title,
        projectId,
      },
    });

    setTitle("");
    refetch();
  };
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
            className="bg-blue-500 text-white px-4 rounded"
          >
            Add
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Column title="Todo" tasks={todo} />
        <Column title="In Progress" tasks={inProgress} />
        <Column title="Done" tasks={done} />
      </div>
    </div>
  );
}

export default TaskBoard;

function Column({ title, tasks }) {
  return (
    <div className="bg-white p-4 rounded shadow ">
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="p-3 bg-gray-100 rounded shadow-sm">
            {task.title}
          </div>
        ))}
      </div>
    </div>
  );
}
