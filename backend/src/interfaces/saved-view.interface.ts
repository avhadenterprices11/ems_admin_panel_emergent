export interface SavedView {
  id: number;
  user_id: string | null;
  module: string;
  name: string;
  configuration: any;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}
