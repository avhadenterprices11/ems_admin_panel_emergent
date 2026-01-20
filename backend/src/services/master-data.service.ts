import db from '../database/db';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface CreateCategoryDTO {
  name: string;
  description?: string;
}

export interface CreateTagDTO {
  name: string;
  color?: string;
}

export class MasterDataService {
  // ============ CATEGORIES ============
  
  async getCategories(includeInactive = false): Promise<Category[]> {
    let query = db<Category>('categories').whereNull('deleted_at');
    if (!includeInactive) {
      query = query.where('is_active', true);
    }
    return query.orderBy('name', 'asc');
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return db<Category>('categories')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
  }

  async createCategory(data: CreateCategoryDTO): Promise<Category> {
    const slug = this.generateSlug(data.name);
    
    // Check if category with same slug exists
    const existing = await db('categories').where('slug', slug).first();
    if (existing) {
      throw new Error('Category with this name already exists');
    }

    const [category] = await db<Category>('categories')
      .insert({
        name: data.name,
        slug,
        description: data.description,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return category;
  }

  async updateCategory(id: number, data: Partial<CreateCategoryDTO> & { is_active?: boolean }): Promise<Category> {
    const updateData: any = { updated_at: new Date() };
    
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = this.generateSlug(data.name);
    }
    if (data.description !== undefined) updateData.description = data.description;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const [category] = await db<Category>('categories')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return category;
  }

  async deleteCategory(id: number): Promise<void> {
    await db('categories')
      .where('id', id)
      .update({ deleted_at: new Date() });
  }

  // ============ TAGS ============
  
  async getTags(search?: string, includeInactive = false): Promise<Tag[]> {
    let query = db<Tag>('tags').whereNull('deleted_at');
    if (!includeInactive) {
      query = query.where('is_active', true);
    }
    if (search) {
      query = query.where('name', 'ilike', `%${search}%`);
    }
    return query.orderBy('name', 'asc');
  }

  async getTagById(id: number): Promise<Tag | undefined> {
    return db<Tag>('tags')
      .where('id', id)
      .whereNull('deleted_at')
      .first();
  }

  async createTag(data: CreateTagDTO): Promise<Tag> {
    const slug = this.generateSlug(data.name);
    
    // Check if tag with same slug exists
    const existing = await db('tags').where('slug', slug).first();
    if (existing) {
      throw new Error('Tag with this name already exists');
    }

    const [tag] = await db<Tag>('tags')
      .insert({
        name: data.name,
        slug,
        color: data.color || this.generateRandomColor(),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date(),
      })
      .returning('*');

    return tag;
  }

  async updateTag(id: number, data: Partial<CreateTagDTO> & { is_active?: boolean }): Promise<Tag> {
    const updateData: any = { updated_at: new Date() };
    
    if (data.name) {
      updateData.name = data.name;
      updateData.slug = this.generateSlug(data.name);
    }
    if (data.color !== undefined) updateData.color = data.color;
    if (data.is_active !== undefined) updateData.is_active = data.is_active;

    const [tag] = await db<Tag>('tags')
      .where('id', id)
      .update(updateData)
      .returning('*');

    return tag;
  }

  async deleteTag(id: number): Promise<void> {
    await db('tags')
      .where('id', id)
      .update({ deleted_at: new Date() });
  }

  // ============ EVENT TAGS ============
  
  async getEventTags(eventId: number): Promise<Tag[]> {
    return db<Tag>('tags')
      .join('event_tags', 'tags.id', 'event_tags.tag_id')
      .where('event_tags.event_id', eventId)
      .whereNull('tags.deleted_at')
      .select('tags.*');
  }

  async setEventTags(eventId: number, tagIds: number[]): Promise<void> {
    // Remove existing tags
    await db('event_tags').where('event_id', eventId).delete();
    
    // Add new tags
    if (tagIds.length > 0) {
      const records = tagIds.map(tagId => ({
        event_id: eventId,
        tag_id: tagId,
        created_at: new Date(),
      }));
      await db('event_tags').insert(records);
    }
  }

  // ============ USERS (for co-hosts) ============
  
  async getUsers(): Promise<{ id: number; name: string; email: string }[]> {
    const users = await db('users')
      .whereNull('deleted_at')
      .select('id', 'name', 'email')
      .orderBy('email', 'asc');
    
    // Ensure name is never null - use email prefix as fallback
    return users.map(u => ({
      ...u,
      name: u.name || u.email.split('@')[0]
    }));
  }

  // ============ EVENT CO-HOSTS ============
  
  async getEventCohosts(eventId: number): Promise<{ id: number; user_id: number; role: string; name: string; email: string }[]> {
    const cohosts = await db('event_cohosts')
      .join('users', 'event_cohosts.user_id', 'users.id')
      .where('event_cohosts.event_id', eventId)
      .select('event_cohosts.id', 'event_cohosts.user_id', 'event_cohosts.role', 'users.name', 'users.email');
    
    // Ensure name is never null - use email prefix as fallback
    return cohosts.map(c => ({
      ...c,
      name: c.name || c.email.split('@')[0]
    }));
  }

  async setEventCohosts(eventId: number, userIds: number[]): Promise<void> {
    // Remove existing co-hosts
    await db('event_cohosts').where('event_id', eventId).delete();
    
    // Add new co-hosts
    if (userIds.length > 0) {
      const records = userIds.map(userId => ({
        event_id: eventId,
        user_id: userId,
        role: 'cohost',
        created_at: new Date(),
      }));
      await db('event_cohosts').insert(records);
    }
  }

  // ============ EVENT MEDIA ============
  
  async getEventMedia(eventId: number, mediaType?: string): Promise<any[]> {
    let query = db('event_media').where('event_id', eventId);
    if (mediaType) {
      query = query.where('media_type', mediaType);
    }
    return query.orderBy('sort_order', 'asc');
  }

  async addEventMedia(eventId: number, data: {
    file_key: string;
    url: string;
    file_type: string;
    media_type: string;
    size?: number;
    original_name?: string;
  }): Promise<any> {
    const maxOrder = await db('event_media')
      .where('event_id', eventId)
      .where('media_type', data.media_type)
      .max('sort_order as max')
      .first();
    
    const [media] = await db('event_media')
      .insert({
        event_id: eventId,
        ...data,
        sort_order: (maxOrder?.max || 0) + 1,
        created_at: new Date(),
      })
      .returning('*');

    return media;
  }

  async deleteEventMedia(mediaId: number): Promise<void> {
    await db('event_media').where('id', mediaId).delete();
  }

  // ============ HELPERS ============
  
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private generateRandomColor(): string {
    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#EF4444'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
