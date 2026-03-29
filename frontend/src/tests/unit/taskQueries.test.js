import { describe, expect, it } from "vitest";
import { print } from "graphql";

import { GET_TASK, GET_TASK_BOARD } from "../../graphql/queries/taskQueries";

describe("task queries", () => {
  it("requests the grouped task board columns", () => {
    const queryText = print(GET_TASK_BOARD);

    expect(queryText).toContain("query TaskBoard");
    expect(queryText).toContain("taskBoard");
    expect(queryText).toContain("todo");
    expect(queryText).toContain("inProgress");
    expect(queryText).toContain("done");
  });

  it("requests priority and createdBy for the task details view", () => {
    const queryText = print(GET_TASK);

    expect(queryText).toContain("query GetTask");
    expect(queryText).toContain("task(id: $id)");
    expect(queryText).toContain("description");
    expect(queryText).toContain("priority");
    expect(queryText).toContain("assignedTo");
    expect(queryText).toContain("createdBy");
    expect(queryText).toContain("name");
  });
});
