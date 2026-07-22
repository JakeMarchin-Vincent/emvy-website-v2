import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ─── Constants ─────────────────────────────────────────────────

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  configured: 'Configured',
  testing: 'Testing',
  pitch_ready: 'Pitch Ready',
  live: 'Live',
  paused: 'Paused',
  broken: 'Broken',
  archived: 'Archived',
};

export const PRODUCT_FAMILY_LABELS: Record<string, string> = {
  receptionist: 'Receptionist',
  sales: 'Sales',
  support: 'Support',
  booking: 'Booking',
  follow_up: 'Follow-up',
  other: 'Other',
};

export const VERTICAL_LABELS: Record<string, string> = {
  emvy_internal: 'EMVY Internal',
  hospitality: 'Hospitality',
  trades: 'Trades',
  real_estate: 'Real Estate',
  other: 'Other',
};

export function statusColor(status: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    draft: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)' },
    configured: { fg: '#56d9ff', bg: 'rgba(86,217,255,0.10)', border: 'rgba(86,217,255,0.35)' },
    testing: { fg: '#a78bfa', bg: 'rgba(167,139,250,0.10)', border: 'rgba(167,139,250,0.35)' },
    pitch_ready: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    live: { fg: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.40)' },
    paused: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    broken: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
    archived: { fg: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.20)' },
  };
  return colors[status] ?? colors.draft;
}

// ─── Queries ───────────────────────────────────────────────────

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('configured'),
        v.literal('testing'),
        v.literal('pitch_ready'),
        v.literal('live'),
        v.literal('paused'),
        v.literal('broken'),
        v.literal('archived'),
      )
    ),
    vertical: v.optional(
      v.union(
        v.literal('emvy_internal'),
        v.literal('hospitality'),
        v.literal('trades'),
        v.literal('real_estate'),
        v.literal('other'),
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.status) {
      return await ctx.db
        .query('voice_agents')
        .withIndex('by_status', (q) => q.eq('status', args.status as 'draft'))
        .take(limit);
    }
    if (args.vertical) {
      return await ctx.db
        .query('voice_agents')
        .withIndex('by_vertical', (q) => q.eq('vertical', args.vertical as 'emvy_internal'))
        .take(limit);
    }
    return await ctx.db
      .query('voice_agents')
      .withIndex('by_name')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('voice_agents') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('voice_agents').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    for (const s of ['draft', 'configured', 'testing', 'pitch_ready', 'live', 'paused', 'broken', 'archived']) {
      byStatus[s] = 0;
    }
    let pitchReady = 0;
    for (const r of rows) {
      if (byStatus[r.status] !== undefined) byStatus[r.status] += 1;
      if (r.status === 'pitch_ready' || r.status === 'live') pitchReady += 1;
    }
    return { total, pitchReady, byStatus };
  },
});

// ─── Mutations ─────────────────────────────────────────────────

export const create = mutation({
  args: {
    name: v.string(),
    productFamily: v.union(
      v.literal('receptionist'),
      v.literal('sales'),
      v.literal('support'),
      v.literal('booking'),
      v.literal('follow_up'),
      v.literal('other'),
    ),
    vertical: v.union(
      v.literal('emvy_internal'),
      v.literal('hospitality'),
      v.literal('trades'),
      v.literal('real_estate'),
      v.literal('other'),
    ),
    platform: v.union(
      v.literal('retell'),
      v.literal('vapi'),
      v.literal('telnyx'),
      v.literal('other'),
    ),
    phoneNumberRef: v.optional(v.string()),
    repoName: v.optional(v.string()),
    deploymentUrl: v.optional(v.string()),
    status: v.union(
      v.literal('draft'),
      v.literal('configured'),
      v.literal('testing'),
      v.literal('pitch_ready'),
      v.literal('live'),
      v.literal('paused'),
      v.literal('broken'),
      v.literal('archived'),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('voice_agents', {
      ...args,
      lastTestedAt: undefined,
      passRate: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('voice_agents'),
    name: v.optional(v.string()),
    productFamily: v.optional(
      v.union(
        v.literal('receptionist'),
        v.literal('sales'),
        v.literal('support'),
        v.literal('booking'),
        v.literal('follow_up'),
        v.literal('other'),
      )
    ),
    vertical: v.optional(
      v.union(
        v.literal('emvy_internal'),
        v.literal('hospitality'),
        v.literal('trades'),
        v.literal('real_estate'),
        v.literal('other'),
      )
    ),
    platform: v.optional(
      v.union(
        v.literal('retell'),
        v.literal('vapi'),
        v.literal('telnyx'),
        v.literal('other'),
      )
    ),
    phoneNumberRef: v.optional(v.string()),
    repoName: v.optional(v.string()),
    deploymentUrl: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('configured'),
        v.literal('testing'),
        v.literal('pitch_ready'),
        v.literal('live'),
        v.literal('paused'),
        v.literal('broken'),
        v.literal('archived'),
      )
    ),
    lastTestedAt: v.optional(v.number()),
    passRate: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }
    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});
