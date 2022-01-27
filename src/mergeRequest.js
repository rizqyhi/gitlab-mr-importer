import graphqlClient from "./graphqlClient.js";

function formatMergeRequest(mr) {
  const reviewers = mr.reviewers.nodes;
  const notes = mr.notes.nodes.filter((note) => note.system);
  const startReviewNote = notes.find((note) =>
    note.body.includes("requested review from")
  );
  const reviewRequestedByAuthor = notes.some(
    (note) =>
      note.body.includes("requested review from") &&
      note.author.id === mr.author.id
  );
  const hasReviewedByOther =
    reviewers.length > 0 &&
    reviewers.some((reviewer) => reviewer.id !== mr.author.id);

  return {
    ...mr,
    iid: parseInt(mr.iid),
    reviewers,
    notes,
    systemNotesCount: notes.length,
    startReviewedAt: startReviewNote ? startReviewNote.createdAt : null,
    reviewRequestedByAuthor,
    hasReviewedByOther,
  };
}

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
    { id: id.toString() }
  );

  return formatMergeRequest(response.project.mergeRequest);
}
