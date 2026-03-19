import React from "react";
import { MockedProvider } from "@apollo/client/testing";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "../../App.jsx";
import { GET_TEAMS } from "../../graphql/queries/teamQueries";

export function createTeamsMock(teamNames = ["Engineering"]) {
  return [
    {
      request: {
        query: GET_TEAMS,
      },
      result: {
        data: {
          teams: teamNames.map((name, index) => ({
            id: String(index + 1),
            name,
          })),
        },
      },
    },
  ];
}

export function renderAppRoute(initialEntries = ["/"], mocks = []) {
  render(
    <MockedProvider mocks={mocks}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </MockedProvider>,
  );
}
