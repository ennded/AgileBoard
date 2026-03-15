import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client/react";

import { GET_USERS } from "./graphql/queries/userQueries";
import { CREATE_USER } from "./graphql/mutations/userMutations";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState("");

  const { loading, error, data } = useQuery(GET_USERS);

  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");

    try {
      await createUser({
        variables: { name, email },
      });

      setName("");
      setEmail("");
    } catch (err) {
      setSubmitError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>Add user</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Create User</button>
      </form>
      {submitError ? <p>{submitError}</p> : null}

      <h2>Users</h2>
      {data.users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        data.users.map((user) => <p key={user.id}>{user.name}</p>)
      )}
    </div>
  );
}

export default App;
