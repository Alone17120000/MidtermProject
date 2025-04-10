// lib/apolloClient.ts // <--- Đường dẫn đúng
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_API_URL || 'http://localhost:4000/graphql';

const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: graphqlUri,
    }),
    cache: new InMemoryCache(),
  });
};

const client = createApolloClient();

export default client;