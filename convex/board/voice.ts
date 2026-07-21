import { query } from '../_generated/server';
import { v } from 'convex/values';

/**
 * Voice CRM dashboard — call queue, bookings, and messages in one view.
 * Mirrors emvy-website-v2/convex/board/voice.ts (canonical deployer).
 */
export const dashboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const take = limit ?? 20;
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86400000;

    // ── Call queue: leads with a phone number, sorted by next action ──
    const recentLeads = await ctx.db
      .query('leads')
      .withIndex('by_nextActionAt')
      .order('desc')
      .take(200);
    const callQueue = recentLeads
      .filter((l) => l.phone && l.nextActionAt)
      .slice(0, take)
      .map((l) => ({
        _id: l._id,
        contact: l.contact ?? undefined,
        email: l.email ?? undefined,
        company: l.company ?? undefined,
        phone: l.phone ?? undefined,
        score: l.score ?? undefined,
        nextActionAt: l.nextActionAt ?? undefined,
        lastTouchpoint: l.lastTouchpoint ?? undefined,
        discoveredAt: l.discoveredAt ?? undefined,
      }));

    // ── Summary: call-ready and due follow-up counts ──
    const callReadyLeads = callQueue.filter(
      (l) => l.nextActionAt && l.nextActionAt <= now
    ).length;
    const dueFollowUps = recentLeads.filter(
      (l) => l.nextActionAt && l.nextActionAt <= now
    ).length;

    // ── Bookings: upcoming, not cancelled ──
    const allBookings = await ctx.db
      .query('cal_bookings')
      .withIndex('by_bookingTime')
      .order('desc')
      .take(take * 2);
    const upcomingBookings = allBookings.filter(
      (b) => b.bookingTime > now && b.status !== 'cancelled'
    );
    const bookings = await Promise.all(
      upcomingBookings.slice(0, take).map(async (b) => {
        let lead = null;
        if (b.leadId) {
          const l = await ctx.db.get(b.leadId);
          if (l) lead = { _id: l._id, contact: l.contact, email: l.email, company: l.company };
        }
        return {
          _id: b._id,
          name: b.name ?? undefined,
          email: b.email ?? undefined,
          bookingTime: b.bookingTime,
          status: b.status,
          lead,
        };
      })
    );

    // ── Messages: recent contact submissions, matched to leads by email ──
    const submissions = await ctx.db
      .query('contact_submissions')
      .withIndex('by_createdAt')
      .order('desc')
      .take(take);
    const recentSubmissions = submissions.filter((s) => s.createdAt >= sevenDaysAgo);
    const leadEmails = new Set<string>();
    const leadByEmail = new Map<string, { _id: string; contact?: string; email?: string; company?: string }>();
    for (const s of recentSubmissions) {
      if (s.email && !leadByEmail.has(s.email)) leadEmails.add(s.email);
    }
    if (leadEmails.size > 0) {
      const allLeads = await ctx.db.query('leads').take(5000);
      for (const l of allLeads) {
        if (l.email && leadEmails.has(l.email)) {
          leadByEmail.set(l.email, { _id: l._id, contact: l.contact, email: l.email, company: l.company });
        }
      }
    }
    const messages = submissions.slice(0, take).map((s) => ({
      _id: s._id,
      name: s.name ?? undefined,
      email: s.email ?? undefined,
      phone: s.phone ?? undefined,
      company: s.company ?? undefined,
      message: s.message ?? undefined,
      source: s.source ?? undefined,
      createdAt: s.createdAt,
      notifiedAt: s.notifiedAt ?? undefined,
      matchedLead: s.email ? (leadByEmail.get(s.email) ?? null) : null,
    }));

    const recentMessages = submissions.filter((s) => s.createdAt >= sevenDaysAgo).length;
    const matchedMessages = messages.filter((m) => m.matchedLead).length;
    const upcomingBookingsCount = bookings.length;

    return {
      summary: {
        callReadyLeads,
        dueFollowUps,
        upcomingBookings: upcomingBookingsCount,
        recentMessages,
        matchedMessages,
      },
      callQueue,
      bookings,
      messages,
    };
  },
});
