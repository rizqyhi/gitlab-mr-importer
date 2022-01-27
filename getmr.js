import saveMergeRequest from "./src/saveMergeRequest.js";
import { get } from "./src/mergeRequest.js";

(async () => {
  const mr = await get("1868");

  await saveMergeRequest(mr);
})();
