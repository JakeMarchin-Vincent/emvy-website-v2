import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

// ─── Constants ──────────────────────────────────────────────

export const SEVERITY_LEVELS = ['low', 'medium', 'high', 'critical'] as const;
export const WORKFLOW_AREAS = [
  'sales_process',
  'client_communication',
  'inbox_mail',
  'quoting_proposal',
  'calendar_booking',
  'bookkeeping_reporting',
  'customer_intake',
  'delivery_ops',
  'marketing_content',
  'voice_operations',
  'other',
] as const;
export const SOURCE_TYPES = [
  'sage_audit',
  'chatbot_audit',
  'discovery_call',
  'client_feedback',
  'manual',
  'voice_qa',
  'codex_finding',
] as const;
export const RECOMMENDATION_STATUSES = [
  'captured',
  'needs_review',
  'recommended',
  'ready_for_intake',
  'ready_for_codex',
  'in_build',
  'testing',
  'live',
  'rejected',
  'archived',
] as const;
export const PRIORITY_LEVELS = ['critical', 'high', 'medium', 'low'] as const;

export const SEVERITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const WORKFLOW_AREA_LABELS: Record<string, string> = {
  sales_process: 'Sales process',
  client_communication: 'Client communication',
  inbox_mail: 'Inbox / Mail',
  quoting_proposal: 'Quoting / Proposal',
  calendar_booking: 'Calendar / Booking',
  bookkeeping_reporting: 'Bookkeeping / Reporting',
  customer_intake: 'Customer intake',
  delivery_ops: 'Delivery operations',
  marketing_content: 'Marketing / Content',
  voice_operations: 'Voice operations',
  other: 'Other',
};

export const SOURCE_LABELS: Record<string, string> = {
  sage_audit: 'Sage audit',
  chatbot_audit: 'Chatbot audit',
  discovery_call: 'Discovery call',
  client_feedback: 'Client feedback',
  manual: 'Manual',
  voice_qa: 'Voice QA',
  codex_finding: 'Codex finding',
};

export const STATUS_LABELS: Record<string, string> = {
  captured: 'Captured',
  needs_review: 'Needs review',
  recommended: 'Recommended',
  ready_for_intake: 'Ready for intake',
  ready_for_codex: 'Ready for Codex',
  in_build: 'In build',
  testing: 'Testing',
  live: 'Live',
  rejected: 'Rejected',
  archived: 'Archived',
};

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const STATUS_ORDER = [
  'captured',
  'needs_review',
  'recommended',
  'ready_for_intake',
  'ready_for_codex',
  'in_build',
  'testing',
  'live',
  'rejected',
  'archived',
] as const;

// ─── Color helpers ──────────────────────────────────────────

export function severityColor(severity: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    low: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)' },
    medium: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    high: { fg: '#fb923c', bg: 'rgba(251,146,60,0.10)', border: 'rgba(251,146,60,0.35)' },
    critical: { fg: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
  };
  return colors[severity] ?? colors.medium;
}

export function statusColor(status: string): { fg: string; bg: string; border: string } {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    captured: { fg: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)' },
    needs_review: { fg: '#fbbf24', bg: 'rgba(251,191,36,0.10)', border: 'rgba(251,191,36,0.35)' },
    recommended: { fg: '#56d9ff', bg: 'rgba(86,217,255,0.10)', border: 'rgba(86,217,255,0.35)' },
    ready_for_intake: { fg: '#2be3a3', bg: 'rgba(43,227,163,0.10)', border: 'rgba(43,227,163,0.35)' },
    ready_for_codex: { fg: '#7c8cff', bg: 'rgba(124,140,255,0.10)', border: 'rgba(124,140,255,0.35)' },
    in_build: { fg: '#818cf8', bg: 'rgba(129,140,248,0.10)', border: 'rgba(129,140,248,0.35)' },
    testing: { fg: '#34d399', bg: 'rgba(52,211,153,0.10)', border: 'rgba(52,211,153,0.35)' },
    live: { fg: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.35)' },
    rejected: { fg: '#f87171', bg: 'rgba(248,113,113,0.10)', border: 'rgba(248,113,113,0.35)' },
    archived: { fg: '#64748b', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.30)' },
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
    { fg: '#c084fc', bg: 'rgba(192,132,252,0.08)', border: 'rgba(192,132,252,0.20)' },
  ];
  const idx = WORKFLOW_AREAS.indexOf(area as (typeof WORKFLOW_AREAS)[number]);
  return palette[idx >= 0 ? idx % palette.length : 0];
}

