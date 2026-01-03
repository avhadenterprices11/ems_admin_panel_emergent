import db from '../database/db';

export interface SegmentRule {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'in' | 'not_in' | 'greater_than' | 'less_than' | 'between' | 'is_empty' | 'is_not_empty';
  value: any;
}

export interface AudienceSegment {
  id: number;
  event_id: number;
  name: string;
  description?: string;
  match_type: 'ALL' | 'ANY';
  rules_json: SegmentRule[];
  estimated_count: number;
  is_active: boolean;
  last_evaluated_at?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
}

export interface CreateSegmentInput {
  name: string;
  description?: string;
  match_type: 'ALL' | 'ANY';
  rules_json: SegmentRule[];
  is_active?: boolean;
}

export interface UpdateSegmentInput {
  name?: string;
  description?: string;
  match_type?: 'ALL' | 'ANY';
  rules_json?: SegmentRule[];
  is_active?: boolean;
}

export interface SegmentMember {
  id: number;
  attendee_id: number;
  attendee_name: string;
  attendee_email?: string;
  ticket_name?: string;
  checkin_status: string;
  registration_status?: string;
}

export class AudienceSegmentsService {
  // Get all segments for an event
  async getSegmentsByEventId(eventId: number): Promise<AudienceSegment[]> {
    const segments = await db('audience_segments')
      .where('event_id', eventId)
      .andWhere('is_deleted', false)
      .orderBy('created_at', 'desc');

    // Parse rules_json for each segment
    return segments.map((s: any) => ({
      ...s,
      rules_json: typeof s.rules_json === 'string' ? JSON.parse(s.rules_json) : s.rules_json,
    }));
  }

  // Get segment by ID
  async getSegmentById(eventId: number, segmentId: number): Promise<AudienceSegment | null> {
    const segment = await db('audience_segments')
      .where('id', segmentId)
      .andWhere('event_id', eventId)
      .andWhere('is_deleted', false)
      .first();

    if (!segment) return null;

    return {
      ...segment,
      rules_json: typeof segment.rules_json === 'string' ? JSON.parse(segment.rules_json) : segment.rules_json,
    };
  }

  // Create segment
  async createSegment(eventId: number, input: CreateSegmentInput): Promise<AudienceSegment> {
    // Calculate initial count
    const count = await this.evaluateSegmentRules(eventId, input.rules_json, input.match_type);

    const [segment] = await db('audience_segments')
      .insert({
        event_id: eventId,
        name: input.name,
        description: input.description || null,
        match_type: input.match_type,
        rules_json: JSON.stringify(input.rules_json),
        estimated_count: count,
        is_active: input.is_active !== false,
        last_evaluated_at: db.fn.now(),
      })
      .returning('*');

    // Cache members
    await this.cacheSegmentMembers(segment.id, eventId, input.rules_json, input.match_type);

    return {
      ...segment,
      rules_json: input.rules_json,
    };
  }

  // Update segment
  async updateSegment(eventId: number, segmentId: number, input: UpdateSegmentInput): Promise<AudienceSegment | null> {
    const existing = await this.getSegmentById(eventId, segmentId);
    if (!existing) return null;

    const updateData: any = { updated_at: db.fn.now() };
    if (input.name !== undefined) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.match_type !== undefined) updateData.match_type = input.match_type;
    if (input.rules_json !== undefined) updateData.rules_json = JSON.stringify(input.rules_json);
    if (input.is_active !== undefined) updateData.is_active = input.is_active;

    // Recalculate count if rules changed
    const rules = input.rules_json || existing.rules_json;
    const matchType = input.match_type || existing.match_type;
    const count = await this.evaluateSegmentRules(eventId, rules, matchType);
    updateData.estimated_count = count;
    updateData.last_evaluated_at = db.fn.now();

    const [updated] = await db('audience_segments')
      .where('id', segmentId)
      .andWhere('event_id', eventId)
      .update(updateData)
      .returning('*');

    // Refresh cache
    await this.cacheSegmentMembers(segmentId, eventId, rules, matchType);

