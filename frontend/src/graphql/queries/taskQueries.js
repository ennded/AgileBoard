import { gql } from "@apollo/client";

export const GET_TASK_BOARD = gql`
  query TaskBoard($projectId: ID!) {
    taskBoard(projectId: $projectId) {
      todo {
        id
        title
      }
      inProgress {
        id
        title
      }
      done {
        id
        title
      }
    }
  }
`;