// ─── Queries ────────────────────────────────────────────────

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('captured'),
        v.literal('needs_review'),
        v.literal('recommended'),
        v.literal('ready_for_intake'),
        v.literal('ready_for_codex'),
        v.literal('in_build'),
        v.literal('testing'),
        v.literal('live'),
        v.literal('rejected'),
        v.literal('archived'),
      ),
    ),
    severity: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
    ),
    workflowArea: v.optional(
      v.union(
        v.literal('sales_process'),
        v.literal('client_communication'),
        v.literal('inbox_mail'),
        v.literal('quoting_proposal'),
        v.literal('calendar_booking'),
        v.literal('bookkeeping_reporting'),
        v.literal('customer_intake'),
        v.literal('delivery_ops'),
        v.literal('marketing_content'),
        v.literal('voice_operations'),
        v.literal('other'),
      ),
    ),
    source: v.optional(
      v.union(
        v.literal('sage_audit'),
        v.literal('chatbot_audit'),
        v.literal('discovery_call'),
        v.literal('client_feedback'),
        v.literal('manual'),
        v.literal('voice_qa'),
        v.literal('codex_finding'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    if (args.status) {
      return await ctx.db
        .query('auditBuildRecommendations')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    if (args.severity) {
      return await ctx.db
        .query('auditBuildRecommendations')
        .withIndex('by_severity', (q) => q.eq('severity', args.severity!))
        .order('desc')
        .take(limit);
    }
    if (args.workflowArea) {
      return await ctx.db
        .query('auditBuildRecommendations')
        .withIndex('by_workflowArea', (q) => q.eq('workflowArea', args.workflowArea!))
        .order('desc')
        .take(limit);
    }
    if (args.source) {
      return await ctx.db
        .query('auditBuildRecommendations')
        .withIndex('by_source', (q) => q.eq('source', args.source!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('auditBuildRecommendations')
      .withIndex('by_createdAt')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('auditBuildRecommendations') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('auditBuildRecommendations').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};
    const byWorkflowArea: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let needsReviewCount = 0;
    let readyForIntakeCount = 0;
    let readyForCodexCount = 0;
    let rejectedCount = 0;

    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      bySeverity[r.severity] = (bySeverity[r.severity] ?? 0) + 1;
      byWorkflowArea[r.workflowArea] = (byWorkflowArea[r.workflowArea] ?? 0) + 1;
      bySource[r.source] = (bySource[r.source] ?? 0) + 1;
      byPriority[r.priority] = (byPriority[r.priority] ?? 0) + 1;
      if (r.status === 'needs_review') needsReviewCount += 1;
      if (r.status === 'ready_for_intake') readyForIntakeCount += 1;
      if (r.status === 'ready_for_codex') readyForCodexCount += 1;
      if (r.status === 'rejected') rejectedCount += 1;
    }

    return {
      total,
      needsReviewCount,
      readyForIntakeCount,
      readyForCodexCount,
      rejectedCount,
      byStatus,
      bySeverity,
      byWorkflowArea,
      bySource,
      byPriority,
    };
  },
});

// ─── Mutations ──────────────────────────────────────────────

export const create = mutation({
  args: {
    title: v.string(),
    finding: v.string(),
    severity: v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('critical'),
    ),
    workflowArea: v.union(
      v.literal('sales_process'),
      v.literal('client_communication'),
      v.literal('inbox_mail'),
      v.literal('quoting_proposal'),
      v.literal('calendar_booking'),
      v.literal('bookkeeping_reporting'),
      v.literal('customer_intake'),
      v.literal('delivery_ops'),
      v.literal('marketing_content'),
      v.literal('voice_operations'),
      v.literal('other'),
    ),
    source: v.union(
      v.literal('sage_audit'),
      v.literal('chatbot_audit'),
      v.literal('discovery_call'),
      v.literal('client_feedback'),
      v.literal('manual'),
      v.literal('voice_qa'),
      v.literal('codex_finding'),
    ),
    recommendedBuild: v.optional(v.string()),
    priority: v.union(
      v.literal('critical'),
      v.literal('high'),
      v.literal('medium'),
      v.literal('low'),
    ),
    status: v.union(
      v.literal('captured'),
      v.literal('needs_review'),
      v.literal('recommended'),
      v.literal('ready_for_intake'),
      v.literal('ready_for_codex'),
      v.literal('in_build'),
      v.literal('testing'),
      v.literal('live'),
      v.literal('rejected'),
      v.literal('archived'),
    ),
    nextAction: v.optional(v.string()),
    linkedAuditRegisterId: v.optional(v.id('audit_register')),
    linkedChatbotLeadId: v.optional(v.id('audit_chatbot_leads')),
    linkedClientId: v.optional(v.id('clients')),
    linkedWorkspaceId: v.optional(v.id('workspaces')),
    linkedProductId: v.optional(v.id('products')),
    linkedAutomationIntakeId: v.optional(v.id('automationWorkflowIntake')),
    linkedImprovementId: v.optional(v.id('improvements')),
    linkedCodexSliceId: v.optional(v.id('codex_slices')),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert('auditBuildRecommendations', {
      ...args,
      recommendedBuild: args.recommendedBuild?.trim() || undefined,
      nextAction: args.nextAction?.trim() || undefined,
      linkedAuditRegisterId: args.linkedAuditRegisterId || undefined,
      linkedChatbotLeadId: args.linkedChatbotLeadId || undefined,
      linkedClientId: args.linkedClientId || undefined,
      linkedWorkspaceId: args.linkedWorkspaceId || undefined,
      linkedProductId: args.linkedProductId || undefined,
      linkedAutomationIntakeId: args.linkedAutomationIntakeId || undefined,
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
    id: v.id('auditBuildRecommendations'),
    title: v.optional(v.string()),
    finding: v.optional(v.string()),
    severity: v.optional(
      v.union(v.literal('low'), v.literal('medium'), v.literal('high'), v.literal('critical')),
    ),
    workflowArea: v.optional(
      v.union(
        v.literal('sales_process'),
        v.literal('client_communication'),
        v.literal('inbox_mail'),
        v.literal('quoting_proposal'),
        v.literal('calendar_booking'),
        v.literal('bookkeeping_reporting'),
        v.literal('customer_intake'),
        v.literal('delivery_ops'),
        v.literal('marketing_content'),
        v.literal('voice_operations'),
        v.literal('other'),
      ),
    ),
    source: v.optional(
      v.union(
        v.literal('sage_audit'),
        v.literal('chatbot_audit'),
        v.literal('discovery_call'),
        v.literal('client_feedback'),
        v.literal('manual'),
        v.literal('voice_qa'),
        v.literal('codex_finding'),
      ),
    ),
    recommendedBuild: v.optional(v.string()),
    priority: v.optional(
      v.union(v.literal('critical'), v.literal('high'), v.literal('medium'), v.literal('low')),
    ),
    status: v.optional(
      v.union(
        v.literal('captured'),
        v.literal('needs_review'),
        v.literal('recommended'),
        v.literal('ready_for_intake'),
        v.literal('ready_for_codex'),
        v.literal('in_build'),
        v.literal('testing'),
        v.literal('live'),
        v.literal('rejected'),
        v.literal('archived'),
      ),
    ),
    nextAction: v.optional(v.string()),
    linkedAuditRegisterId: v.optional(v.id('audit_register')),
    linkedChatbotLeadId: v.optional(v.id('audit_chatbot_leads')),
    linkedClientId: v.optional(v.id('clients')),
    linkedWorkspaceId: v.optional(v.id('workspaces')),
    linkedProductId: v.optional(v.id('products')),
    linkedAutomationIntakeId: v.optional(v.id('automationWorkflowIntake')),
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
