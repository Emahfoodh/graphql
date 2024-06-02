import { ApolloClient, DocumentNode, InMemoryCache } from '@apollo/client';

const uri = 'https://learn.reboot01.com/api/graphql-engine/v1/graphql';

export const fetchGQLData = async (
  myquery: DocumentNode,
  token: string,
  variables?: any,
) => {
  const client = new ApolloClient({
    uri,
    cache: new InMemoryCache(),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
    const response = await client.query({ query: myquery, variables });
    return response
};
