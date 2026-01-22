import db from '../database/db';

export interface BadgeDesignConfig {
  visible_fields: string[];
  field_positions: Record<string, { x: number; y: number; width?: number }>;
  font_size_scale: number;
  primary_color: string;
  secondary_color: string;
  background_color: string;
  logo_url: string | null;
  show_punch_hole: boolean;
  qr_code_size: number;
}

export interface BadgeDesign {
  id: number;
  event_id: number | null;
  ticket_type_id: number | null;
  name: string;
  is_global_default: boolean;
  is_event_default: boolean;
  badge_size: string;
  custom_width: number | null;
  custom_height: number | null;
  orientation: string;
  design_config: BadgeDesignConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Joined fields
  ticket_type_name?: string;
}

export interface CreateBadgeDesignInput {
  event_id?: number | null;
  ticket_type_id?: number | null;
  name: string;
  is_global_default?: boolean;
  is_event_default?: boolean;
  badge_size?: string;
  custom_width?: number | null;
  custom_height?: number | null;
  orientation?: string;
  design_config?: Partial<BadgeDesignConfig>;
  is_active?: boolean;
}

export interface UpdateBadgeDesignInput {
  name?: string;
  is_event_default?: boolean;
  badge_size?: string;
  custom_width?: number | null;
  custom_height?: number | null;
  orientation?: string;
  design_config?: Partial<BadgeDesignConfig>;
  is_active?: boolean;
}

const DEFAULT_DESIGN_CONFIG: BadgeDesignConfig = {
  visible_fields: ['full_name', 'ticket_type', 'company', 'job_title', 'qr_code'],
  field_positions: {},
  font_size_scale: 1.0,
  primary_color: '#0f172b',
  secondary_color: '#3b82f6',
  background_color: '#ffffff',
  logo_url: null,
  show_punch_hole: true,
  qr_code_size: 80
};

export class BadgeDesignService {
  // Get all badge designs for an event (including global defaults)
  async getBadgeDesigns(eventId: number): Promise<BadgeDesign[]> {
    const designs = await db('badge_designs as bd')
      .leftJoin('tickets as t', 'bd.ticket_type_id', 't.id')
      .select(
        'bd.*',
        't.name as ticket_type_name'
      )
      .where(function() {
        this.where('bd.event_id', eventId)
          .orWhere('bd.is_global_default', true);
      })
      .andWhere('bd.is_deleted', false)
      .orderBy([
        { column: 'bd.is_global_default', order: 'desc' },
        { column: 'bd.is_event_default', order: 'desc' },
        { column: 'bd.created_at', order: 'asc' }
      ]);

    return designs.map(d => ({
      ...d,
      design_config: typeof d.design_config === 'string' 
        ? JSON.parse(d.design_config) 
        : d.design_config
    }));
  }

  // Get a single badge design by ID
  async getBadgeDesignById(designId: number): Promise<BadgeDesign | null> {
    const design = await db('badge_designs as bd')
      .leftJoin('tickets as t', 'bd.ticket_type_id', 't.id')
      .select('bd.*', 't.name as ticket_type_name')
      .where('bd.id', designId)
      .andWhere('bd.is_deleted', false)
      .first();

    if (!design) return null;

    return {
      ...design,
      design_config: typeof design.design_config === 'string'
        ? JSON.parse(design.design_config)
        : design.design_config
    };
  }

  // Get the appropriate badge design for a ticket
  // Priority: ticket_type design > event default > global default
  async getDesignForTicket(eventId: number, ticketTypeId?: number): Promise<BadgeDesign | null> {
    // 1. Try to find ticket-type specific design
    if (ticketTypeId) {
      const ticketDesign = await db('badge_designs')
        .where('ticket_type_id', ticketTypeId)
        .andWhere('is_deleted', false)
        .andWhere('is_active', true)
        .first();
      
      if (ticketDesign) {
        return {
          ...ticketDesign,
          design_config: typeof ticketDesign.design_config === 'string'
            ? JSON.parse(ticketDesign.design_config)
            : ticketDesign.design_config
        };
      }
    }

    // 2. Try to find event default design
    const eventDesign = await db('badge_designs')
      .where('event_id', eventId)
      .andWhere('is_event_default', true)
      .andWhere('is_deleted', false)
      .andWhere('is_active', true)
      .first();

    if (eventDesign) {
      return {
        ...eventDesign,
        design_config: typeof eventDesign.design_config === 'string'
          ? JSON.parse(eventDesign.design_config)
          : eventDesign.design_config
      };
    }

    // 3. Fall back to global default
    const globalDesign = await db('badge_designs')
      .where('is_global_default', true)
      .andWhere('is_deleted', false)
      .andWhere('is_active', true)
      .first();

    if (globalDesign) {
      return {
        ...globalDesign,
        design_config: typeof globalDesign.design_config === 'string'
          ? JSON.parse(globalDesign.design_config)
          : globalDesign.design_config
      };
    }

    return null;
  }

