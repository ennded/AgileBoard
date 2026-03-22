import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { GET_COMMENTS } from "../graphql/queries/commentQueries";
import { ADD_COMMENT } from "../graphql/mutations/commentQueries";

function getUserInitials(name = "Unknown User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatTaskReference(taskId = "") {
  if (!taskId) return "TASK";
  if (taskId.length <= 12) return taskId.toUpperCase();
  return `TASK-${taskId.slice(0, 8).toUpperCase()}`;
}

function formatCommentTime(createdAt) {
  if (!createdAt) return "Just now";

  const date = new Date(createdAt);

  if (Number.isNaN(date.getTime())) return "Just now";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function TaskDetails() {
  const { taskId } = useParams();
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const { data, loading, error, refetch } = useQuery(GET_COMMENTS, {
    variables: { taskId },
  });

  const [addComment, { loading: isAdding, error: mutationError }] =
    useMutation(ADD_COMMENT);

  const handleAddComment = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isAdding) return;

    setSubmitError("");

    try {
      await addComment({
        variables: {
          taskId,
          message: trimmedMessage,
        },
      });
      setMessage("");
      await refetch();
    } catch (mutationFailure) {
      setSubmitError(
        mutationFailure.message || "Unable to add comment right now.",
      );
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error</p>;

  const comments = data?.comments ?? [];
  const commentErrorMessage =
    submitError || mutationError?.message || "Unable to add comment right now.";
  const taskReference = formatTaskReference(taskId);
  const commentCountLabel =
    comments.length === 1 ? "1 comment" : `${comments.length} comments`;

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-slate-900">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="font-medium text-slate-700">Projects</span>
          <span>/</span>
          <span>Agile Board</span>
          <span>/</span>
          <span>Issue</span>
          <span>/</span>
          <span className="font-semibold text-slate-800">{taskReference}</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
          <div className="flex flex-col gap-5 border-b border-slate-200 px-5 py-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge tone="issue">Story</Badge>
                <Badge tone="status">In Progress</Badge>
                <Badge tone="muted">{taskReference}</Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                Task Details
              </h1>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
                Review the latest delivery discussion, issue context, and
                collaboration updates for this work item in a Jira-style issue
                view.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <ActionButton label="Share" />
              <ActionButton label="Watch" />
              <ActionButton label="More" />
            </div>
          </div>

          <div className="grid xl:grid-cols-[minmax(0,1fr)_320px]">
            <main className="min-w-0 border-b border-slate-200 xl:border-b-0 xl:border-r xl:border-slate-200">
              <div className="border-b border-slate-200 px-5 pt-4">
                <div className="flex flex-wrap items-center gap-6">
                  <button className="border-b-2 border-slate-900 pb-4 text-sm font-semibold text-slate-950">
                    Activity
                  </button>
                  <button className="pb-4 text-sm font-medium text-slate-500">
                    Work log
                  </button>
                  <button className="pb-4 text-sm font-medium text-slate-500">
                    History
                  </button>
                </div>
              </div>

              <section className="border-b border-slate-200 px-5 py-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Description
                    </h2>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      This issue captures task discussion and team updates. Use
                      the activity thread below to document progress, blockers,
                      and implementation notes.
                    </p>
                  </div>
                  <button className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                    Edit
                  </button>
                </div>
              </section>

              <section className="px-5 py-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Comments
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {commentCountLabel} in this issue activity thread.
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-700">
                    Newest first
                  </span>
                </div>

                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-sm font-semibold text-slate-900">
                        C
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-slate-950">
                        No comments yet
                      </h3>
                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                        Start the activity thread with a short progress update
                        or a blocker for the team.
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => {
                      const authorName = comment.user?.name || "Unknown User";

                      return (
                        <article
                          key={comment.id}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                              {getUserInitials(authorName)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-semibold text-slate-950">
                                    {authorName}
                                  </p>
                                  <span className="text-xs text-slate-400">
                                    commented
                                  </span>
                                </div>
                                <span className="text-xs text-slate-400">
                                  {formatCommentTime(comment.createdAt)}
                                </span>
                              </div>
                              <div className="mt-3 rounded-lg bg-slate-50 px-4 py-3">
                                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                  {comment.message}
                                </p>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            </main>

            <aside className="min-w-0 bg-white">
              <section className="border-b border-slate-200 px-5 py-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-base font-semibold text-slate-950">
                    Add Comment
                  </h2>
                  <button className="text-sm font-medium text-slate-500 transition hover:text-slate-900">
                    Preview
                  </button>
                </div>

                <div className="mt-4 space-y-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write a comment..."
                    rows={8}
                    className="min-h-[220px] w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs leading-5 text-slate-500">
                      Visible to everyone following this issue.
                    </p>
                    <button
                      onClick={handleAddComment}
                      disabled={isAdding}
                      className="inline-flex min-w-[110px] items-center justify-center rounded-md border border-slate-900 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
                    >
                      {isAdding ? "Adding..." : "Add"}
                    </button>
                  </div>
                </div>

                {(submitError || mutationError) && (
                  <div className="mt-4 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {commentErrorMessage}
                  </div>
                )}
              </section>

              <section className="border-b border-slate-200 px-5 py-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Details
                </h3>
                <div className="mt-4 space-y-4">
                  <DetailRow label="Assignee" value="Unassigned" />
                  <DetailRow label="Reporter" value="Project Admin" />
                  <DetailRow label="Priority" value="Medium" />
                  <DetailRow label="Sprint" value="Current Sprint" />
                  <DetailRow label="Labels" value="frontend, collaboration" />
                </div>
              </section>

              <section className="px-5 py-5">
                <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
                  People
                </h3>
                <div className="mt-4 space-y-3">
                  <PersonRow label="Assignee" value="Unassigned" initials="UA" />
                  <PersonRow label="Reporter" value="Admin" initials="AD" />
                  <PersonRow label="Watchers" value="3 watching" initials="3" />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetails;

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <span className="text-right text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function ActionButton({ label }) {
  return (
    <button className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
      {label}
    </button>
  );
}

function Badge({ children, tone }) {
  const toneClasses = {
    issue: "border-slate-300 bg-slate-100 text-slate-700",
    status: "border-slate-900 bg-slate-900 text-white",
    muted: "border-slate-300 bg-white text-slate-700",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

function PersonRow({ label, value, initials }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-medium text-slate-500">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
          {initials}
        </div>
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      </div>
    </div>
  );
}
