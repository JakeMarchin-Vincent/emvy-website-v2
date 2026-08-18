---
title: EMVY Website — Canonical 20-minute AI Consult Booking Specification
labels: [ready-for-agent]
status: ready-for-agent
created: 2026-08-09
---

# EMVY Website — Canonical 20-minute AI Consult Booking Specification

## Problem Statement

The EMVY website still sends public consultation CTAs and its assessment booking fallback to an obsolete Cal.com account and event. The new public 20-minute EMVY AI Consult exists on the current Cal.com account, but visitors can still enter the old scheduling path from the Header, Footer, home, contact, service and use-case pages.

## Solution

Make the new 20-minute EMVY AI Consult the single canonical public booking URL for the website. Every public CTA that promises an EMVY consult and the assessment booking fallback resolve from one website-owned configuration value. The implementation updates only EMVY consult links; unrelated product/demo booking flows retain their separately configured destinations.

## User Stories

1. As a website visitor, I want every EMVY AI Consult CTA to take me to the current booking event, so that I can book without finding an obsolete calendar.
2. As a website visitor, I want the Header and Footer booking actions to match page CTAs, so that the booking destination is consistent throughout the site.
3. As a prospect completing the assessment flow, I want its booking fallback to use the same current consult event, so that the conversion path does not fork.
4. As the founder, I want the booking address defined once, so that a future Cal.com change does not require a risky scattered replacement.
5. As the founder, I want existing product/demo booking flows preserved unless explicitly mapped, so that a generic link update cannot break client-facing demonstrations.
6. As the founder, I want automated evidence that no obsolete public consult URL remains, so that the migration is complete rather than page-by-page guesswork.

## Implementation Decisions

- The canonical EMVY public consult destination is `https://cal.com/jake-emvyai/ai-consult`.
- Website configuration owns the public URL. Public site CTAs and the assessment fallback consume that one value rather than retaining inline Cal.com URLs.
- The migration scope is limited to the obsolete EMVY consult destination. Product/demo calendar controls, provider settings, Retell, Cal.com event configuration, Convex schema and webhooks are outside this website slice.
- Existing copy that says “20-minute AI Consult” remains aligned with the new event. No website redesign or page deletion is included.

## Testing Decisions

- Every mapped EMVY consult CTA resolves to the canonical new event, and the assessment fallback resolves to that same destination.
- A repository-level assertion proves the obsolete public consult URL has no remaining production use. Test fixtures, history and unrelated demo routes may retain historical references only when explicitly excluded by the test.
- The relevant website build and existing automated test suite remain green.
- Browser verification covers representative Header, Footer, home, contact, services and assessment conversion paths without making an external booking.

## Out of Scope

- Cal.com provider event changes, Retell configuration, actual bookings, provider webhooks or Convex changes.
- Website-v2 cleanup, page deletion, route consolidation or copy redesign.
- Any client/demo booking destination not explicitly mapped to the EMVY AI Consult.
