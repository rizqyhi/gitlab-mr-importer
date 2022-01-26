import supabase from "./supabase";
import { fetchAllAfter } from "./src/mergeRequestsFetcher.js";
import saveMergeRequest from "./src/saveMergeRequest.js";

(async () => {
  const { data: lastMergeRequest } = await supabase
    .from("merge_request_reviewers")
    .select()
    .eq("mr_pid", mrPid)
    .eq("reviewer_pid", reviewerPid)
    .limit(1)
    .single();

  const response = await fetchAllAfter();

  for (const mr of response.mergeRequests) {
    console.log("[PROCESSING MR]", mr.iid);
    await saveMergeRequest(mr);
  }

  console.log("Finish");
})();
