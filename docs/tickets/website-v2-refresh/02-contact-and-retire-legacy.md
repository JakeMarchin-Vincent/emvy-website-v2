# 02 — Deliver local contact and retire unused visitor routes

**What to build:** A visitor can send a local-consult enquiry and receive a truthful result, while the old quiz, blog and operator experiences no longer execute.

**Blocked by:** 01 — Publish the live website source as a reviewable GitHub baseline.

**Status:** ready-for-agent

- [ ] Contact requests validate and bound input, protect the route from basic abuse, and report success only after server-side email delivery succeeds without Convex.
- [ ] The form makes local-consult intent explicit and preserves input on failure.
- [ ] The assessment, blog and operator page/API source is retired after checking for external callers; useful old URLs redirect to current pages.
- [ ] Controlled contact-delivery and negative-path tests pass, and desktop/mobile browser checks confirm the form and redirects.
