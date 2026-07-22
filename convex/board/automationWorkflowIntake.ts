import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ─── Status helpers ─────────────────────────────────────────

export const WORKFLOW_AREAS = [
  'inbox_triage',
  'email_automation',
  'calendar_automation',
  'proposal_automation',
  'audit_report_generation',
  'crm_updates',
  'follow_ups',
  'document_generation',
  'reporting_packs',
  'admin_workflow_routing',
] as const;

export const SOURCE_TYPES = [
  'internal',
  'client_request',
  'client_observation',
  'voice_qa',
  'improvement',
  'codex_finding',
  'manual',
] as const;

export const INTAKE_STATUSES = [
  'captured',
  'needs_scoping',
  'ready_for_improvement',
  'ready_for_codex',
  'in_build',
  'testing',
  'live',
  'maintenance',
  'blocked',
] as const;

export const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const WORKFLOW_AREA_LABELS: Record<string, string> = {
  inbox_triage: 'Inbox triage',
  email_automation: 'Email automation',
  calendar_automation: 'Calendar automation',
  proposal_automation: 'Proposal automation',
  audit_report_generation: 'Audit report generation',
  crm_updates: 'CRM updates',
  follow_ups: 'Follow-ups',
  document_generation: 'Document generation',
  reporting_packs: 'Reporting packs',
  admin_workflow_routing: 'Admin workflow routing',
};

export const SOURCE_LABELS: Record<string, string> = {
  internal: 'Internal',
  client_request: 'Client request',
  client_observation: 'Client observation',
  voice_qa: 'Voice QA',
  improvement: 'Improvement',
  codex_finding: 'Codex finding',
  manual: 'Manual',
};

export const INTAKE_STATUS_LABELS: Record<string, string> = {
  captured: 'Captured',
  needs_scoping: 'Needs scoping',
  ready_for_improvement: 'Ready for improvement',
  ready_for_codex: 'Ready for Codex',
  in_build: 'In build',
  testing: 'Testing',
  live: 'Live',
  maintenance: 'Maintenance',
  blocked: 'Blocked',
};

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const INTAKE_STATUS_ORDER = [
  'captured',
  'needs_scoping',
  'ready_for_improvement',
  'ready_for_codex',
  'in_build',
  'testing',
  'live',
  'maintenance',
  'blocked',
] as const;

export function statusColor(status: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    captured: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)' },
    needs_scoping: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    ready_for_improvement: { fg: '#56d9ff', bg: 'rgba(86,217,255,0.10)', border: 'rgba(86,217,255,0.35)' },
    ready_for_codex: { fg: '#7c8cff', bg: 'rgba(124,140,255,0.10)', border: 'rgba(124,140,255,0.35)' },
    in_build: { fg: '#818cf8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.35)' },
    testing: { fg: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.35)' },
    live: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    maintenance: { fg: '#2be3a3', bg: 'rgba(43,227,163,0.10)', border: 'rgba(43,227,163,0.35)' },
    blocked: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  };
  return colors[status] ?? colors.captured;
}

export function priorityColor(priority: string | undefined): { fg: string; bg: string } {
  const colors: Record<string, { fg: string; bg: string }> = {
    critical: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)' },
    high: { fg: '#fb923c', bg: 'rgba(251,146,60,0.10)' },
    medium: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.08)' },
    low: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.06)' },
  };
  return colors[priority ?? ''] ?? colors.medium;
}

export function workflowAreaColor(area: string): { fg: string; bg: string; border: string } {
  const palette = [
    { fg: '#56d9ff', bg: 'rgba(86,217,255,0.08)', border: 'rgba(86,217,255,0.20)' },
    { fg: '#7c8cff', bg: 'rgba(124,140,255,0.08)', border: 'rgba(124,140,255,0.20)' },
    { fg: '#2be3a3', bg: 'rgba(43,227,163,0.08)', border: 'rgba(43,227,163,0.20)' },
    { fg: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.20)' },
    { fg: '#fb923c', bg: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.20)' },
    { fg: '#f472b6', bg: 'rgba(244,114,182,0.08)', border: 'rgba(244,114,182,0.20)' },
    { fg: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.20)' },
    { fg: '#34d399', bg: 'rgba(52,211,153,0.08)', border: 'rgba(52,211,153,0.20)' },
    { fg: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.20)' },
    { fg: '#e2e8f0', bg: 'rgba(226,232,240,0.08)', border: 'rgba(226,232,240,0.20)' },
  ];
  const idx = WORKFLOW_AREAS.indexOf(area as (typeof WORKFLOW_AREAS)[number]);
  return palette[idx >= 0 ? idx % palette.length : 0];
}

// ─── Queries ─────────────────────────────────────────────────

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('captured'),
        v.literal('needs_scoping'),
        v.literal('ready_for_improvement'),
        v.literal('ready_for_codex'),
        v.literal('in_build'),
        v.literal('testing'),
        v.literal('live'),
        v.literal('maintenance'),
        v.literal('blocked'),
      ),
    ),
    workflowArea: v.optional(
      v.union(
        v.literal('inbox_triage'),
        v.literal('email_automation'),
        v.literal('calendar_automation'),
        v.literal('proposal_automation'),
        v.literal('audit_report_generation'),
        v.literal('crm_updates'),
        v.literal('follow_ups'),
        v.literal('document_generation'),
        v.literal('reporting_packs'),
        v.literal('admin_workflow_routing'),
      ),
    ),
    source: v.optional(
      v.union(
        v.literal('internal'),
        v.literal('client_request'),
        v.literal('client_observation'),
        v.literal('voice_qa'),
        v.literal('improvement'),
        v.literal('codex_finding'),
        v.literal('manual'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    let base;

    if (args.status) {
      base = await ctx.db
        .query('automationWorkflowIntake')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    } else if (args.workflowArea) {
      base = await ctx.db
        .query('automationWorkflowIntake')
        .withIndex('by_workflowArea', (q) => q.eq('workflowArea', args.workflowArea!))
        .order('desc')
        .take(limit);
    } else if (args.source) {
      base = await ctx.db
        .query('automationWorkflowIntake')
        .withIndex('by_source', (q) => q.eq('source', args.source!))
        .order('desc')
        .take(limit);
    } else {
      base = await ctx.db
        .query('automationWorkflowIntake')
        .withIndex('by_createdAt')
        .order('desc')
        .take(limit);
    }

    return base;
  },
});

