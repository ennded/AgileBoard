const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers");
const getUserFromToken = require("./utils/auth");
const User = require("./models/User");

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const server = new ApolloServer({
    typeDefs,
    resolvers,

    context: async ({ req }) => {
      const token = req.headers.authorization || " ";
      const userId = getUserFromToken(token.replace("Bearer ", ""));
      const user = userId ? await User.findById(userId) : null;
      return { user };
    },
  });

  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB connected");
    })
    .catch((err) => console.log(err));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(
      `Server running at http://localhost:${PORT}${server.graphqlPath}`,
    );
  });
}

startServer();