    return {
      ...updated,
      rules_json: typeof updated.rules_json === 'string' ? JSON.parse(updated.rules_json) : updated.rules_json,
    };
  }

  // Delete segment (soft delete)
  async deleteSegment(eventId: number, segmentId: number): Promise<boolean> {
    const result = await db('audience_segments')
      .where('id', segmentId)
      .andWhere('event_id', eventId)
      .update({ is_deleted: true, updated_at: db.fn.now() });

    // Clear cache
    await db('audience_segment_members').where('segment_id', segmentId).delete();

    return result > 0;
  }

  // Evaluate segment rules and return count
  async evaluateSegmentRules(eventId: number, rules: SegmentRule[], matchType: 'ALL' | 'ANY'): Promise<number> {
    const members = await this.resolveSegmentMembers(eventId, rules, matchType);
    return members.length;
  }

  // Resolve segment members based on rules
  async resolveSegmentMembers(eventId: number, rules: SegmentRule[], matchType: 'ALL' | 'ANY'): Promise<SegmentMember[]> {
    let query = db('event_attendees as a')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .leftJoin('event_registrations as r', 'a.registration_id', 'r.id')
      .select(
        'a.id as attendee_id',
        'a.attendee_name',
        'a.attendee_email',
        't.name as ticket_name',
        'a.checkin_status',
        'r.status as registration_status'
      )
      .where('a.event_id', eventId)
      .andWhere('a.is_deleted', false);

    if (rules.length === 0) {
      return query;
    }

    // Build dynamic WHERE clause based on rules
    if (matchType === 'ALL') {
      // All rules must match (AND)
      for (const rule of rules) {
        query = this.applyRule(query, rule);
      }
    } else {
      // Any rule can match (OR)
      query = query.andWhere(function() {
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (i === 0) {
            this.where(function() {
              applyRuleToBuilder(this, rule);
            });
          } else {
            this.orWhere(function() {
              applyRuleToBuilder(this, rule);
            });
          }
        }
      });
    }

    return query;
  }

  // Apply a single rule to query builder
  private applyRule(query: any, rule: SegmentRule): any {
    const { field, operator, value } = rule;
    const columnMap: Record<string, string> = {
      ticket_type: 't.name',
      ticket_id: 'a.ticket_id',
      checkin_status: 'a.checkin_status',
      registration_status: 'r.status',
      registration_date: 'r.created_at',
      city: 'r.city',
      tags: 'a.tags',
      attendee_email: 'a.attendee_email',
      attendee_name: 'a.attendee_name',
    };

    const column = columnMap[field] || field;

    switch (operator) {
      case 'equals':
        return query.andWhere(column, '=', value);
      case 'not_equals':
        return query.andWhere(column, '!=', value);
      case 'contains':
        return query.andWhere(column, 'ilike', `%${value}%`);
      case 'not_contains':
        return query.andWhereNot(column, 'ilike', `%${value}%`);
      case 'in':
        return query.whereIn(column, Array.isArray(value) ? value : [value]);
      case 'not_in':
        return query.whereNotIn(column, Array.isArray(value) ? value : [value]);
      case 'greater_than':
        return query.andWhere(column, '>', value);
      case 'less_than':
        return query.andWhere(column, '<', value);
      case 'between':
        if (Array.isArray(value) && value.length === 2) {
          return query.andWhereBetween(column, value);
        }
        return query;
      case 'is_empty':
        return query.andWhere(function() {
          this.whereNull(column).orWhere(column, '=', '');
        });
      case 'is_not_empty':
        return query.andWhereNot(function() {
          this.whereNull(column).orWhere(column, '=', '');
        });
      default:
        return query;
    }
  }

  // Cache segment members for performance
  async cacheSegmentMembers(segmentId: number, eventId: number, rules: SegmentRule[], matchType: 'ALL' | 'ANY'): Promise<void> {
    // Clear existing cache
    await db('audience_segment_members').where('segment_id', segmentId).delete();

    // Get current members
    const members = await this.resolveSegmentMembers(eventId, rules, matchType);

    if (members.length > 0) {
      const memberRecords = members.map((m: SegmentMember) => ({
        segment_id: segmentId,
        attendee_id: m.attendee_id,
        last_evaluated_at: db.fn.now(),
      }));

      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < memberRecords.length; i += batchSize) {
        const batch = memberRecords.slice(i, i + batchSize);
        await db('audience_segment_members').insert(batch).onConflict(['segment_id', 'attendee_id']).ignore();
      }
    }
  }

  // Preview segment members (for UI)
  async previewSegmentMembers(eventId: number, rules: SegmentRule[], matchType: 'ALL' | 'ANY', limit: number = 10): Promise<{ members: SegmentMember[]; total: number }> {
    const allMembers = await this.resolveSegmentMembers(eventId, rules, matchType);
    return {
      members: allMembers.slice(0, limit),
      total: allMembers.length,
    };
  }

  // Get cached members for a segment
  async getSegmentMembers(segmentId: number, page: number = 1, limit: number = 20): Promise<{ members: SegmentMember[]; total: number }> {
    const offset = (page - 1) * limit;

    const countResult = await db('audience_segment_members')
      .where('segment_id', segmentId)
      .count('id as count')
      .first();
    const total = parseInt((countResult as any)?.count || '0', 10);

    const members = await db('audience_segment_members as sm')
      .join('event_attendees as a', 'sm.attendee_id', 'a.id')
      .leftJoin('tickets as t', 'a.ticket_id', 't.id')
      .leftJoin('event_registrations as r', 'a.registration_id', 'r.id')
      .select(
        'a.id as attendee_id',
        'a.attendee_name',
        'a.attendee_email',
        't.name as ticket_name',
        'a.checkin_status',
        'r.status as registration_status'
      )
      .where('sm.segment_id', segmentId)
      .orderBy('a.attendee_name', 'asc')
      .limit(limit)
      .offset(offset);

    return { members, total };
  }

  // Refresh segment count (recalculate)
  async refreshSegment(eventId: number, segmentId: number): Promise<AudienceSegment | null> {
    const segment = await this.getSegmentById(eventId, segmentId);
    if (!segment) return null;

    const count = await this.evaluateSegmentRules(eventId, segment.rules_json, segment.match_type);

    const [updated] = await db('audience_segments')
      .where('id', segmentId)
      .update({
        estimated_count: count,
        last_evaluated_at: db.fn.now(),
        updated_at: db.fn.now(),
      })
      .returning('*');

    // Refresh cache
    await this.cacheSegmentMembers(segmentId, eventId, segment.rules_json, segment.match_type);

    return {
      ...updated,
      rules_json: typeof updated.rules_json === 'string' ? JSON.parse(updated.rules_json) : updated.rules_json,
    };
  }

  // Get available filter fields for UI
  getAvailableFilterFields(): { field: string; label: string; type: string; operators: string[] }[] {
    return [
      { 
        field: 'ticket_type', 
        label: 'Ticket Type', 
        type: 'select',
        operators: ['equals', 'not_equals', 'in', 'not_in']
      },
      { 
        field: 'checkin_status', 
        label: 'Check-in Status', 
        type: 'select',
        operators: ['equals', 'not_equals']
      },
      { 
        field: 'registration_status', 
        label: 'Registration Status', 
        type: 'select',
        operators: ['equals', 'not_equals']
      },
      { 
        field: 'registration_date', 
        label: 'Registration Date', 
        type: 'date',
        operators: ['equals', 'greater_than', 'less_than', 'between']
      },
      { 
        field: 'city', 
        label: 'City', 
        type: 'text',
        operators: ['equals', 'not_equals', 'contains', 'is_empty', 'is_not_empty']
      },
      { 
        field: 'tags', 
        label: 'Tags', 
        type: 'array',
        operators: ['contains', 'not_contains']
      },
      { 
        field: 'attendee_email', 
        label: 'Email', 
        type: 'text',
        operators: ['equals', 'contains', 'is_empty', 'is_not_empty']
      },
    ];
  }
}

