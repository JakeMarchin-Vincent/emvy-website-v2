---
status: ready-for-agent
source: founder direction on 2026-09-25, live site review, and approved ticket breakdown
---

# EMVY Website V2 — focused public site and Convex removal

## Problem Statement

The current public site at `emvyai.com` feels generic, repeats stock imagery and broad AI copy, and carries old quiz, blog, operator and backend code from an earlier learning phase. The GitHub default branch is older than the public deployment, making the released source hard to review. A visitor needs a simple, credible choice between contacting EMVY about a local consultation and booking an online consultation.

## Solution

Publish the verified live-source baseline to a clean GitHub branch, then deliver a focused public site with Home, Services, Use Cases, About, Contact, Privacy and Terms. Give the local/contact path primary visual priority and retain a distinct online Cal.com booking path. Keep the contact form functional through a minimal server-side email handler. Retire the quiz, blog, Spark Response/operator and other unused public/API routes, preserve sensible legacy URL redirects, and remove the website's Convex runtime, functions, deployment workflow and dependency. Make the design distinctive to EMVY's approved identity and actual workflow approach without invented customer proof. Release only after browser, build and review evidence ties the source commit to `emvyai.com`.

## User Stories

1. As a Perth business owner, I want the first screen to say what EMVY improves in plain language, so that I can judge relevance quickly.
2. As a prospective local client, I want an obvious Contact Us path for a local consultation, so that I can explain my workflow and location without booking a remote call.
3. As a prospective remote client, I want an online consult option, so that I can select a time through the existing Cal.com event.
4. As either visitor, I want the two consultation options to be clearly distinguished, so that I understand what happens after clicking.
5. As a visitor on a phone, I want the navigation and primary action visible without an oversized header, so that I can act without hunting.
6. As a visitor, I want concise services and use-case explanations grounded in real workflows, so that I can understand EMVY's approach without generic AI promises.
7. As a visitor, I want contact submission to confirm only after delivery succeeds, so that I know my enquiry was actually received.
8. As a visitor, I want validation and useful error feedback, so that I can correct a failed enquiry without losing my message.
9. As a visitor following an old link, I want to land on a useful current page, so that an obsolete URL does not lead to a dead end.
10. As the founder, I want obsolete quiz, blog and operator surfaces absent from the deployed website, so that clients see a focused public experience.
11. As the founder, I want the website to run without Convex or Board functions, so that it has only the backend needed for public contact.
12. As the founder, I want the exact live source published and reviewed in GitHub, so that future work begins from an auditable branch and commit.
13. As the founder, I want evidence from desktop and mobile browser QA and a source-to-deployment readback, so that release status is not inferred from a green local build.

## Implementation Decisions

- Treat the clean 2026-08-18 live-matching commit as the initial source baseline; verify its content against production, publish it to a dedicated GitHub branch, and keep the dirty local integration checkout untouched.
- Use the founder-approved cyan-on-black logo and capabilities direction. Favor strong editorial typography, disciplined spacing and real operational imagery or evidence. Remove repeated decorative photo grids and generic AI illustration patterns.
- Primary public action: Contact Us for a local consultation, using the contact form and an explicit local-consult intent. Secondary public action: Book an online consult through the currently approved Cal.com AI Consult event. Do not imply a walk-in address or guarantee an in-person meeting before the founder confirms arrangements.
- Keep a small public information architecture: Home, Services, Use Cases, About, Contact, Privacy and Terms. Remove unused page source and server endpoints after checking for real callers and provider webhooks. Keep only redirects with a meaningful destination.
- Contact processing uses a server-only email provider, validates and bounds input, applies proportionate abuse protection, and returns success only when delivery succeeds. No Convex write or public credential is required.
- Remove website-owned Convex code and automation only after no retained route imports it. Do not delete provider data or change the separate Board/AI Consultancy SaaS backend as part of this website cleanup.
- Keep copy aligned with the current EMVY operating source: practical AI, smarter operations, one real workflow and honest assessment/build decisions. Distinguish any free one-workflow entry offer from a full paid assessment; do not invent pricing or outcomes.
- Preserve Privacy and Terms content until reviewed; any changed contact data handling must be reflected accurately in privacy copy before release.

## Testing Decisions

- Highest-value seam, confirmed by the founder on 2026-09-25: from each retained desktop and 390px mobile page, a visitor can choose the correct local/contact or online/Cal.com path; one controlled local enquiry is delivered without Convex; retired routes cannot execute; build and two-axis review pass.
- Browser QA checks navigation, mobile menu, CTA targets, focus/keyboard states, reduced motion, layout overflow, and truthful page content. Prior art: the existing Lighthouse and website browser checks.
- Server-side contact tests cover valid delivery, invalid input, missing provider configuration, provider failure and duplicate/abuse behavior at the API boundary. Test observable response and delivery calls, not private implementation details.
- Static checks confirm no retained website route or package imports Convex and no Convex deployment workflow remains. Preserve useful redirects and verify old URL destinations.
- Verify production separately from local build and GitHub publication: exact commit, Vercel deployment, public URL and controlled contact acceptance.

## Out of Scope

- Deleting or migrating historical Convex provider data.
- Changing Board, AI Consultancy SaaS, Hermes, Cal.com account configuration or other providers beyond the website's confirmed public call link.
- Publishing fabricated case studies, metrics, testimonials or client identities.
- New booking infrastructure, CRM, blog CMS, assessment app or operator dashboard.

## Further Notes

- The old `/assessment` and Spark Response paths already redirect to Services; `/blog` redirects toward Resources. Retiring source routes must retain a useful external-link path.
- The 2026-07-15 launch plan is prior learning, not current CTA authority. The founder's 2026-09-25 dual local/online direction supersedes its single-consult CTA assumption.
- Inherited baseline: approved brand assets and capabilities cover, existing Cal.com link, the successful lean IA, the previous browser/SEO release checks, and server-side provider boundaries. Changed for this build: local contact becomes primary, online booking remains secondary, and the website no longer owns a shared Convex backend.
