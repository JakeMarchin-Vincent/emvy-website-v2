import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ─── Constants ─────────────────────────────────────────────────

export const RESULT_LABELS: Record<string, string> = {
  pass: 'Pass',
  fail: 'Fail',
  partial: 'Partial',
  retest_needed: 'Retest Needed',
};

export const FAILURE_TYPE_LABELS: Record<string, string> = {
  no_answer: 'No Answer',
  dead_air: 'Dead Air',
  misheard_caller: 'Misheard Caller',
  wrong_intent: 'Wrong Intent',
  bad_escalation: 'Bad Escalation',
  missed_required_field: 'Missed Required Field',
  overpromised: 'Overpromised',
  looped_response: 'Looped Response',
  bad_handoff: 'Bad Handoff',
  bad_close: 'Bad Close',
  latency_issue: 'Latency Issue',
  tool_failure: 'Tool Failure',
};

export function resultColor(result: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    pass: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    partial: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    fail: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
    retest_needed: { fg: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.35)' },
  };
  return colors[result] ?? colors.partial;
}

// ─── Retest labels ──────────────────────────────────────────────

export const RETEST_RESULT_LABELS: Record<string, string> = {
  pass: 'Pass',
  partial: 'Partial',
  fail: 'Fail',
};

export function retestResultColor(result: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    pass: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    partial: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    fail: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  };
  return colors[result] ?? colors.partial;
}

export function failureTypeSeverity(type: string): 'critical' | 'high' | 'medium' | 'low' {
  const map: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    no_answer: 'critical',
    dead_air: 'critical',
    overpromised: 'critical',
    tool_failure: 'critical',
    misheard_caller: 'high',
    wrong_intent: 'high',
    bad_escalation: 'high',
    missed_required_field: 'high',
    looped_response: 'high',
    bad_handoff: 'medium',
    bad_close: 'medium',
    latency_issue: 'medium',
  };
  return map[type] ?? 'medium';
}

// ─── Queries ───────────────────────────────────────────────────

