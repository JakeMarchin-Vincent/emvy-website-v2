import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    status: v.optional(
      v.union(
        v.literal('prospect'),
        v.literal('discovery'),
        v.literal('audit'),
        v.literal('build'),
        v.literal('maintenance'),
        v.literal('paused'),
        v.literal('complete'),
        v.literal('lost'),
      ),
    ),
    deliveryHealth: v.optional(
      v.union(
        v.literal('green'),
        v.literal('yellow'),
        v.literal('red'),
        v.literal('unknown'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.status) {
      return await ctx.db
        .query('clients')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    if (args.deliveryHealth) {
      return await ctx.db
        .query('clients')
        .withIndex('by_deliveryHealth', (q) => q.eq('deliveryHealth', args.deliveryHealth!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('clients')
      .withIndex('by_name')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('clients') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('clients').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    let activeCount = 0;
    let redHealth = 0;
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      if (r.status === 'build' || r.status === 'maintenance') activeCount += 1;
      if (r.deliveryHealth === 'red') redHealth += 1;
    }
    return { total, activeCount, redHealth, byStatus };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    status: v.optional(
      v.union(
        v.literal('prospect'),
        v.literal('discovery'),
        v.literal('audit'),
        v.literal('build'),
        v.literal('maintenance'),
        v.literal('paused'),
        v.literal('complete'),
        v.literal('lost'),
      ),
    ),
    leadId: v.optional(v.id('leads')),
    primaryContactName: v.optional(v.string()),
    primaryContactEmail: v.optional(v.string()),
    primaryContactPhone: v.optional(v.string()),
    workspacePath: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    activeOfferId: v.optional(v.string()),
    currentProjectId: v.optional(v.id('build_projects')),
    nextDelivery: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error('Client name cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('clients', {
      name,
      status: args.status ?? 'prospect',
      leadId: args.leadId || undefined,
      primaryContactName: args.primaryContactName?.trim() || undefined,
      primaryContactEmail: args.primaryContactEmail?.trim() || undefined,
      primaryContactPhone: args.primaryContactPhone?.trim() || undefined,
      workspacePath: args.workspacePath?.trim() || undefined,
      githubRepoUrl: args.githubRepoUrl?.trim() || undefined,
      activeOfferId: args.activeOfferId?.trim() || undefined,
      currentProjectId: args.currentProjectId || undefined,
      nextDelivery: args.nextDelivery || undefined,
      deliveryHealth: 'unknown',
      notes: args.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('clients'),
    name: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('prospect'),
        v.literal('discovery'),
        v.literal('audit'),
        v.literal('build'),
        v.literal('maintenance'),
        v.literal('paused'),
        v.literal('complete'),
        v.literal('lost'),
      ),
    ),
    leadId: v.optional(v.id('leads')),
    primaryContactName: v.optional(v.string()),
    primaryContactEmail: v.optional(v.string()),
    primaryContactPhone: v.optional(v.string()),
    workspacePath: v.optional(v.string()),
    githubRepoUrl: v.optional(v.string()),
    activeOfferId: v.optional(v.string()),
    currentProjectId: v.optional(v.id('build_projects')),
    nextDelivery: v.optional(v.number()),
    deliveryHealth: v.optional(
      v.union(
        v.literal('green'),
        v.literal('yellow'),
        v.literal('red'),
        v.literal('unknown'),
      ),
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error('Client not found');
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.status !== undefined) patch.status = args.status;
    if (args.leadId !== undefined) patch.leadId = args.leadId || undefined;
    if (args.primaryContactName !== undefined) patch.primaryContactName = args.primaryContactName?.trim() || undefined;
    if (args.primaryContactEmail !== undefined) patch.primaryContactEmail = args.primaryContactEmail?.trim() || undefined;
    if (args.primaryContactPhone !== undefined) patch.primaryContactPhone = args.primaryContactPhone?.trim() || undefined;
    if (args.workspacePath !== undefined) patch.workspacePath = args.workspacePath?.trim() || undefined;
    if (args.githubRepoUrl !== undefined) patch.githubRepoUrl = args.githubRepoUrl?.trim() || undefined;
    if (args.activeOfferId !== undefined) patch.activeOfferId = args.activeOfferId?.trim() || undefined;
    if (args.currentProjectId !== undefined) patch.currentProjectId = args.currentProjectId || undefined;
    if (args.nextDelivery !== undefined) patch.nextDelivery = args.nextDelivery || undefined;
    if (args.deliveryHealth !== undefined) patch.deliveryHealth = args.deliveryHealth;
    if (args.notes !== undefined) patch.notes = args.notes?.trim() || undefined;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});
