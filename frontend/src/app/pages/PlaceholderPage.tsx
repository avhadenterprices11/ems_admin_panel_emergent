import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export const PlaceholderPage = ({ title, description }: PlaceholderPageProps) => {
  return (
    <div className="space-y-4">
      <PageHeader 
        title={title} 
        description={description || "This section is under development."} 
      />
      <EmptyState message="Coming soon..." />
    </div>
  );
};