// Helper function to apply rule inside a builder context
function applyRuleToBuilder(builder: any, rule: SegmentRule): void {
  const { field, operator, value } = rule;
  const columnMap: Record<string, string> = {
    ticket_type: 't.name',
    ticket_id: 'a.ticket_id',
    checkin_status: 'a.checkin_status',
    registration_status: 'r.status',
    registration_date: 'r.created_at',
    city: 'r.city',
    tags: 'a.tags',
    attendee_email: 'a.attendee_email',
    attendee_name: 'a.attendee_name',
  };

  const column = columnMap[field] || field;

  switch (operator) {
    case 'equals':
      builder.where(column, '=', value);
      break;
    case 'not_equals':
      builder.where(column, '!=', value);
      break;
    case 'contains':
      builder.where(column, 'ilike', `%${value}%`);
      break;
    case 'not_contains':
      builder.whereNot(column, 'ilike', `%${value}%`);
      break;
    case 'in':
      builder.whereIn(column, Array.isArray(value) ? value : [value]);
      break;
    case 'not_in':
      builder.whereNotIn(column, Array.isArray(value) ? value : [value]);
      break;
    case 'greater_than':
      builder.where(column, '>', value);
      break;
    case 'less_than':
      builder.where(column, '<', value);
      break;
    case 'between':
      if (Array.isArray(value) && value.length === 2) {
        builder.whereBetween(column, value);
      }
      break;
    case 'is_empty':
      builder.where(function() {
        this.whereNull(column).orWhere(column, '=', '');
      });
      break;
    case 'is_not_empty':
      builder.whereNot(function() {
        this.whereNull(column).orWhere(column, '=', '');
      });
      break;
  }
}
