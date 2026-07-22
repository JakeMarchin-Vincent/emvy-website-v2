import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ─── Status labels ───────────────────────────────────────────
export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  ready_for_codex: 'Ready for Codex',
  in_codex: 'In Codex',
  needs_review: 'Needs Review',
  needs_fix: 'Needs Fix',
  testing: 'Testing',
  shipped: 'Shipped',
  blocked: 'Blocked',
  archived: 'Archived',
};

export const STATUS_ORDER = [
  'draft',
  'ready_for_codex',
  'in_codex',
  'needs_review',
  'needs_fix',
  'testing',
  'shipped',
  'blocked',
  'archived',
] as const;

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  later: 'Later',
};

export const PRIORITY_ORDER = ['critical', 'high', 'medium', 'low', 'later'] as const;

export function statusColor(status: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    draft: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)' },
    ready_for_codex: { fg: '#56d9ff', bg: 'rgba(86,217,255,0.10)', border: 'rgba(86,217,255,0.35)' },
    in_codex: { fg: '#818cf8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.35)' },
    needs_review: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    needs_fix: { fg: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.35)' },
    testing: { fg: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.35)' },
    shipped: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    blocked: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
    archived: { fg: '#64748b', bg: 'rgba(100,116,139,0.08)', border: 'rgba(100,116,139,0.20)' },
  };
  return colors[status] ?? colors.draft;
}

export function priorityColor(priority: string | undefined): { fg: string; bg: string } {
  const colors: Record<string, { fg: string; bg: string }> = {
    critical: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    high: { fg: '#fb923c', bg: 'rgba(251,146,60,0.10)' },
    medium: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
    low: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.06)' },
    later: { fg: '#64748b', bg: 'rgba(100,116,139,0.05)' },
  };
  return colors[priority ?? ''] ?? colors.medium;
}

const CREATED_INDEX = 'by_createdAt' as const;
const STATUS_INDEX = 'by_status' as const;
const SLICE_ID_INDEX = 'by_sliceId' as const;

// ─── Queries ───────────────────────────────────────────────────

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('ready_for_codex'),
        v.literal('in_codex'),
        v.literal('needs_review'),
        v.literal('needs_fix'),
        v.literal('testing'),
        v.literal('shipped'),
        v.literal('blocked'),
        v.literal('archived'),
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.status) {
      return await ctx.db
        .query('codex_slices')
        .withIndex(STATUS_INDEX, (q) => q.eq('status', args.status as 'draft'))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('codex_slices')
      .withIndex(CREATED_INDEX)
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('codex_slices') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getBySliceId = query({
  args: { sliceId: v.string() },
  handler: async (ctx, { sliceId }) => {
    return await ctx.db
      .query('codex_slices')
      .withIndex(SLICE_ID_INDEX, (q) => q.eq('sliceId', sliceId))
      .first();
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('codex_slices').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    for (const s of STATUS_ORDER) byStatus[s] = 0;
    for (const r of rows) {
      if (byStatus[r.status] !== undefined) byStatus[r.status] += 1;
    }
    return { total, byStatus };
  },
});

// ─── Mutations ─────────────────────────────────────────────────

export const create = mutation({
  args: {
    sliceId: v.string(),
    title: v.string(),
    context: v.string(),
    repoName: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    projectId: v.optional(v.id('build_projects')),
    objective: v.string(),
    scopeIn: v.optional(v.string()),
    scopeOut: v.optional(v.string()),
    dependencies: v.optional(v.array(v.string())),
    sourceOfTruth: v.optional(v.string()),
    acceptanceCriteria: v.optional(v.string()),
    tests: v.optional(v.string()),
    securityNotes: v.optional(v.string()),
    rollback: v.optional(v.string()),
    documentationUpdates: v.optional(v.string()),
    vaultUpdates: v.optional(v.string()),
    skillReviewNeeded: v.optional(v.boolean()),
    contentEvent: v.optional(v.boolean()),
    status: v.union(
      v.literal('draft'),
      v.literal('ready_for_codex'),
      v.literal('in_codex'),
      v.literal('needs_review'),
      v.literal('needs_fix'),
      v.literal('testing'),
      v.literal('shipped'),
      v.literal('blocked'),
      v.literal('archived'),
    ),
    priority: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low'), v.literal('later')),
    ),
    blocker: v.optional(v.string()),
    sourceRecordType: v.optional(v.string()),
    sourceRecordId: v.optional(v.string()),
    sourceTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert('codex_slices', {
      ...args,
      prLink: undefined,
      deploymentLink: undefined,
      testEvidence: undefined,
      createdAt: now,
      updatedAt: now,
      shippedAt: undefined,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id('codex_slices'),
    title: v.optional(v.string()),
    context: v.optional(v.string()),
    repoName: v.optional(v.string()),
    repoUrl: v.optional(v.string()),
    projectId: v.optional(v.id('build_projects')),
    objective: v.optional(v.string()),
    scopeIn: v.optional(v.string()),
    scopeOut: v.optional(v.string()),
    dependencies: v.optional(v.array(v.string())),
    sourceOfTruth: v.optional(v.string()),
    acceptanceCriteria: v.optional(v.string()),
    tests: v.optional(v.string()),
    securityNotes: v.optional(v.string()),
    rollback: v.optional(v.string()),
    documentationUpdates: v.optional(v.string()),
    vaultUpdates: v.optional(v.string()),
    skillReviewNeeded: v.optional(v.boolean()),
    contentEvent: v.optional(v.boolean()),
    status: v.optional(
      v.union(
        v.literal('draft'),
        v.literal('ready_for_codex'),
        v.literal('in_codex'),
        v.literal('needs_review'),
        v.literal('needs_fix'),
        v.literal('testing'),
        v.literal('shipped'),
        v.literal('blocked'),
        v.literal('archived'),
      )
    ),
    priority: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low'), v.literal('later')),
    ),
    prLink: v.optional(v.string()),
    deploymentLink: v.optional(v.string()),
    testEvidence: v.optional(v.string()),
    blocker: v.optional(v.string()),
    sourceRecordType: v.optional(v.string()),
    sourceRecordId: v.optional(v.string()),
    sourceTitle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const now = Date.now();
    const patch: Record<string, unknown> = { updatedAt: now };

    // If status is changing to shipped, set shippedAt
    if (fields.status === 'shipped') {
      patch.shippedAt = now;
    }

    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }

    await ctx.db.patch(id, patch);
    return await ctx.db.get(id);
  },
});
