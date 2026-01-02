import db from '../database/db';

interface OverviewMetrics {
  totalRegistrations: number;
  registrationsChange: number;
  grossRevenue: number;
  revenueChange: number;
  pageViews: number;
  pageViewsChange: number;
  conversionRate: number;
  conversionRateChange: number;
}

interface FunnelData {
  pageViews: number;
  addToCart: number;
  checkoutStarted: number;
  completedRegistration: number;
}

interface TicketInventory {
  id: number;
  name: string;
  sold: number;
  total: number;
  status: string;
}

interface AttentionAlert {
  type: 'warning' | 'error' | 'info';
  text: string;
  category: string;
}

interface ActivityLog {
  id: number;
  actorType: string;
  actorId: number | null;
  actionType: string;
  description: string;
  createdAt: Date;
  metadata: any;
}

export class EventOverviewService {
  /**
   * Get overview summary metrics for an event
   */
  async getOverviewMetrics(eventId: number, startDate?: string, endDate?: string): Promise<OverviewMetrics> {
    // Build date filter
    const dateFilter = (query: any) => {
      if (startDate) query.where('created_at', '>=', startDate);
      if (endDate) query.where('created_at', '<=', endDate);
      return query;
    };

    // Get total completed registrations
    const totalRegsQuery = db('event_registrations')
      .where('event_id', eventId)
      .where('status', 'completed')
      .where('is_deleted', false);
    dateFilter(totalRegsQuery);
    const totalRegsResult = await totalRegsQuery.count('* as count').first();
    const totalRegistrations = parseInt(totalRegsResult?.count as string || '0');

    // Get gross revenue from ticket_sales
    const revenueQuery = db('ticket_sales')
      .where('event_id', eventId)
      .where('status', 'paid')
      .where('is_deleted', false);
    dateFilter(revenueQuery);
    const revenueResult = await revenueQuery.sum('total_amount as sum').first();
    const grossRevenue = parseFloat(revenueResult?.sum as string || '0');

    // Get page views from analytics
    const pageViewsQuery = db('event_analytics_events')
      .where('event_id', eventId)
      .where('event_type', 'page_view');
    dateFilter(pageViewsQuery);
    const pageViewsResult = await pageViewsQuery.count('* as count').first();
    const pageViews = parseInt(pageViewsResult?.count as string || '0');

    // Calculate conversion rate (completed registrations / page views * 100)
    const conversionRate = pageViews > 0 ? (totalRegistrations / pageViews) * 100 : 0;

    // Calculate changes from previous period
    const periodDays = this.calculatePeriodDays(startDate, endDate);
    const prevStartDate = startDate ? new Date(new Date(startDate).getTime() - periodDays * 24 * 60 * 60 * 1000).toISOString() : undefined;
    const prevEndDate = startDate ? new Date(new Date(startDate).getTime() - 1).toISOString() : undefined;

    // Previous period metrics (simplified)
    const prevMetrics = await this.getPreviousPeriodMetrics(eventId, prevStartDate, prevEndDate);

    return {
      totalRegistrations,
      registrationsChange: this.calculateChange(totalRegistrations, prevMetrics.totalRegistrations),
      grossRevenue,
      revenueChange: this.calculateChange(grossRevenue, prevMetrics.grossRevenue),
      pageViews,
      pageViewsChange: this.calculateChange(pageViews, prevMetrics.pageViews),
      conversionRate: Math.round(conversionRate * 100) / 100,
      conversionRateChange: Math.round((conversionRate - prevMetrics.conversionRate) * 100) / 100,
    };
  }

  /**
   * Get registration funnel data for an event
   */
  async getRegistrationFunnel(eventId: number, startDate?: string, endDate?: string): Promise<FunnelData> {
    const dateFilter = (query: any) => {
      if (startDate) query.where('created_at', '>=', startDate);
      if (endDate) query.where('created_at', '<=', endDate);
      return query;
    };

    // Page views
    const pageViewsQuery = db('event_analytics_events')
      .where('event_id', eventId)
      .where('event_type', 'page_view');
    dateFilter(pageViewsQuery);
    const pageViewsResult = await pageViewsQuery.count('* as count').first();
    const pageViews = parseInt(pageViewsResult?.count as string || '0');

    // Add to cart
    const addToCartQuery = db('event_analytics_events')
      .where('event_id', eventId)
      .where('event_type', 'add_to_cart');
    dateFilter(addToCartQuery);
    const addToCartResult = await addToCartQuery.count('* as count').first();
    const addToCart = parseInt(addToCartResult?.count as string || '0');

    // Checkout started
    const checkoutQuery = db('event_analytics_events')
      .where('event_id', eventId)
      .where('event_type', 'checkout_started');
    dateFilter(checkoutQuery);
    const checkoutResult = await checkoutQuery.count('* as count').first();
    const checkoutStarted = parseInt(checkoutResult?.count as string || '0');

    // Completed registrations
    const completedQuery = db('event_registrations')
      .where('event_id', eventId)
      .where('status', 'completed')
      .where('is_deleted', false);
    dateFilter(completedQuery);
    const completedResult = await completedQuery.count('* as count').first();
    const completedRegistration = parseInt(completedResult?.count as string || '0');

    return {
      pageViews,
      addToCart,
      checkoutStarted,
      completedRegistration,
    };
  }

