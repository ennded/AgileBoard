import { gql } from "@apollo/client";

export const GET_TEAMS = gql`
  query {
    teams {
      id
      name
    }
  }
`;
