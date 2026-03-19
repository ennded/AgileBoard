import { gql } from "@apollo/client";

export const GET_PROJECTS = gql`
  query GetProjects($teamId: ID!) {
    projects(teamId: $teamId) {
      id
      name
    }
  }
`;