  /**
   * Get ticket inventory health for an event
   */
  async getTicketInventory(eventId: number): Promise<TicketInventory[]> {
    const tickets = await db('tickets')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .orderBy('created_at', 'asc');

    return tickets.map((ticket: any) => {
      const sold = ticket.sold_count || 0;
      const total = ticket.capacity || 0;
      
      // Determine status
      let status = 'Available';
      if (ticket.status === 'sold_out' || (total > 0 && sold >= total)) {
        status = 'Sold Out';
      } else if (total > 0 && sold / total > 0.8) {
        status = 'Selling Fast';
      } else if (ticket.status === 'ended') {
        status = 'Ended';
      } else if (ticket.status === 'draft') {
        status = 'Draft';
      }

      return {
        id: ticket.id,
        name: ticket.name,
        sold,
        total,
        status,
      };
    });
  }

  /**
   * Get attention needed alerts for an event
   */
  async getAttentionAlerts(eventId: number): Promise<AttentionAlert[]> {
    const alerts: AttentionAlert[] = [];

    // Check for low inventory tickets
    const lowInventoryTickets = await db('tickets')
      .where('event_id', eventId)
      .where('is_deleted', false)
      .where('status', 'on_sale')
      .whereRaw('capacity IS NOT NULL AND capacity > 0')
      .whereRaw('(capacity - sold_count) <= (capacity * 0.1)');

    for (const ticket of lowInventoryTickets) {
      const remaining = (ticket.capacity || 0) - (ticket.sold_count || 0);
      if (remaining === 0) {
        alerts.push({
          type: 'error',
          text: `${ticket.name} is sold out`,
          category: 'inventory',
        });
      } else {
        alerts.push({
          type: 'warning',
          text: `${ticket.name} inventory low (${remaining} remaining)`,
          category: 'inventory',
        });
      }
    }

    // Check for pending refund requests
    const pendingRefunds = await db('refunds')
      .where('event_id', eventId)
      .where('status', 'pending')
      .count('* as count')
      .first();
    
    const refundCount = parseInt(pendingRefunds?.count as string || '0');
    if (refundCount > 0) {
      alerts.push({
        type: 'error',
        text: `${refundCount} pending refund request${refundCount > 1 ? 's' : ''}`,
        category: 'finance',
      });
    }

    // Check for failed payments
    const failedPayments = await db('ticket_sales')
      .where('event_id', eventId)
      .where('status', 'failed')
      .where('is_deleted', false)
      .whereRaw("created_at > NOW() - INTERVAL '7 days'")
      .count('* as count')
      .first();
    
    const failedCount = parseInt(failedPayments?.count as string || '0');
    if (failedCount > 0) {
      alerts.push({
        type: 'warning',
        text: `${failedCount} failed payment${failedCount > 1 ? 's' : ''} in the last 7 days`,
        category: 'finance',
      });
    }

    return alerts;
  }

  /**
   * Get activity timeline for an event
   */
  async getActivityTimeline(eventId: number, limit: number = 20): Promise<ActivityLog[]> {
    const logs = await db('event_activity_logs')
      .where('event_id', eventId)
      .orderBy('created_at', 'desc')
      .limit(limit);

    return logs.map((log: any) => ({
      id: log.id,
      actorType: log.actor_type,
      actorId: log.actor_id,
      actionType: log.action_type,
      description: log.description,
      createdAt: log.created_at,
      metadata: log.metadata,
    }));
  }

  /**
   * Get event by ID
   */
  async getEventById(eventId: number): Promise<any | null> {
    const event = await db('events')
      .where('id', eventId)
      .where('deleted_at', null)
      .first();

    return event;
  }

  private calculatePeriodDays(startDate?: string, endDate?: string): number {
    if (!startDate || !endDate) return 7; // Default to 7 days
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) || 7;
  }

  private async getPreviousPeriodMetrics(eventId: number, startDate?: string, endDate?: string): Promise<{
    totalRegistrations: number;
    grossRevenue: number;
    pageViews: number;
    conversionRate: number;
  }> {
    if (!startDate || !endDate) {
      return { totalRegistrations: 0, grossRevenue: 0, pageViews: 0, conversionRate: 0 };
    }

    const dateFilter = (query: any) => {
      query.where('created_at', '>=', startDate);
      query.where('created_at', '<=', endDate);
      return query;
    };

    // Previous registrations
    const prevRegsQuery = db('event_registrations')
      .where('event_id', eventId)
      .where('status', 'completed')
      .where('is_deleted', false);
    dateFilter(prevRegsQuery);
    const prevRegsResult = await prevRegsQuery.count('* as count').first();
    const totalRegistrations = parseInt(prevRegsResult?.count as string || '0');

    // Previous revenue
    const prevRevenueQuery = db('ticket_sales')
      .where('event_id', eventId)
      .where('status', 'paid')
      .where('is_deleted', false);
    dateFilter(prevRevenueQuery);
    const prevRevenueResult = await prevRevenueQuery.sum('total_amount as sum').first();
    const grossRevenue = parseFloat(prevRevenueResult?.sum as string || '0');

    // Previous page views
    const prevPageViewsQuery = db('event_analytics_events')
      .where('event_id', eventId)
      .where('event_type', 'page_view');
    dateFilter(prevPageViewsQuery);
    const prevPageViewsResult = await prevPageViewsQuery.count('* as count').first();
    const pageViews = parseInt(prevPageViewsResult?.count as string || '0');

    const conversionRate = pageViews > 0 ? (totalRegistrations / pageViews) * 100 : 0;

    return { totalRegistrations, grossRevenue, pageViews, conversionRate };
  }

  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }
}
