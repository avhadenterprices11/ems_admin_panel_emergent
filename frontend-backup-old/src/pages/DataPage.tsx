import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const DataPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Data Management" 
        description="Backup, export, and manage your data." 
      />
      <EmptyState message="Data management interface coming soon..." />
    </div>
  );
};