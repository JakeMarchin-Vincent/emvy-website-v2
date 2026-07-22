import { query } from '../_generated/server';
import { v } from 'convex/values';

type SourceDoc = Record<string, unknown>;
const ready = async (ctx: any, table: string, index: string, status: string, limit: number) => ctx.db.query(table).withIndex(index, (q: any) => q.eq('status', status)).order('desc').take(limit);

export const listReadyItems = query({
  args: { sourceType: v.optional(v.union(v.literal('audit_recommendation'), v.literal('automation_intake'), v.literal('improvement'), v.literal('build_request'), v.literal('build_idea'))), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const n = args.limit ?? 100;
    const [a, w, i, r, b] = await Promise.all([ready(ctx, 'auditBuildRecommendations', 'by_status', 'ready_for_codex', n), ready(ctx, 'automationWorkflowIntake', 'by_status', 'ready_for_codex', n), ready(ctx, 'improvements', 'by_status', 'approved', n), ready(ctx, 'build_requests', 'by_status_and_createdAt', 'approved', n), ready(ctx, 'build_ideas', 'by_status_and_createdAt', 'idea', n)]) as SourceDoc[][];
    const item = (row: SourceDoc, sourceType: string, table: string, title: string, desc: string, fallback: string, extra: SourceDoc = {}) => ({ id: String(row._id), sourceType, sourceTable: table, title: String(row[title] ?? ''), description: String(row[desc] ?? ''), priority: String(row.priority ?? fallback), status: String(row.status ?? fallback), createdAt: Number(row.createdAt ?? 0), ...extra });
    const items = [...a.map(x => item(x, 'audit_recommendation', 'auditBuildRecommendations', 'title', 'finding', 'ready_for_codex', { linkedClientId: x.linkedClientId, linkedWorkspaceId: x.linkedWorkspaceId, linkedProductId: x.linkedProductId, recommendedBuild: x.recommendedBuild, nextAction: x.nextAction })), ...w.map(x => item(x, 'automation_intake', 'automationWorkflowIntake', 'title', 'issue', 'ready_for_codex', { linkedClientId: x.linkedClientId, linkedWorkspaceId: x.linkedWorkspaceId, linkedProductId: x.linkedProductId, recommendedBuild: x.recommendedBuild, nextAction: x.nextAction })), ...i.map(x => item(x, 'improvement', 'improvements', 'title', 'evidence', 'approved', { linkedClientId: x.relatedClientId })), ...r.map(x => item(x, 'build_request', 'build_requests', 'requestText', 'proposal', 'approved', { recommendedBuild: x.project, nextAction: x.nextAction })), ...b.map(x => item(x, 'build_idea', 'build_ideas', 'title', 'summary', 'idea'))];
    items.sort((x, y) => y.createdAt - x.createdAt);
    return args.sourceType ? items.filter(x => x.sourceType === args.sourceType) : items;
  },
});

export const sourceTypeStats = query({
  args: {},
  handler: async (ctx) => { const [a, w, i, r, b] = await Promise.all([ready(ctx, 'auditBuildRecommendations', 'by_status', 'ready_for_codex', 1000), ready(ctx, 'automationWorkflowIntake', 'by_status', 'ready_for_codex', 1000), ready(ctx, 'improvements', 'by_status', 'approved', 1000), ready(ctx, 'build_requests', 'by_status_and_createdAt', 'approved', 1000), ready(ctx, 'build_ideas', 'by_status_and_createdAt', 'idea', 1000)]); return { auditRecommendations: a.length, automationIntake: w.length, improvements: i.length, buildRequests: r.length, buildIdeas: b.length, total: a.length + w.length + i.length + r.length + b.length }; },
});
