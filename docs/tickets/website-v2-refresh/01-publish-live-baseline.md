# 01 — Publish the live website source as a reviewable GitHub baseline

**What to build:** Give the founder a clean GitHub branch and PR whose public pages, booking links and redirects match the current `emvyai.com` deployment.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The baseline is taken from the clean live-matching commit, with its Vercel/content correlation recorded and the unrelated dirty checkout untouched.
- [ ] A dedicated registered worktree and branch contain the spec, ticket evidence and source baseline; the build-process preflight passes before an implementation edit.
- [ ] The branch is pushed to GitHub and a reviewable PR identifies the source commit and the difference from GitHub `main`.
- [ ] No production deployment or Convex provider mutation occurs in this ticket.
