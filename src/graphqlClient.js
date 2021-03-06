import "dotenv/config";
import fetch from "node-fetch";

export default async function graphqlClient(query, variables = {}) {
  try {
    const response = await fetch("https://gitlab.com/api/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITLAB_TOKEN}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const responseBody = await response.json();

    if (responseBody.errors) {
      throw Error(responseBody.errors[0].message);
    }

    return responseBody.data;
  } catch (e) {
    console.log("[GRAPHQL ERROR]: ", e.message);
  }
}
