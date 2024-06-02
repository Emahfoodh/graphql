import { gql } from '@apollo/client';

export const GET_USER = gql`
  query {
    user {
      id
      login
      email
      campus
      lastName
      firstName
      attrs(path: "gender")
    }
  }
`;

export const GET_USER_WITH_AUDIT = gql`
  query {
    user {
      id
      login
      firstName
      lastName
      auditRatio
      totalUp
      totalDown
      attrs(path: "gender")
    }
  }
`;

export const GET_XP = gql`
  query totalXP($userId: Int!, $rootEventId: Int!) {
    xp: transaction_aggregate(
      where: {
        userId: { _eq: $userId }
        type: { _eq: "xp" }
        eventId: { _eq: $rootEventId }
      }
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
  }
`;

export const GET_MODULE_EVENT = gql`
  query user($userId: Int!, $modulePath: String!) {
    user(where: { id: { _eq: $userId } }) {
      events(where: { event: { path: { _eq: $modulePath } } }) {
        eventId
        level
        event {
          campus
          createdAt
          endAt
          id
          path
          registrationId
        }
      }
    }
  }
`;

export const GET_PROJECTS_TRANSACTIONS = gql`
  query Transaction($userId: Int!, $eventId: Int!) {
    transaction(
      where: {
        type: { _eq: "xp" }
        eventId: { _eq: $eventId }
        originEventId: { _eq: $eventId }
        userId: { _eq: $userId }
      }
    ) {
      amount
      createdAt
      object {
        name
      }
    }
  }
`;

export const GET_PROJECTS_DATA = gql`
  query Object($eventId: Int!, $registrationId: Int!) {
    object(
      where: {
        type: { _eq: "module" }
        events: { id: { _eq: $eventId } }
        registrations: { id: { _eq: $registrationId } }
      }
    ) {
      type
      name
      childrenRelation {
        attrs
        key
      }
    }
  }
`;

export const GET_SKILLS = gql`
  query Transaction($userId: Int!) {
    transaction(
      order_by: [{ type: desc }, { amount: desc }]
      distinct_on: [type]
      where: { userId: { _eq: $userId }, type: { _like: "skill_%" } }
    ) {
      type
      amount
    }
  }
`;

// to get the prerequisites for the module
export const GET_MODULE_CHILDREN = gql`
  query Object($eventId: Int!, $registrationId: Int!) {
    object(
      where: {
        type: { _eq: "module" }
        events: { id: { _eq: $eventId } }
        registrations: { id: { _eq: $registrationId } }
      }
    ) {
      type
      name
      childrenRelation {
        attrs
        key
        paths {
          object {
            name
          }
        }
      }
    }
  }
`;
