import { describe, expect, it } from "vitest";
import { print } from "graphql";

import { GET_USERS } from "../../graphql/queries/userQueries";

describe("GET_USERS query", () => {
  it("requests the user id and name fields", () => {
    const queryText = print(GET_USERS);

    expect(queryText).toContain("users");
    expect(queryText).toContain("id");
    expect(queryText).toContain("name");
  });
});
