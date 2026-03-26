import { useMutation } from "@apollo/client";
import { useState } from "react";
import { LOGIN } from "../graphql/mutations/authMutation";
import { Link, useNavigate } from "react-router-dom";
import React from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { loading, error }] = useMutation(LOGIN);

  const handleLogin = async () => {
    const res = await login({
      variables: { email, password },
    }).catch(() => null);

    const token = res?.data?.login?.token;

    if (!token) {
      return;
    }

    localStorage.setItem("token", token);
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <input
          className="w-full mb-3 p-2 border rounded"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm mt-3 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 font-semibold">
            Register
          </Link>
        </p>
        {error && (
          <p className="text-red-500 text-sm mt-2 text-center">
            Login failed. Please check your credentials.
          </p>
        )}
      </div>
    </div>
  );
}
