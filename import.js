import * as readline from "readline";
import { stdin as input, stdout as output } from "process";
import { fetchAll } from "./src/mergeRequestsFetcher.js";
import saveMergeRequest from "./src/saveMergeRequest.js";

(async () => {
  const rl = readline.createInterface({ input, output });

  async function runImporter(cursor = "") {
    const response = await fetchAll(cursor, 50);

    for (const mr of response.mergeRequests) {
      console.log("[PROCESSING MR]", mr.iid);
      await saveMergeRequest(mr);
    }

    if (!response.hasNextPage) {
      console.log("Finish");
      return rl.close();
    }

    rl.question("Continue fetch? [y/n]", function (answer) {
      if (answer !== "y") {
        console.log("Finish");
        return rl.close();
      }

      runImporter(response.nextPageCursor);
    });
  }

  await runImporter();
})();
