import React from "react";
import { useQuery } from "@apollo/client/react";
import { GET_USERS } from "./graphql/queries/userQueries";

function App() {
  const { loading, error, data } = useQuery(GET_USERS);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.users?.length) return <p>No users found.</p>;

  return (
    <div>
      <h1>Users</h1>
      {data.users.map((user) => (
        <p key={user.id}>{user.name}</p>
      ))}
    </div>
  );
}

export default App;
