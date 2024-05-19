import { API_ENDPOINTS } from "./Config.js";

/**
 * 
 * @param {String} query 
 * @param {String} token 
 * @returns 
 */
export async function fetchGraphQL(query, token) {
  const response = await fetch(API_ENDPOINTS.GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  const result = await response.json();
  if (result.errors) {
    // @ts-ignore
    throw new Error(result.errors.map(error => error.message).join(', '));
  }

  return result.data;
}
