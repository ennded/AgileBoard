import { useMutation, useQuery } from "@apollo/client";
import React from "react";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GET_PROJECTS } from "../graphql/queries/projectQueries";
import { CREATE_PROJECT } from "../graphql/mutations/projectMutations";

function Project() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [projectName, setProjectName] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
    variables: { teamId },
  });

  const [
    createProject,
    { loading: creatingProject, error: createProjectError },
  ] = useMutation(CREATE_PROJECT);
  const projects = data?.projects ?? [];

  const handleCreateProject = async () => {
    if (!projectName) return;

    const res = await createProject({
      variables: {
        name: projectName,
        teamId,
      },
    }).catch(() => null);

    if (!res?.data?.createProject) {
      return;
    }

    setProjectName("");
    await refetch();
  };

  if (loading) return <p className="p-4">Loading..</p>;
  if (error) return <p className="p-4 text-red-500">Error</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Projects</h1>
      <div className="bg-white p-4 rounded shadow mb-6">
        <h2 className="font-semibold mb-2">Create Project</h2>
        <div className="flex gap-2">
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name"
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleCreateProject}
            disabled={creatingProject}
            className="bg-blue-500 text-white px-4 rounded"
          >
            {creatingProject ? "Adding..." : "Add"}
          </button>
        </div>
        {createProjectError && (
          <p className="mt-2 text-sm text-red-500">Error creating project</p>
        )}
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-3">Projects</h2>
        <ul className="space-y-2">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                type="button"
                onClick={() => navigate(`/project/${project.id}`)}
                className="w-full p-2 border rounded cursor-pointer text-left hover:bg-gray-100"
              >
                {project.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Project;
