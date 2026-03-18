import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

import { ApolloProvider } from "@apollo/client";
import client from "./apollo/client.js";
import Login from "./Pages/Login.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <Login />
    </ApolloProvider>
  </StrictMode>,
);
