import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const ContentPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Content Management" 
        description="Manage your content and media." 
      />
      <EmptyState message="Content management interface coming soon..." />
    </div>
  );
};