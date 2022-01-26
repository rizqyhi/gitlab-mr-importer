import graphqlClient from "./graphqlClient.js";

export async function get(id) {
  const response = await graphqlClient(
    `
    query GetMergeRequest($id: String!) {
      project(fullPath: "dicoding-dev/dicoding") {
        mergeRequest(iid: $id) {
          id
          iid
          createdAt
          mergedAt
          state
          title
          commitCount
          userNotesCount
          userDiscussionsCount
          author {
            id
            username
          }
          reviewers {
            nodes {
              id
              username
            }
          }
          notes {
            nodes {
              id
              body
              createdAt
              system
              author {
                id
                username
              }
            }
          }
        }
      }
    }      
    `,
    { id }
  );

  return response.project.mergeRequest;
}
