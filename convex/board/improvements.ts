import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ─── BOARD-009B: Retest status labels ─────────────────────────

export const RETEST_STATUS_LABELS: Record<string, string> = {
  not_required: 'Not Required',
  required: 'Retest Required',
  scheduled: 'Scheduled',
  completed_pass: 'Completed — Pass',
  completed_partial: 'Completed — Partial',
  completed_fail: 'Completed — Fail',
};

export function retestStatusColor(status: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    not_required: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)' },
    required: { fg: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.35)' },
    scheduled: { fg: '#56d9ff', bg: 'rgba(86,217,255,0.10)', border: 'rgba(86,217,255,0.35)' },
    completed_pass: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    completed_partial: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    completed_fail: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  };
  return colors[status] ?? colors.required;
}

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('captured'),
        v.literal('reviewed'),
        v.literal('approved'),
        v.literal('converted_to_slice'),
        v.literal('rejected'),
        v.literal('shipped'),
        v.literal('archived'),
      ),
    ),
    source: v.optional(
      v.union(
        v.literal('call_failure'),
        v.literal('client_feedback'),
        v.literal('website_review'),
        v.literal('codex_finding'),
        v.literal('bug'),
        v.literal('sales_objection'),
        v.literal('manual_observation'),
        v.literal('analytics'),
        v.literal('email'),
      ),
    ),
    impact: v.optional(
      v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.status) {
      return await ctx.db
        .query('improvements')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    if (args.source) {
      return await ctx.db
        .query('improvements')
        .withIndex('by_source', (q) => q.eq('source', args.source!))
        .order('desc')
        .take(limit);
    }
    if (args.impact) {
      return await ctx.db
        .query('improvements')
        .withIndex('by_impact', (q) => q.eq('impact', args.impact!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('improvements')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('improvements') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// Related-record queries for cross-linking.
// NOTE: improvements has no index on `relatedClientId` or `relatedVoiceTestId`,
// so these scan with a small limit. Add indexes if these become hot paths.

export const listByRelatedClientId = query({
  args: { clientId: v.id('clients'), limit: v.optional(v.number()) },
  handler: async (ctx, { clientId, limit }) => {
    const max = limit ?? 20;
    const rows = await ctx.db
      .query('improvements')
      .withIndex('by_createdAt')
      .order('desc')
      .take(100);
    return rows.filter((r) => r.relatedClientId === clientId).slice(0, max);
  },
});

export const listByRelatedVoiceTestId = query({
  args: { voiceTestId: v.id('voice_tests'), limit: v.optional(v.number()) },
  handler: async (ctx, { voiceTestId, limit }) => {
    const max = limit ?? 10;
    const rows = await ctx.db
      .query('improvements')
      .withIndex('by_createdAt')
      .order('desc')
      .take(100);
    return rows.filter((r) => r.relatedVoiceTestId === voiceTestId).slice(0, max);
  },
});

export const listByProposedSliceId = query({
  args: { sliceId: v.id('codex_slices'), limit: v.optional(v.number()) },
  handler: async (ctx, { sliceId, limit }) => {
    return await ctx.db
      .query('improvements')
      .withIndex('by_proposedSliceId', (q) => q.eq('proposedSliceId', sliceId as any))
      .order('desc')
      .take(limit ?? 20);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    source: v.union(
      v.literal('call_failure'),
      v.literal('client_feedback'),
      v.literal('website_review'),
      v.literal('codex_finding'),
      v.literal('bug'),
      v.literal('sales_objection'),
      v.literal('manual_observation'),
      v.literal('analytics'),
      v.literal('email'),
    ),
    relatedProjectId: v.optional(v.id('build_projects')),
    relatedVoiceTestId: v.optional(v.id('voice_tests')),
    relatedClientId: v.optional(v.id('clients')),
    evidence: v.string(),
    impact: v.union(v.literal('high'), v.literal('medium'), v.literal('low')),
    effort: v.union(v.literal('small'), v.literal('medium'), v.literal('large'), v.literal('unknown')),
    priority: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low')),
    ),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    const evidence = args.evidence.trim();
    if (!title) throw new Error('Improvement title cannot be empty');
    if (!evidence) throw new Error('Evidence cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('improvements', {
      title,
      source: args.source,
      relatedProjectId: args.relatedProjectId || undefined,
      relatedVoiceTestId: args.relatedVoiceTestId || undefined,
      relatedClientId: args.relatedClientId || undefined,
      evidence,
      impact: args.impact,
      effort: args.effort,
      priority: args.priority || undefined,
      status: 'captured',
      proposedSliceId: undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('improvements'),
    title: v.optional(v.string()),
    source: v.optional(
      v.union(
        v.literal('call_failure'),
        v.literal('client_feedback'),
        v.literal('website_review'),
        v.literal('codex_finding'),
        v.literal('bug'),
        v.literal('sales_objection'),
        v.literal('manual_observation'),
        v.literal('analytics'),
        v.literal('email'),
      ),
    ),
    relatedProjectId: v.optional(v.id('build_projects')),
    relatedVoiceTestId: v.optional(v.id('voice_tests')),
    relatedClientId: v.optional(v.id('clients')),
    evidence: v.optional(v.string()),
    impact: v.optional(v.union(v.literal('high'), v.literal('medium'), v.literal('low'))),
    effort: v.optional(v.union(v.literal('small'), v.literal('medium'), v.literal('large'), v.literal('unknown'))),
    priority: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low')),
    ),
    status: v.optional(
      v.union(
        v.literal('captured'),
        v.literal('reviewed'),
        v.literal('approved'),
        v.literal('converted_to_slice'),
        v.literal('rejected'),
        v.literal('shipped'),
        v.literal('archived'),
      ),
    ),
    proposedSliceId: v.optional(v.id('codex_slices')),
    // BOARD-009B — retest lifecycle support
    retestStatus: v.optional(
      v.union(
        v.literal('not_required'),
        v.literal('required'),
        v.literal('scheduled'),
        v.literal('completed_pass'),
        v.literal('completed_partial'),
        v.literal('completed_fail'),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error('Improvement not found');
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) patch.title = args.title.trim();
    if (args.source !== undefined) patch.source = args.source;
    if (args.relatedProjectId !== undefined) patch.relatedProjectId = args.relatedProjectId || undefined;
    if (args.relatedVoiceTestId !== undefined) patch.relatedVoiceTestId = args.relatedVoiceTestId || undefined;
    if (args.relatedClientId !== undefined) patch.relatedClientId = args.relatedClientId || undefined;
    if (args.evidence !== undefined) patch.evidence = args.evidence.trim();
    if (args.impact !== undefined) patch.impact = args.impact;
    if (args.effort !== undefined) patch.effort = args.effort;
    if (args.priority !== undefined) patch.priority = args.priority || undefined;
    if (args.status !== undefined) patch.status = args.status;
    if (args.proposedSliceId !== undefined) patch.proposedSliceId = args.proposedSliceId || undefined;
    if (args.retestStatus !== undefined) patch.retestStatus = args.retestStatus || undefined;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('improvements').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    const byImpact: Record<string, number> = {};
    let pendingReview = 0;
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byImpact[r.impact] = (byImpact[r.impact] ?? 0) + 1;
      if (r.status === 'captured' || r.status === 'reviewed') pendingReview += 1;
    }
    return { total, pendingReview, byStatus, byImpact };
  },
});

// ─── BOARD-009B: Retest-ready mutations ───────────────────────

/** Update an improvement's retestStatus without touching other fields. */
export const setRetestStatus = mutation({
  args: {
    id: v.id('improvements'),
    retestStatus: v.union(
      v.literal('not_required'),
      v.literal('required'),
      v.literal('scheduled'),
      v.literal('completed_pass'),
      v.literal('completed_partial'),
      v.literal('completed_fail'),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { retestStatus: args.retestStatus, updatedAt: Date.now() });
    return { ok: true };
  },
});

/**
 * Mark an improvement as reviewed (operator confirms retest passed).
 * Does NOT auto-close. Operator must take explicit action to resolve.
 */
export const markReadyForReviewAfterRetest = mutation({
  args: {
    id: v.id('improvements'),
    // Guard: caller must confirm the retest passed. If true and current
    // retestStatus is completed_pass, transition to 'reviewed'.
    confirmedRetestPassed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error('Improvement not found');
    if (!args.confirmedRetestPassed) throw new Error('Retest must be confirmed before marking ready for review');
    if (row.retestStatus !== 'completed_pass') throw new Error('Retest must be completed_pass before marking ready for review');
    await ctx.db.patch(args.id, { status: 'reviewed', updatedAt: Date.now() });
    return { ok: true };
  },
});
