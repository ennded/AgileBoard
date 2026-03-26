import { gql } from "@apollo/client";

export const GET_COMMENTS = gql`
  query GetComments($taskId: ID!) {
    comments(taskId: $taskId) {
      id
      message
      createdAt
      user {
        name
      }
    }
  }
`;
