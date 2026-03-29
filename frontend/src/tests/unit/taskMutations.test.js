import { describe, expect, it } from "vitest";
import { print } from "graphql";

import {
  CREATE_TASK,
  UPDATE_TASK,
  UPDATE_TASK_STATUS,
} from "../../graphql/mutations/taskMutations";

describe("task mutations", () => {
  it("defines createTask with the new input payload and requested fields", () => {
    const mutationText = print(CREATE_TASK);

    expect(mutationText).toContain("mutation CreateTask");
    expect(mutationText).toContain("$input: CreateTaskInput!");
    expect(mutationText).toContain("createTask(input: $input)");
    expect(mutationText).toContain("description");
    expect(mutationText).toContain("priority");
    expect(mutationText).toContain("createdBy");
  });

  it("defines updateTask with the editable task fields", () => {
    const mutationText = print(UPDATE_TASK);

    expect(mutationText).toContain("mutation UpdateTask");
    expect(mutationText).toContain("$id: ID!");
    expect(mutationText).toContain("$input: UpdateTaskInput!");
    expect(mutationText).toContain("updateTask(id: $id, input: $input)");
    expect(mutationText).toContain("title");
    expect(mutationText).toContain("description");
    expect(mutationText).toContain("status");
    expect(mutationText).toContain("priority");
  });

  it("keeps updateTaskStatus focused on id and status", () => {
    const mutationText = print(UPDATE_TASK_STATUS);

    expect(mutationText).toContain("mutation UpdateTaskStatus");
    expect(mutationText).toContain("updateTaskStatus");
    expect(mutationText).toContain("id");
    expect(mutationText).toContain("status");
  });
});
