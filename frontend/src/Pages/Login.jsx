import { useMutation } from "@apollo/client";
import { useState } from "react";
import { LOGIN } from "../graphql/mutations/authMutation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [login, { loading, error }] = useMutation(LOGIN);

  const handleLogin = async () => {
    try {
      const res = await login({
        variables: { email, password },
      });

      console.log(res);

      const token = res.data.login.token;
      localStorage.setItem("token", token);
      alert("Login Successful!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className=" h-screen flex items-center justify-center bg-gray-100 ">
      <div className="bg-white p-6 rounded-lg shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center">Login</h2>
        <input
          className="w-full mb-3 p-2 border rounded"
          type="text"
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
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2 ">Login failed</p>}
      </div>
    </div>
  );
}