export const list = query({
  args: {
    agentId: v.optional(v.id('voice_agents')),
    result: v.optional(
      v.union(
        v.literal('pass'),
        v.literal('fail'),
        v.literal('partial'),
        v.literal('retest_needed'),
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    if (args.agentId) {
      return await ctx.db
        .query('voice_tests')
        .withIndex('by_agentId', (q) => q.eq('agentId', args.agentId as any))
        .order('desc')
        .take(limit);
    }
    if (args.result) {
      return await ctx.db
        .query('voice_tests')
        .withIndex('by_result', (q) => q.eq('result', args.result as 'pass'))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('voice_tests')
      .withIndex('by_testedAt')
      .order('desc')
      .take(limit);
  },
});

export const listWithAgents = query({
  args: {
    agentId: v.optional(v.id('voice_agents')),
    result: v.optional(
      v.union(
        v.literal('pass'),
        v.literal('fail'),
        v.literal('partial'),
        v.literal('retest_needed'),
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 200;
    let tests;
    if (args.agentId) {
      tests = await ctx.db
        .query('voice_tests')
        .withIndex('by_agentId', (q) => q.eq('agentId', args.agentId as any))
        .order('desc')
        .take(limit);
    } else if (args.result) {
      tests = await ctx.db
        .query('voice_tests')
        .withIndex('by_result', (q) => q.eq('result', args.result as 'pass'))
        .order('desc')
        .take(limit);
    } else {
      tests = await ctx.db
        .query('voice_tests')
        .withIndex('by_testedAt')
        .order('desc')
        .take(limit);
    }

    // Resolve agent names + fix slice titles
    const agentIds = [...new Set(tests.map((t) => t.agentId))];
    const agents = await Promise.all(
      agentIds.map((id) => ctx.db.get(id))
    );
    const agentMap = Object.fromEntries(
      agents.filter(Boolean).map((a) => [a!._id, a!.name])
    );

    const fixSliceIds = [...new Set(tests.filter((t) => t.fixSliceId).map((t) => t.fixSliceId!))];
    const fixSlices = await Promise.all(
      fixSliceIds.map((id) => ctx.db.get(id))
    );
    const fixSliceMap = Object.fromEntries(
      fixSlices.filter(Boolean).map((s) => [s!._id, s!.title])
    );

    return tests.map((t) => ({
      ...t,
      agentName: agentMap[t.agentId] ?? 'Unknown',
      fixSliceTitle: t.fixSliceId ? (fixSliceMap[t.fixSliceId] ?? null) : null,
    }));
  },
});

// Related-record query for cross-linking — find voice tests linked to a codex slice.
export const listByFixSliceId = query({
  args: { fixSliceId: v.id('codex_slices'), limit: v.optional(v.number()) },
  handler: async (ctx, { fixSliceId, limit }) => {
    return await ctx.db
      .query('voice_tests')
      .withIndex('by_fixSliceId', (q) => q.eq('fixSliceId', fixSliceId as any))
      .order('desc')
      .take(limit ?? 20);
  },
});

export const get = query({
  args: { id: v.id('voice_tests') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const getWithAgent = query({
  args: { id: v.id('voice_tests') },
  handler: async (ctx, { id }) => {
    const test = await ctx.db.get(id);
    if (!test) return null;
    const agent = test ? await ctx.db.get(test.agentId) : null;
    let fixSliceTitle: string | null = null;
    if (test.fixSliceId) {
      const fix = await ctx.db.get(test.fixSliceId);
      fixSliceTitle = fix?.title ?? null;
    }
    return { ...test, agentName: agent?.name ?? 'Unknown', fixSliceTitle };
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('voice_tests').take(5000);
    const total = rows.length;
    const byResult: Record<string, number> = { pass: 0, fail: 0, partial: 0, retest_needed: 0 };
    const byFailureType: Record<string, number> = {};
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    let thisWeek = 0;
    let failed = 0;
    for (const r of rows) {
      if (byResult[r.result] !== undefined) byResult[r.result] += 1;
      if (r.failureType) {
        byFailureType[r.failureType] = (byFailureType[r.failureType] ?? 0) + 1;
      }
      if (r.testedAt >= sevenDaysAgo) thisWeek += 1;
      if (r.result === 'fail') failed += 1;
    }
    return { total, thisWeek, failed, byResult, byFailureType };
  },
});

// ─── Mutations ─────────────────────────────────────────────────

export const create = mutation({
  args: {
    agentId: v.id('voice_agents'),
    testScriptId: v.optional(v.string()),
    scenario: v.string(),
    result: v.union(
      v.literal('pass'),
      v.literal('fail'),
      v.literal('partial'),
      v.literal('retest_needed'),
    ),
    failureType: v.optional(
      v.union(
        v.literal('no_answer'),
        v.literal('dead_air'),
        v.literal('misheard_caller'),
        v.literal('wrong_intent'),
        v.literal('bad_escalation'),
        v.literal('missed_required_field'),
        v.literal('overpromised'),
        v.literal('looped_response'),
        v.literal('bad_handoff'),
        v.literal('bad_close'),
        v.literal('latency_issue'),
        v.literal('tool_failure'),
      )
    ),
    transcriptLink: v.optional(v.string()),
    recordingLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    fixSliceId: v.optional(v.id('codex_slices')),
    testedBy: v.string(),
    testedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('voice_tests', {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    // Update agent lastTestedAt
    await ctx.db.patch(args.agentId, { lastTestedAt: Date.now(), updatedAt: Date.now() });
    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id('voice_tests'),
    scenario: v.optional(v.string()),
    result: v.optional(
      v.union(
        v.literal('pass'),
        v.literal('fail'),
        v.literal('partial'),
        v.literal('retest_needed'),
      )
    ),
    failureType: v.optional(
      v.union(
        v.literal('no_answer'),
        v.literal('dead_air'),
        v.literal('misheard_caller'),
        v.literal('wrong_intent'),
        v.literal('bad_escalation'),
        v.literal('missed_required_field'),
        v.literal('overpromised'),
        v.literal('looped_response'),
        v.literal('bad_handoff'),
        v.literal('bad_close'),
        v.literal('latency_issue'),
        v.literal('tool_failure'),
      )
    ),
    transcriptLink: v.optional(v.string()),
    recordingLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    fixSliceId: v.optional(v.id('codex_slices')),
    testedBy: v.optional(v.string()),
    testedAt: v.optional(v.number()),
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

// ─── BOARD-009B: Retest queries & mutations ─────────────────

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

/** List all retests linked to a voice test via retestOfTestId. */
export const listRetests = query({
  args: { originalTestId: v.id('voice_tests'), limit: v.optional(v.number()) },
  handler: async (ctx, { originalTestId, limit }) => {
    return await ctx.db
      .query('voice_tests')
      .withIndex('by_retestOfTestId', (q) => q.eq('retestOfTestId', originalTestId as any))
      .order('desc')
      .take(limit ?? 20);
  },
});

/** Get the latest retest for a voice test, if any. */
export const getLatestRetest = query({
  args: { originalTestId: v.id('voice_tests') },
  handler: async (ctx, { originalTestId }) => {
    const retests = await ctx.db
      .query('voice_tests')
      .withIndex('by_retestOfTestId', (q) => q.eq('retestOfTestId', originalTestId as any))
      .order('desc')
      .take(1);
    return retests[0] ?? null;
  },
});

/** Create a retest linked to an original voice test. */
export const createRetest = mutation({
  args: {
    originalTestId: v.id('voice_tests'),
    agentId: v.id('voice_agents'),
    testScriptId: v.optional(v.string()),
    scenario: v.string(),
    result: v.union(
      v.literal('pass'),
      v.literal('fail'),
      v.literal('partial'),
      v.literal('retest_needed'),
    ),
    failureType: v.optional(
      v.union(
        v.literal('no_answer'),
        v.literal('dead_air'),
        v.literal('misheard_caller'),
        v.literal('wrong_intent'),
        v.literal('bad_escalation'),
        v.literal('missed_required_field'),
        v.literal('overpromised'),
        v.literal('looped_response'),
        v.literal('bad_handoff'),
        v.literal('bad_close'),
        v.literal('latency_issue'),
        v.literal('tool_failure'),
      ),
    ),
    transcriptLink: v.optional(v.string()),
    recordingLink: v.optional(v.string()),
    notes: v.optional(v.string()),
    fixSliceId: v.optional(v.id('codex_slices')),
    testedBy: v.string(),
    testedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { originalTestId, ...restArgs } = args;
    const now = Date.now();
    const id = await ctx.db.insert('voice_tests', {
      ...restArgs,
      retestOfTestId: originalTestId,
      createdAt: now,
      updatedAt: now,
    });
    // Update agent lastTestedAt
    await ctx.db.patch(args.agentId, { lastTestedAt: Date.now(), updatedAt: Date.now() });
    return id;
  },
});
