import { gql } from "@apollo/client";

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String, $projectId: ID!) {
    createTask(
      title: $title
      description: $description
      projectId: $projectId
    ) {
      id
      title
      status
    }
  }
`;
