import supabase from "./supabase.js";

export async function insertUser(pid, username) {
  const { data: user, error } = await supabase
    .from("gitlab_users")
    .insert([{ pid, username }]);

  if (error) {
    if (error.details.includes("already exists")) return;

    console.error("[ERROR]", error.message, error.details);
    return;
  }

  console.log("[NEW GITLAB USER]", user);
}

export async function insertReviewers(mrPid, reviewers) {
  await supabase.from("merge_request_reviewers").delete().eq("mr_pid", mrPid);

  const { error } = await supabase.from("merge_request_reviewers").insert(
    reviewers.map((reviewer) => ({
      mr_pid: mrPid,
      reviewer_pid: reviewer.id,
    }))
  );

  if (error && error.details.includes("already exists")) {
    console.error("[ERROR]", error.message, error.details);
    return;
  }

  console.log("[REVIWER SYNCED]");
}

export async function insertMR(mr) {
  const { error } = await supabase.from("merge_requests").upsert([
    {
      id: mr.iid,
      pid: mr.id,
      state: mr.state,
      title: mr.title,
      created_at: mr.createdAt,
      start_reviewed_at: mr.startReviewedAt,
      merged_at: mr.mergedAt,
      commit_count: mr.commitCount,
      discussion_count: mr.userDiscussionsCount,
      user_notes_count: mr.userNotesCount,
      system_notes_count: mr.systemNotesCount,
      is_review_requested_by_author: mr.reviewRequestedByAuthor,
      is_reviewed_by_other: mr.hasReviewedByOther,
      author_pid: mr.author.id,
      notes: mr.notes,
      raw: mr,
    },
  ]);

  if (error && error.details.includes("already exists")) {
    console.error("[ERROR] already exists");
    return;
  }

  console.log("[MR SAVED]", mr.iid);
}

export default async function saveMergeRequest(mr) {
  await insertUser(mr.author.id, mr.author.username);

  for (const reviewer of mr.reviewers) {
    await insertUser(reviewer.id, reviewer.username);
  }

  await insertMR(mr);
  await insertReviewers(mr.id, mr.reviewers);
}
