# 03 — Remove the website Convex backend and unused server surface

**What to build:** The public website builds and serves its retained routes without a Convex package, function tree, deployment job or orphaned API endpoints.

**Blocked by:** 02 — Deliver local contact and retire unused visitor routes.

**Status:** ready-for-agent

- [ ] Every remaining API route and webhook is classified against real website callers and external provider configuration before deletion.
- [ ] No retained page or server route imports Convex, and the dependency, generated functions, deploy workflow and related configuration are removed from the website source.
- [ ] Board/provider data is preserved; the separate Board/AI Consultancy SaaS backend is not changed by this ticket.
- [ ] Build, typecheck and route smoke checks pass; removed endpoints cannot execute.
