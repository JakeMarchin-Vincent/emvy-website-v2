# Ticket 01 — Centralise and migrate EMVY consult booking CTAs

**Status:** ready-for-agent

- **Founder approval:** Dusk explicitly requested the EMVY website be aligned with the new Cal.com account and consult booking on 2026-08-18.
- **Canonical URL:** `https://cal.com/jake-emvyai/ai-consult`
- **Scope:** Replace only EMVY AI Consult and consult-style booking CTAs that currently use `https://cal.com/jake-emvy/discovery-call`.
- **Preserve:** Unrelated product, demo and client-specific booking destinations.
- **Acceptance:** Header, Footer, home, contact, services, use-cases, discovery-call, AI strategy and assessment fallback resolve to the canonical URL.
- **Acceptance:** No obsolete consult URL remains in production website source.
- **Acceptance:** Existing tests and production build pass.
- **Acceptance:** Representative browser/live checks confirm the canonical destination without creating a booking.
- **TDD/seam plan:** Add a repository assertion that counts canonical consult references, rejects obsolete consult references outside explicit historical/spec documentation, and verifies unrelated booking URLs remain unchanged.
- **External boundary:** Deployment is explicitly requested by the founder; no booking creation, provider mutation or outbound communication is performed.
