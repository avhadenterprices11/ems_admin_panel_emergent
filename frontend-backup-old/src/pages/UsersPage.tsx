import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const UsersPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="User Management" 
        description="Manage all users and their permissions." 
      />
      <EmptyState message="User management interface coming soon..." />
    </div>
  );
};