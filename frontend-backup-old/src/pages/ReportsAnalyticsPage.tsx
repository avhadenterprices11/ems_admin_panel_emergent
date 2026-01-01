import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportsPage } from './ReportsPage';
import { AnalyticsDashboardPage } from './AnalyticsDashboardPage';
import { BarChart2, FileText } from 'lucide-react';

interface ReportsAnalyticsPageProps {
  onManageReport?: (id: string) => void;
  onCreateReport?: () => void;
}

export function ReportsAnalyticsPage({ onManageReport, onCreateReport }: ReportsAnalyticsPageProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reports' | 'analytics'>('reports');
  const [analyticsType, setAnalyticsType] = useState<'event-performance' | 'registration-funnel' | 'revenue-summary' | 'attendance'>('event-performance');

  const handleViewAnalytics = (reportType: string) => {
    setAnalyticsType(reportType as any);
    setActiveTab('analytics');
  };

  const handleCreateReport = () => {
    navigate('/reports/new');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 pt-4">
            <button
              onClick={() => setActiveTab('reports')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-medium transition-all
                ${activeTab === 'reports' 
                  ? 'bg-white text-blue-600 border-t-2 border-x border-blue-600 border-b-0 -mb-px' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              <FileText size={16} />
              Reports
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-t-lg text-sm font-medium transition-all
                ${activeTab === 'analytics' 
                  ? 'bg-white text-blue-600 border-t-2 border-x border-blue-600 border-b-0 -mb-px' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }
              `}
            >
              <BarChart2 size={16} />
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'reports' ? (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <ReportsPage 
              onManageReport={onManageReport}
              onCreateReport={handleCreateReport}
              onViewAnalytics={handleViewAnalytics}
            />
          </div>
        ) : (
          <AnalyticsDashboardPage 
            reportType={analyticsType}
            onBack={() => setActiveTab('reports')}
          />
        )}
      </div>
    </div>
  );
}