export const get = query({
  args: { id: v.id('automationWorkflowIntake') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('automationWorkflowIntake').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    const byWorkflowArea: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let clientFacingCount = 0;
    let readyForCodexCount = 0;
    let blockedCount = 0;

    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      byWorkflowArea[r.workflowArea] = (byWorkflowArea[r.workflowArea] ?? 0) + 1;
      bySource[r.source] = (bySource[r.source] ?? 0) + 1;
      byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1;
      if (r.isClientFacing) clientFacingCount += 1;
      if (r.status === 'ready_for_codex') readyForCodexCount += 1;
      if (r.status === 'blocked') blockedCount += 1;
    }

    return {
      total,
      clientFacingCount,
      readyForCodexCount,
      blockedCount,
      byStatus,
      byWorkflowArea,
      bySource,
      byPriority,
    };
  },
});

// ─── Mutations ───────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    issue: v.string(),
    workflowArea: v.union(
      v.literal('inbox_triage'),
      v.literal('email_automation'),
      v.literal('calendar_automation'),
      v.literal('proposal_automation'),
      v.literal('audit_report_generation'),
      v.literal('crm_updates'),
      v.literal('follow_ups'),
      v.literal('document_generation'),
      v.literal('reporting_packs'),
      v.literal('admin_workflow_routing'),
    ),
    source: v.union(
      v.literal('internal'),
      v.literal('client_request'),
      v.literal('client_observation'),
      v.literal('voice_qa'),
      v.literal('improvement'),
      v.literal('codex_finding'),
      v.literal('manual'),
    ),
    isClientFacing: v.boolean(),
    priority: v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low'),
    ),
    status: v.union(
      v.literal('captured'),
      v.literal('needs_scoping'),
      v.literal('ready_for_improvement'),
      v.literal('ready_for_codex'),
      v.literal('in_build'),
      v.literal('testing'),
      v.literal('live'),
      v.literal('maintenance'),
      v.literal('blocked'),
    ),
    recommendedBuild: v.optional(v.string()),
    nextAction: v.optional(v.string()),
    linkedClientId: v.optional(v.id('clients')),
    linkedWorkspaceId: v.optional(v.id('workspaces')),
    linkedProductId: v.optional(v.id('products')),
    linkedImprovementId: v.optional(v.id('improvements')),
    linkedCodexSliceId: v.optional(v.id('codex_slices')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('automationWorkflowIntake', {
      ...args,
      recommendedBuild: args.recommendedBuild?.trim() || undefined,
      nextAction: args.nextAction?.trim() || undefined,
      linkedClientId: args.linkedClientId || undefined,
      linkedWorkspaceId: args.linkedWorkspaceId || undefined,
      linkedProductId: args.linkedProductId || undefined,
      linkedImprovementId: args.linkedImprovementId || undefined,
      linkedCodexSliceId: args.linkedCodexSliceId || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('automationWorkflowIntake'),
    title: v.optional(v.string()),
    issue: v.optional(v.string()),
    workflowArea: v.optional(
      v.union(
        v.literal('inbox_triage'),
        v.literal('email_automation'),
        v.literal('calendar_automation'),
        v.literal('proposal_automation'),
        v.literal('audit_report_generation'),
        v.literal('crm_updates'),
        v.literal('follow_ups'),
        v.literal('document_generation'),
        v.literal('reporting_packs'),
        v.literal('admin_workflow_routing'),
      ),
    ),
    source: v.optional(
      v.union(
        v.literal('internal'),
        v.literal('client_request'),
        v.literal('client_observation'),
        v.literal('voice_qa'),
        v.literal('improvement'),
        v.literal('codex_finding'),
        v.literal('manual'),
      ),
    ),
    isClientFacing: v.optional(v.boolean()),
    priority: v.optional(
      v.union(
        v.literal('critical'),
        v.literal('high'),
        v.literal('medium'),
        v.literal('low'),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal('captured'),
        v.literal('needs_scoping'),
        v.literal('ready_for_improvement'),
        v.literal('ready_for_codex'),
        v.literal('in_build'),
        v.literal('testing'),
        v.literal('live'),
        v.literal('maintenance'),
        v.literal('blocked'),
      ),
    ),
    recommendedBuild: v.optional(v.string()),
    nextAction: v.optional(v.string()),
    linkedClientId: v.optional(v.id('clients')),
    linkedWorkspaceId: v.optional(v.id('workspaces')),
    linkedProductId: v.optional(v.id('products')),
    linkedImprovementId: v.optional(v.id('improvements')),
    linkedCodexSliceId: v.optional(v.id('codex_slices')),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        patch[key] = value;
      }
    }
    await ctx.db.patch(id, patch);
    return { ok: true };
  },
});
