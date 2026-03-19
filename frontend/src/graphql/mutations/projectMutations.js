import { gql } from "@apollo/client";
export const CREATE_PROJECT = gql`
  mutation CreateProject($name: String!, $teamId: ID!) {
    createProject(name: $name, teamId: $teamId) {
      id
      name
    }
  }
`;
