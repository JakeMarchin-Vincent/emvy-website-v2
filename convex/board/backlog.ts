// Outreach backlog visibility — Slice 1 (board mirror).
//
// Mirror of emvy-website-v2/convex/board/backlog.ts. Per ADR 0002 /
// ADR-007: board schema is a mirror, not source of truth. Deploy website
// first, board second. UI imports `api.board.backlog.listBlocked` from
// the board's perspective; both repos deploy to glad-camel-940, so the
// function resolves either way.

import { mutation, query } from '../_generated/server'
import { v } from 'convex/values'

// ---------- Public query: listBlocked ----------
export const listBlocked = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const lim = Math.min(args.limit ?? 500, 500)

    const e2Rows = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'queued'))
      .filter((q) => q.eq(q.field('touch'), 2))
      .take(lim)
    const e3Rows = await ctx.db
      .query('outreach_queue')
      .withIndex('by_status', (q) => q.eq('status', 'queued'))
      .filter((q) => q.eq(q.field('touch'), 3))
      .take(lim)

    const all = [...e2Rows, ...e3Rows]

    type Row = {
      queueId: string
      leadId: string | null
      email: string
      company: string | null
      contact: string | null
      touch: number
      scheduledFor: number | null
      attempts: number | null
      sector: string | null
      source: string | null
      leadOutreachState: string | null
      blockedReason: 'e2_before_e1_sent' | 'e3_before_e2_sent'
      derivedE1SentAt: number | null
    }
    const out: Row[] = []
    for (const r of all) {
      if (!r.leadId) continue
      const lead = await ctx.db.get(r.leadId)
      if (!lead) continue
      if (lead.unsubscribedAt || lead.doNotContactAt) continue
      const history = (lead.outreachHistory ?? []) as Array<{ step: string }>
      const hasE1 = history.some((h) => h.step === 'e1')
      if (hasE1) continue
      const blockedReason: Row['blockedReason'] = r.touch === 2 ? 'e2_before_e1_sent' : 'e3_before_e2_sent'
      const e2Gap = 4 * 24 * 60 * 60 * 1000
      const e3Gap = 10 * 24 * 60 * 60 * 1000
      const derivedE1SentAt =
        r.touch === 2 && r.scheduledFor != null
          ? r.scheduledFor - e2Gap
          : r.touch === 3 && r.scheduledFor != null
          ? r.scheduledFor - e3Gap
          : null
      out.push({
        queueId: String(r._id),
        leadId: String(lead._id),
        email: r.email,
        company: r.company ?? null,
        contact: r.contact ?? null,
        touch: r.touch ?? 1,
        scheduledFor: r.scheduledFor ?? null,
        attempts: r.attempts ?? 0,
        sector: r.sector ?? null,
        source: r.source ?? null,
        leadOutreachState: lead.outreachState ?? null,
        blockedReason,
        derivedE1SentAt,
      })
    }

    const byLead = new Map<string, { email: string; company: string | null; touches: number[]; derivedE1SentAt: number | null; sector: string | null; source: string | null; attempts: number; queueIds: string[]; leadOutreachState: string | null }>()
    for (const r of out) {
      const key = r.leadId ?? r.email
      const cur = byLead.get(key)
      if (cur) {
        cur.touches.push(r.touch)
        cur.queueIds.push(r.queueId)
        cur.attempts = Math.max(cur.attempts, r.attempts ?? 0)
        if (r.derivedE1SentAt != null && (cur.derivedE1SentAt == null || r.derivedE1SentAt < cur.derivedE1SentAt)) {
          cur.derivedE1SentAt = r.derivedE1SentAt
        }
      } else {
        byLead.set(key, {
          email: r.email,
          company: r.company,
          touches: [r.touch],
          derivedE1SentAt: r.derivedE1SentAt,
          sector: r.sector,
          source: r.source,
          attempts: r.attempts ?? 0,
          queueIds: [r.queueId],
          leadOutreachState: r.leadOutreachState,
        })
      }
    }

    const groups = Array.from(byLead.entries()).map(([leadId, g]) => ({
      leadId,
      email: g.email,
      company: g.company,
      blockedTouches: g.touches.sort(),
      derivedE1SentAt: g.derivedE1SentAt,
      sector: g.sector,
      source: g.source,
      attempts: g.attempts,
      queueIds: g.queueIds,
      leadOutreachState: g.leadOutreachState,
    }))
    groups.sort((a, b) => (a.derivedE1SentAt ?? 0) - (b.derivedE1SentAt ?? 0))
    return { total: groups.length, rows: groups }
  },
})

// ---------- Public mutation: backfillLegacy ----------
//
// Board mirror of `emvy-website-v2/convex/board/backlog.ts:backfillLegacy`.
// The board mirror doesn't ship `convex/hermes/outreach2.ts` (website
// owns the canonical seam), so we can't call the internal mutation
// through the generated `internal.*` API. Instead we inline the same
// backfill logic here.
//
// SAFETY: this writes to lead.outreachState + lead.outreachHistory —
// the SAME fields the website's `markLegacyE1Backfilled` writes. It
// does NOT send any email, so the locked-law "single sender seam"
// invariant (Slice 2) is preserved: the only Resend caller in the
// entire stack is still `claimAndSendStep`. The board mirror has no
// seam-guard test, but the canonical website repo (sole deployer) does,
// and it does not flag this file.
export const backfillLegacy = mutation({
  args: {
    email: v.string(),
    e1SentAt: v.number(),
    e1Subject: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    ok: boolean
    leadId: string
    noop?: boolean
    reason?: string
    backfilledAt?: number
  }> => {
    const email = args.email.toLowerCase()
    const lead = await ctx.db
      .query('leads')
      .withIndex('by_email', (q) => q.eq('email', email))
      .first()
    if (!lead) {
      throw new Error(`backfillLegacy: lead not found for ${email}`)
    }
    if (lead.unsubscribedAt) {
      throw new Error(`backfillLegacy: lead ${email} is unsubscribed — refuse to backfill`)
    }
    if (lead.doNotContactAt) {
      throw new Error(`backfillLegacy: lead ${email} is do_not_contact — refuse to backfill`)
    }

    type OutreachHistoryEntry = {
      step: string
      sentAt: number
      resendMsgId?: string
      subject: string
    }
    const history = (lead.outreachHistory ?? []) as Array<OutreachHistoryEntry>
    const existingE1 = history.find((h) => h.step === 'e1')
    if (existingE1) {
      return { ok: true, leadId: String(lead._id), noop: true, reason: 'already_backfilled' }
    }

    const state = lead.outreachState ?? null
    if (state === 'e1_sent' || state === 'e2_sent' || state === 'e3_sent') {
      return { ok: true, leadId: String(lead._id), noop: true, reason: `already_advanced (state=${state})` }
    }

    const now = Date.now()
    const newEntry: OutreachHistoryEntry = {
      step: 'e1',
      sentAt: args.e1SentAt,
      subject: args.e1Subject ?? '(legacy pre-migration send via Brevo)',
    }
    history.push(newEntry)
    await ctx.db.patch(lead._id, {
      outreachState: 'e1_sent',
      outreachHistory: history,
    })

    await ctx.db.insert('activity_log', {
      leadId: lead._id,
      action: 'legacy_e1_backfilled',
      actor: 'hermes',
      details: `e1SentAt=${args.e1SentAt} subject=${args.e1Subject ?? ''} source=${args.source ?? 'ui'}`,
      timestamp: now,
    })

    return { ok: true, leadId: String(lead._id), backfilledAt: now }
  },
})
