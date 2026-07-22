import { mutation, query } from '../_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal('voice_agent'),
        v.literal('audit'),
        v.literal('automation'),
        v.literal('maintenance'),
        v.literal('custom_aios'),
      ),
    ),
    status: v.optional(
      v.union(
        v.literal('idea'),
        v.literal('packaging'),
        v.literal('demo_ready'),
        v.literal('sellable'),
        v.literal('live'),
        v.literal('paused'),
        v.literal('archived'),
      ),
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    if (args.status) {
      return await ctx.db
        .query('products')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .take(limit);
    }
    if (args.category) {
      return await ctx.db
        .query('products')
        .withIndex('by_category', (q) => q.eq('category', args.category!))
        .order('desc')
        .take(limit);
    }
    return await ctx.db
      .query('products')
      .withIndex('by_name')
      .order('desc')
      .take(limit);
  },
});

export const get = query({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('products').take(1000);
    const total = rows.length;
    const byStatus: Record<string, number> = {};
    let sellableLive = 0;
    for (const r of rows) {
      byStatus[r.status] = (byStatus[r.status] ?? 0) + 1;
      if (r.status === 'sellable' || r.status === 'live') sellableLive += 1;
    }
    return { total, sellableLive, byStatus };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    category: v.union(
      v.literal('voice_agent'),
      v.literal('audit'),
      v.literal('automation'),
      v.literal('maintenance'),
      v.literal('custom_aios'),
    ),
    targetSector: v.optional(v.string()),
    priceModel: v.optional(v.string()),
    setupPrice: v.optional(v.number()),
    monthlyPrice: v.optional(v.number()),
    demoAvailable: v.optional(v.boolean()),
    relatedProjectIds: v.optional(v.array(v.id('build_projects'))),
    salesAssets: v.optional(v.array(v.string())),
    deliveryChecklist: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const name = args.name.trim();
    if (!name) throw new Error('Product name cannot be empty');
    const now = Date.now();
    const id = await ctx.db.insert('products', {
      name,
      category: args.category,
      targetSector: args.targetSector?.trim() || undefined,
      status: 'idea',
      priceModel: args.priceModel?.trim() || undefined,
      setupPrice: args.setupPrice ?? undefined,
      monthlyPrice: args.monthlyPrice ?? undefined,
      demoAvailable: args.demoAvailable ?? undefined,
      relatedProjectIds: args.relatedProjectIds || undefined,
      salesAssets: args.salesAssets || undefined,
      deliveryChecklist: args.deliveryChecklist || undefined,
      notes: args.notes?.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const update = mutation({
  args: {
    id: v.id('products'),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal('voice_agent'),
        v.literal('audit'),
        v.literal('automation'),
        v.literal('maintenance'),
        v.literal('custom_aios'),
      ),
    ),
    targetSector: v.optional(v.string()),
    status: v.optional(
      v.union(
        v.literal('idea'),
        v.literal('packaging'),
        v.literal('demo_ready'),
        v.literal('sellable'),
        v.literal('live'),
        v.literal('paused'),
        v.literal('archived'),
      ),
    ),
    priceModel: v.optional(v.string()),
    setupPrice: v.optional(v.number()),
    monthlyPrice: v.optional(v.number()),
    demoAvailable: v.optional(v.boolean()),
    relatedProjectIds: v.optional(v.array(v.id('build_projects'))),
    salesAssets: v.optional(v.array(v.string())),
    deliveryChecklist: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.id);
    if (!row) throw new Error('Product not found');
    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) patch.name = args.name.trim();
    if (args.category !== undefined) patch.category = args.category;
    if (args.targetSector !== undefined) patch.targetSector = args.targetSector?.trim() || undefined;
    if (args.status !== undefined) patch.status = args.status;
    if (args.priceModel !== undefined) patch.priceModel = args.priceModel?.trim() || undefined;
    if (args.setupPrice !== undefined) patch.setupPrice = args.setupPrice ?? null;
    if (args.monthlyPrice !== undefined) patch.monthlyPrice = args.monthlyPrice ?? null;
    if (args.demoAvailable !== undefined) patch.demoAvailable = args.demoAvailable ?? undefined;
    if (args.relatedProjectIds !== undefined) patch.relatedProjectIds = args.relatedProjectIds || undefined;
    if (args.salesAssets !== undefined) patch.salesAssets = args.salesAssets || undefined;
    if (args.deliveryChecklist !== undefined) patch.deliveryChecklist = args.deliveryChecklist || undefined;
    if (args.notes !== undefined) patch.notes = args.notes?.trim() || undefined;
    await ctx.db.patch(args.id, patch);
    return { ok: true };
  },
});
