import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client";

const graphqlUri =
  import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:5001/graphql";

const httpLink = new HttpLink({
  uri: graphqlUri,
});

// ✅ Use ApolloLink instead of setContext
const authLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem("token");

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  }));

  return forward(operation);
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export default client;
