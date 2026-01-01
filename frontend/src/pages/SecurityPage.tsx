import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const SecurityPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Roles & Permissions" 
        description="Configure roles and access control." 
      />
      <EmptyState message="Security settings interface coming soon..." />
    </div>
  );
};