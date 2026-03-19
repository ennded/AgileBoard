import { describe, expect, it } from "vitest";
import { print } from "graphql";

import { CREATE_USER } from "./userMutations";

describe("CREATE_USER mutation", () => {
  it("requests the created user fields", () => {
    const mutationText = print(CREATE_USER);

    expect(mutationText).toContain("mutation CreateUser");
    expect(mutationText).toContain("createUser");
    expect(mutationText).toContain("name");
    expect(mutationText).toContain("email");
    expect(mutationText).toContain("id");
  });
});
