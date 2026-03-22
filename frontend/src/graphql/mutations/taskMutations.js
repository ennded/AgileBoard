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

export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($taskId: ID!, $status: TaskStatus!) {
    UpdateTaskStatus(taskId: $taskId, status: $status) {
      id
      status
    }
  }
`;
