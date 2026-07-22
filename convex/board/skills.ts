import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    category: v.optional(v.union(v.literal('repo_audit'), v.literal('voice_qa'), v.literal('receptionist_build'), v.literal('website_audit'), v.literal('client_workspace'), v.literal('crm_automation'), v.literal('codex_execution'), v.literal('sales_process'), v.literal('content'), v.literal('mail'))),
    status: v.optional(v.union(v.literal('proposed'), v.literal('draft'), v.literal('active'), v.literal('needs_update'), v.literal('archived'))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.category) return await ctx.db.query('skills').withIndex('by_category', (q) => q.eq('category', args.category!)).order('desc').take(limit);
    if (args.status) return await ctx.db.query('skills').withIndex('by_status', (q) => q.eq('status', args.status!)).order('desc').take(limit);
    return await ctx.db.query('skills').withIndex('by_skillId').order('desc').take(limit);
  },
});

export const get = query({ args: { id: v.id('skills') }, handler: async (ctx, { id }) => await ctx.db.get(id) });
export const getBySkillId = query({ args: { skillId: v.string() }, handler: async (ctx, { skillId }) => await ctx.db.query('skills').withIndex('by_skillId', (q) => q.eq('skillId', skillId)).first() });
export const stats = query({ args: {}, handler: async (ctx) => {
  const rows = await ctx.db.query('skills').take(1000); const byStatus: Record<string, number> = {}; let active = 0;
  for (const r of rows) { byStatus[r.status] = (byStatus[r.status] ?? 0) + 1; if (r.status === 'active') active += 1; }
  return { total: rows.length, active, byStatus };
} });

const category = v.union(v.literal('repo_audit'), v.literal('voice_qa'), v.literal('receptionist_build'), v.literal('website_audit'), v.literal('client_workspace'), v.literal('crm_automation'), v.literal('codex_execution'), v.literal('sales_process'), v.literal('content'), v.literal('mail'));
const status = v.union(v.literal('proposed'), v.literal('draft'), v.literal('active'), v.literal('needs_update'), v.literal('archived'));
export const create = mutation({ args: { name: v.string(), skillId: v.string(), category, filePath: v.optional(v.string()), githubPath: v.optional(v.string()), usedByProjectIds: v.optional(v.array(v.id('build_projects'))), notes: v.optional(v.string()), version: v.optional(v.string()) }, handler: async (ctx, args) => {
  const name = args.name.trim(); const skillId = args.skillId.trim(); if (!name) throw new Error('Skill name cannot be empty'); if (!skillId) throw new Error('skillId cannot be empty'); const now = Date.now();
  const id = await ctx.db.insert('skills', { name, skillId, category: args.category, status: 'draft', filePath: args.filePath?.trim() || undefined, githubPath: args.githubPath?.trim() || undefined, usedByProjectIds: args.usedByProjectIds || undefined, lastUsedAt: undefined, needsUpdate: undefined, version: args.version?.trim() || undefined, notes: args.notes?.trim() || undefined, createdAt: now, updatedAt: now }); return { id };
} });
export const update = mutation({ args: { id: v.id('skills'), name: v.optional(v.string()), skillId: v.optional(v.string()), category: v.optional(category), status: v.optional(status), filePath: v.optional(v.string()), githubPath: v.optional(v.string()), usedByProjectIds: v.optional(v.array(v.id('build_projects'))), lastUsedAt: v.optional(v.number()), needsUpdate: v.optional(v.boolean()), version: v.optional(v.string()), notes: v.optional(v.string()) }, handler: async (ctx, args) => {
  if (!await ctx.db.get(args.id)) throw new Error('Skill not found'); const patch: Record<string, unknown> = { updatedAt: Date.now() };
  if (args.name !== undefined) patch.name = args.name.trim(); if (args.skillId !== undefined) patch.skillId = args.skillId.trim(); if (args.category !== undefined) patch.category = args.category; if (args.status !== undefined) patch.status = args.status; if (args.filePath !== undefined) patch.filePath = args.filePath?.trim() || undefined; if (args.githubPath !== undefined) patch.githubPath = args.githubPath?.trim() || undefined; if (args.usedByProjectIds !== undefined) patch.usedByProjectIds = args.usedByProjectIds || undefined; if (args.lastUsedAt !== undefined) patch.lastUsedAt = args.lastUsedAt; if (args.needsUpdate !== undefined) patch.needsUpdate = args.needsUpdate || undefined; if (args.version !== undefined) patch.version = args.version?.trim() || undefined; if (args.notes !== undefined) patch.notes = args.notes?.trim() || undefined;
  await ctx.db.patch(args.id, patch); return { ok: true };
} });
