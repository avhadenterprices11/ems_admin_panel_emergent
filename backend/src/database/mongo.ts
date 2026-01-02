import { MongoClient, Db, Collection, ObjectId } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'event_management';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongo(): Promise<Db> {
  if (db) return db;
  
  client = new MongoClient(MONGO_URL);
  await client.connect();
  db = client.db(DB_NAME);
  console.log('Connected to MongoDB');
  return db;
}

export async function getDb(): Promise<Db> {
  if (!db) {
    return await connectToMongo();
  }
  return db;
}

export async function closeMongo(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Helper to convert MongoDB _id to string id
export function toJSON(doc: any): any {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map(toJSON);
  }
  const { _id, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
}

export { ObjectId };
