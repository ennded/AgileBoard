import React from "react";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, screen } from "@testing-library/react";

import App from "./App.jsx";
import { GET_USERS } from "./graphql/queries/userQueries";

const mocks = [
  {
    request: {
      query: GET_USERS,
    },
    result: {
      data: {
        users: [
          { id: "1", name: "Sangam" },
          { id: "2", name: "John" },
          { id: "3", name: "Alex" },
        ],
      },
    },
  },
];

describe("App integration", () => {
  it("renders users returned by GraphQL", async () => {
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();

    expect(await screen.findByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Sangam")).toBeInTheDocument();
    expect(screen.getByText("John")).toBeInTheDocument();
    expect(screen.getByText("Alex")).toBeInTheDocument();
  });
});
