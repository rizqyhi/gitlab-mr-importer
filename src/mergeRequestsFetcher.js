import "dotenv/config";
import fetch from "node-fetch";
import reverse from "lodash/reverse.js";

const query = `
  { 
    project(fullPath: "dicoding-dev/dicoding") {
      mergeRequests(_FILTERS_) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
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
  }
`;

async function fetchMergeRequests(queryString) {
  try {
    const response = await fetch("https://gitlab.com/api/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query.replace("_FILTERS_", queryString),
      }),
    });

    const data = await response.json();
    const mergeRequests = data.data.project.mergeRequests.nodes.map((mr) => {
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

      return {
        ...mr,
        iid: parseInt(mr.iid),
        reviewers,
        notes,
        systemNotesCount: notes.length,
        startReviewedAt: startReviewNote ? startReviewNote.createdAt : null,
        reviewRequestedByAuthor,
        hasReviewedByOther:
          reviewers.length > 0 &&
          reviewers.some((reviewer) => reviewer.id !== mr.author.id),
      };
    });

    return {
      hasNextPage: data.data.project.mergeRequests.pageInfo.hasNextPage,
      nextPageCursor: data.data.project.mergeRequests.pageInfo.endCursor,
      mergeRequests: reverse(mergeRequests),
    };
  } catch (e) {
    console.error(e);
  }
}

export async function fetchAll(startCursor = "", limit = 10) {
  let filterString = `first: ${limit}, `;

  if (startCursor) {
    filterString += `after: "${startCursor}"`;
  }

  await fetchMergeRequests(filterString);
}

export async function fetchAllAfter(createdAfter) {
  await fetchMergeRequests(`createdAfter: "${createdAfter}"`);
}
