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

export const GET_TASK = gql`
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      status
      priority
      assignedTo {
        id
        name
      }
      createdBy {
        id
        name
      }
    }
  }
`;
