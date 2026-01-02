import { getDb, toJSON, ObjectId } from '../database/mongo';

interface SavedView {
  _id?: ObjectId;
  name: string;
  module: string;
  configuration: any;
  user_id?: string | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export class SavedViewsService {
  async getUserViews(module: string, userId?: string): Promise<any[]> {
    const db = await getDb();
    
    const filter: any = {
      module,
      deleted_at: null,
    };

    if (userId) {
      filter.$or = [{ user_id: userId }, { user_id: null }];
    } else {
      filter.user_id = null;
    }

    const views = await db.collection<SavedView>('saved_views')
      .find(filter)
      .sort({ created_at: -1 })
      .toArray();

    return views.map(toJSON);
  }

  async createView(data: {
    name: string;
    module: string;
    configuration: any;
    user_id?: string;
  }): Promise<any> {
    const db = await getDb();
    const now = new Date();

    const result = await db.collection<SavedView>('saved_views').insertOne({
      name: data.name,
      module: data.module,
      configuration: data.configuration,
      user_id: data.user_id || null,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    });

    const view = await db.collection<SavedView>('saved_views').findOne({ _id: result.insertedId });
    return toJSON(view);
  }

  async renameView(id: string, name: string): Promise<any | null> {
    const db = await getDb();
    
    const result = await db.collection<SavedView>('saved_views').findOneAndUpdate(
      { _id: new ObjectId(id), deleted_at: null },
      { $set: { name, updated_at: new Date() } },
      { returnDocument: 'after' }
    );

    return result ? toJSON(result) : null;
  }

  async deleteView(id: string): Promise<boolean> {
    const db = await getDb();
    
    const result = await db.collection<SavedView>('saved_views').updateOne(
      { _id: new ObjectId(id), deleted_at: null },
      { $set: { deleted_at: new Date() } }
    );

    return result.modifiedCount > 0;
  }
}
