export const USER_PROFILE_QUERY = `
  query {
    user {
      id
      username
      xp
      grades
      audits
      skills
    }
  }
`;