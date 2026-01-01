import db from '../database/db';
import { SavedView } from '../interfaces/saved-view.interface';

export class SavedViewsService {
  async getUserViews(module: string, userId?: string): Promise<SavedView[]> {
    let query = db<SavedView>('saved_views')
      .where('module', module)
      .where('deleted_at', null);

    if (userId) {
      query = query.where((builder) => {
        builder.where('user_id', userId).orWhereNull('user_id');
      });
    } else {
      query = query.whereNull('user_id');
    }

    return await query.orderBy('created_at', 'desc');
  }

  async createView(data: {
    name: string;
    module: string;
    configuration: any;
    user_id?: string;
  }): Promise<SavedView> {
    const [view] = await db<SavedView>('saved_views')
      .insert({
        name: data.name,
        module: data.module,
        configuration: data.configuration,
        user_id: data.user_id || null,
      })
      .returning('*');

    return view;
  }

  async renameView(id: number, name: string): Promise<SavedView | null> {
    const [view] = await db<SavedView>('saved_views')
      .where('id', id)
      .where('deleted_at', null)
      .update({ name, updated_at: db.fn.now() })
      .returning('*');

    return view || null;
  }

  async deleteView(id: number): Promise<boolean> {
    const updated = await db<SavedView>('saved_views')
      .where('id', id)
      .where('deleted_at', null)
      .update({ deleted_at: db.fn.now() });

    return updated > 0;
  }
}
