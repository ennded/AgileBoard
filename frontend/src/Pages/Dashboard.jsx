import { useMutation, useQuery } from "@apollo/client";
import React, { useState } from "react";
import { GET_TEAMS } from "../graphql/queries/teamQueries";
import { CREATE_TEAM } from "../graphql/mutations/teamMutation";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState("");
  const { data, loading, error, refetch } = useQuery(GET_TEAMS);
  const [createTeam, { loading: creatingTeam, error: createTeamError }] =
    useMutation(CREATE_TEAM);
  const teams = data?.teams ?? [];

  const handleCreateTeam = async () => {
    if (!teamName) {
      return;
    }

    try {
      await createTeam({
        variables: { name: teamName },
      });

      setTeamName("");
      await refetch();
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (error) return <p className="p-4 text-red-500">Error loading teams</p>;
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="mb-6 bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2">Create Team</h2>
        <div className="flex gap-2">
          <input
            className="border p-2 rounded w-full"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name"
          />
          <button
            onClick={handleCreateTeam}
            disabled={creatingTeam}
            className="bg-blue-500 text-white px-4 rounded"
          >
            {creatingTeam ? "Adding..." : "Add"}
          </button>
        </div>
        {createTeamError && (
          <p className="mt-2 text-sm text-red-500">Error creating team</p>
        )}
      </div>
      <div>
        <h2 className="font-semibold mb-3">My Teams</h2>
        <ul className="space-y-2">
          {teams.map((team) => (
            <li
              key={team.id}
              onClick={() => navigate(`/team/${team.id}`)}
              className="p-2 border rounded  cursor-pointer hover:bg-gray-100"
            >
              {team.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
