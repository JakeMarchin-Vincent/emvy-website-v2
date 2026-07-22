import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    type: v.optional(
      v.union(
        v.literal('client'),
        v.literal('prospect'),
        v.literal('internal'),
        v.literal('product'),
        v.literal('research'),
        v.literal('archive'),
      ),
    ),
    relatedClientId: v.optional(v.id('clients')),
    relatedProjectId: v.optional(v.id('build_projects')),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.relatedClientId) {
      return await ctx.db
        .query('workspaces')
        .withIndex('by_relatedClientId', (q) => q.eq('relatedClientId', args.relatedClientId!))
        .order('desc')
        .take(limit);
    }
    if (args.relatedProjectId) {
      return await ctx.db
        .query('workspaces')
        .withIndex('by_relatedProjectId', (q) => q.eq('relatedProjectId', args.relatedProjectId!))
        .order('desc')
        .take(limit);
    }
    if (args.type) {
      return await ctx.db
        .query('workspaces')
        .withIndex('by_type', (q) => q.eq('type', args.type!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('workspaces')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('workspaces') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('workspaces').take(1000);
    const total = rows.length;
    const byType: Record<string, number> = {};
    for (const r of rows) {
      byType[r.type] = (byType[r.type] ?? 0) + 1;
    }
    return { total, byType };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal('client'),
      v.literal('prospect'),
      v.literal('internal'),
      v.literal('product'),
      v.literal('research'),
      v.literal('archive'),
    ),
    localPath: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    sourceOfTruth: v.union(
      v.literal('board'),
      v.literal('github'),
      v.literal('vault'),
      v.literal('local'),
      v.literal('external_provider'),
    ),
    relatedClientId: v.optional(v.id('clients')),
    relatedLeadId: v.optional(v.id('leads')),
    relatedProjectId: v.optional(v.id('build_projects')),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error('Workspace name cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('workspaces', {
      name,
      type: args.type,
      localPath: args.localPath?.trim() || undefined,
      githubRepoUrl: args.githubRepoUrl?.trim() || undefined,
      sourceOfTruth: args.sourceOfTruth,
      relatedClientId: args.relatedClientId || undefined,
      relatedLeadId: args.relatedLeadId || undefined,
      relatedProjectId: args.relatedProjectId || undefined,
      status: args.status?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('workspaces'),
    name: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal('client'),
        v.literal('prospect'),
        v.literal('internal'),
        v.literal('product'),
        v.literal('research'),
        v.literal('archive'),
      ),
    ),
    localPath: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    sourceOfTruth: v.optional(
      v.union(
        v.literal('board'),
        v.literal('github'),
        v.literal('vault'),
        v.literal('local'),
        v.literal('external_provider'),
      ),
    ),
    relatedClientId: v.optional(v.id('clients')),
    relatedLeadId: v.optional(v.id('leads')),
    relatedProjectId: v.optional(v.id('build_projects')),
    status: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error('Workspace not found');
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.type !== undefined) patch.type = args.type;
    if (args.localPath !== undefined) patch.localPath = args.localPath?.trim() || undefined;
    if (args.githubRepoUrl !== undefined) patch.githubRepoUrl = args.githubRepoUrl?.trim() || undefined;
    if (args.sourceOfTruth !== undefined) patch.sourceOfTruth = args.sourceOfTruth;
    if (args.relatedClientId !== undefined) patch.relatedClientId = args.relatedClientId || undefined;
    if (args.relatedLeadId !== undefined) patch.relatedLeadId = args.relatedLeadId || undefined;
    if (args.relatedProjectId !== undefined) patch.relatedProjectId = args.relatedProjectId || undefined;
    if (args.status !== undefined) patch.status = args.status?.trim() || undefined;
    if (args.notes !== undefined) patch.notes = args.notes?.trim() || undefined;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});