  // Create a new badge design
  async createBadgeDesign(input: CreateBadgeDesignInput): Promise<BadgeDesign> {
    const designConfig = {
      ...DEFAULT_DESIGN_CONFIG,
      ...(input.design_config || {})
    };

    // If setting as event default, clear other event defaults
    if (input.is_event_default && input.event_id) {
      await db('badge_designs')
        .where('event_id', input.event_id)
        .andWhere('is_event_default', true)
        .update({ is_event_default: false, updated_at: db.fn.now() });
    }

    const [design] = await db('badge_designs')
      .insert({
        event_id: input.event_id || null,
        ticket_type_id: input.ticket_type_id || null,
        name: input.name,
        is_global_default: input.is_global_default || false,
        is_event_default: input.is_event_default || false,
        badge_size: input.badge_size || 'a6',
        custom_width: input.custom_width || null,
        custom_height: input.custom_height || null,
        orientation: input.orientation || 'portrait',
        design_config: JSON.stringify(designConfig),
        is_active: input.is_active !== false
      })
      .returning('*');

    return {
      ...design,
      design_config: typeof design.design_config === 'string'
        ? JSON.parse(design.design_config)
        : design.design_config
    };
  }

  // Update a badge design
  async updateBadgeDesign(designId: number, input: UpdateBadgeDesignInput): Promise<BadgeDesign | null> {
    const existing = await this.getBadgeDesignById(designId);
    if (!existing) return null;

    // If setting as event default, clear other event defaults
    if (input.is_event_default && existing.event_id) {
      await db('badge_designs')
        .where('event_id', existing.event_id)
        .andWhere('is_event_default', true)
        .andWhere('id', '!=', designId)
        .update({ is_event_default: false, updated_at: db.fn.now() });
    }

    const updateData: any = { updated_at: db.fn.now() };
    
    if (input.name !== undefined) updateData.name = input.name;
    if (input.is_event_default !== undefined) updateData.is_event_default = input.is_event_default;
    if (input.badge_size !== undefined) updateData.badge_size = input.badge_size;
    if (input.custom_width !== undefined) updateData.custom_width = input.custom_width;
    if (input.custom_height !== undefined) updateData.custom_height = input.custom_height;
    if (input.orientation !== undefined) updateData.orientation = input.orientation;
    if (input.is_active !== undefined) updateData.is_active = input.is_active;
    
    if (input.design_config) {
      const mergedConfig = {
        ...existing.design_config,
        ...input.design_config
      };
      updateData.design_config = JSON.stringify(mergedConfig);
    }

    const [updated] = await db('badge_designs')
      .where('id', designId)
      .update(updateData)
      .returning('*');

    return {
      ...updated,
      design_config: typeof updated.design_config === 'string'
        ? JSON.parse(updated.design_config)
        : updated.design_config
    };
  }

  // Delete a badge design (soft delete)
  async deleteBadgeDesign(designId: number): Promise<boolean> {
    const result = await db('badge_designs')
      .where('id', designId)
      .andWhere('is_global_default', false) // Prevent deleting global default
      .update({ is_deleted: true, updated_at: db.fn.now() });

    return result > 0;
  }

  // Duplicate a badge design
  async duplicateBadgeDesign(designId: number, newName?: string): Promise<BadgeDesign | null> {
    const existing = await this.getBadgeDesignById(designId);
    if (!existing) return null;

    return this.createBadgeDesign({
      event_id: existing.event_id,
      ticket_type_id: existing.ticket_type_id,
      name: newName || `${existing.name} (Copy)`,
      is_event_default: false, // Copies shouldn't be default
      badge_size: existing.badge_size,
      custom_width: existing.custom_width,
      custom_height: existing.custom_height,
      orientation: existing.orientation,
      design_config: existing.design_config,
      is_active: existing.is_active
    });
  }

  // Ensure global default exists
  async ensureGlobalDefault(): Promise<BadgeDesign> {
    const existing = await db('badge_designs')
      .where('is_global_default', true)
      .andWhere('is_deleted', false)
      .first();

    if (existing) {
      return {
        ...existing,
        design_config: typeof existing.design_config === 'string'
          ? JSON.parse(existing.design_config)
          : existing.design_config
      };
    }

    // Create global default
    return this.createBadgeDesign({
      name: 'Default Badge Design',
      is_global_default: true,
      design_config: DEFAULT_DESIGN_CONFIG
    });
  }
}
