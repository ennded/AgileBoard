import React from "react";
import { useQuery } from "@apollo/client";
import { useParams } from "react-router-dom";
import { GET_TASK_BOARD } from "../graphql/queries/taskQueries";

function TaskBoard() {
  const { projectId } = useParams();
  const { data, loading, error } = useQuery(GET_TASK_BOARD, {
    variables: { projectId },
  });

  if (loading) return <p className="p-4">Loading...</p>;
  if (error)
    return <p className="p-4 text-red-500">Error loading task board.</p>;

  const { todo, inProgress, done } = data.taskBoard;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Task Board</h2>
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
