
export const USER_PROFILE_QUERY = `
  query {
    user {
      id
    }
  }
`;

export const totalXPQuery = `
query totalXP($userId: Int!, $rootEventId: Int!) {
    xp: transaction_aggregate(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        eventId: { _eq: $rootEventId }
      }
    ) { aggregate { sum { amount } } } 
}`;

export const totalLevelQuery = `
query totalLevel($userId: Int!, $rootEventId: Int!) {
  level: transaction(
    limit: 1
    order_by: { amount: desc }
    where: {
      userId: { _eq: $userId }
      type: { _eq: "level" }
      eventId: { _eq: $rootEventId }
    }
  ) { amount }
}`;