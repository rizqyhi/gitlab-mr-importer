import { get } from "../src/mergeRequest.js";
import saveMergeRequest from "./src/saveMergeRequest.js";

export default async function handler(req, res) {
  try {
    if (req.headers["X-Gitlab-Token"] !== "SECRET_TOKEN") {
      return res.status(401).send("INVALID_SECRET");
    }

    if (req.body.event_type !== "merge_request") {
      return res.status(404).send("INVALID_EVENT");
    }

    const mr = await get(req.body.object_attribute.iid);

    console.log(mr);
    // await saveMergeRequest(mr);

    return res.status(200).send("OK");
  } catch (e) {
    return res.status(500).send("INTERNAL_ERROR");
  }
}