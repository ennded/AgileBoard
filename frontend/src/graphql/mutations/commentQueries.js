import { gql } from "@apollo/client";
export const ADD_COMMENT = gql`
  mutation AddComment($taskId: ID!, $message: String!) {
    addComment(taskId: $taskId, message: $message) {
      id
      message
    }
  }
`;
