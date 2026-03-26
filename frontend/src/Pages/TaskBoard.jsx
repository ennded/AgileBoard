import React, { useState } from "react";
import PropTypes from "prop-types";
import { useMutation, useQuery } from "@apollo/client";
import { useNavigate, useParams } from "react-router-dom";
import { GET_TASK_BOARD } from "../graphql/queries/taskQueries";
import {
  CREATE_TASK,
  UPDATE_TASK_STATUS,
} from "../graphql/mutations/taskMutations";
import { pointerWithin, DndContext, useDraggable, useDroppable } from "@dnd-kit/core";

const STATUS_MAP = {
  "Todo": "TODO",
  "In Progress": "IN_PROGRESS",
  "Done": "DONE",
};

const BOARD_COLUMNS = [
  { title: "Todo", key: "todo" },
  { title: "In Progress", key: "inProgress" },
  { title: "Done", key: "done" },
];

const STATUS_ACTIONS = [
  {
    label: "In Progress",
    status: "IN_PROGRESS",
    className: "text-xs bg-yellow-400 px-2 py-1 rounded",
  },
  {
    label: "Done",
    status: "DONE",
    className: "text-sm bg-green-500 text-white px-2 py-1 rounded",
  },
];

const taskShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
});

function TaskCard({ task, onOpenTask, onStatusChange }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="p-3 bg-gray-100 rounded shadow-sm cursor-grab"
    >
      <button
        type="button"
        onClick={() => onOpenTask(task.id)}
        className="mb-2 cursor-pointer text-left font-medium text-slate-900"
      >
        {task.title}
      </button>
      <div className="flex gap-2">
        {STATUS_ACTIONS.map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => onStatusChange(task.id, action.status)}
            className={action.className}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

TaskCard.propTypes = {
  task: taskShape.isRequired,
  onOpenTask: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
};

function TaskBoard() {
  const navigate = useNavigate();
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
  if (!data?.taskBoard)
    return <p className="p-4 text-red-500">Project not found.</p>;

  const { todo, inProgress, done } = data.taskBoard;
  const tasksByColumn = { todo, inProgress, done };
  const openTask = (taskId) => navigate(`/task/${taskId}`);

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

  const persistTaskStatus = async (taskId, status) => {
    try {
      await updateTaskStatus({
        variables: { taskId, status },
        refetchQueries: [{ query: GET_TASK_BOARD, variables: { projectId } }],
        awaitRefetchQueries: true,
      });
    } catch {
      refetch();
    }
  };

  const handleDragEnd = async ({ active, over }) => {
    if (!over || !active?.id || !over.id) return;

    await persistTaskStatus(active.id, over.id);
  };

  const handleStatusChange = async (taskId, status) => {
    await persistTaskStatus(taskId, status);
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
      <DndContext collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 gap-4">
          {BOARD_COLUMNS.map((column) => (
            <Column
              key={column.key}
              title={column.title}
              tasks={tasksByColumn[column.key]}
              onStatusChange={handleStatusChange}
              onOpenTask={openTask}
            />
          ))}
        </div>
      </DndContext>
    </div>
  );
}

export default TaskBoard;

function Column({ title, tasks, onStatusChange, onOpenTask }) {
  const statusId = STATUS_MAP[title];
  const { setNodeRef, isOver } = useDroppable({ id: statusId });

  return (
    <div
      ref={setNodeRef}
      className={`bg-white p-4 rounded shadow min-h-[200px] transition-colors ${
        isOver ? "bg-blue-50" : ""
      }`}
    >
      <h3 className="font-bold mb-3">{title}</h3>
      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onOpenTask={onOpenTask}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </div>
  );
}

Column.propTypes = {
  title: PropTypes.oneOf(Object.keys(STATUS_MAP)).isRequired,
  tasks: PropTypes.arrayOf(taskShape).isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onOpenTask: PropTypes.func.isRequired,
};
