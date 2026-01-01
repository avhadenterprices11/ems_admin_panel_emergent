import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

export const AnalyticsPage = () => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title="Analytics" 
        description="View detailed analytics and reports." 
      />
      <EmptyState message="Analytics dashboard coming soon..." />
    </div>
  );
};