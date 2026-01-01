import React from 'react';
import {
  CheckCircle2, AlertCircle, AlertTriangle, Info, XCircle, Archive, Users, Edit
} from 'lucide-react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

// ==================== HELPER COMPONENTS ====================

// 1. SwitchField Component
interface SwitchFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export const SwitchField = ({ label, description, checked, onCheckedChange, badge, disabled }: SwitchFieldProps) => {
  return (
    <div className="flex items-start justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <Label className="text-sm font-medium text-slate-900">{label}</Label>
          {badge}
        </div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
};

// 2. FormField Component
interface FormFieldProps {
  label: string;
  helper?: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}

export const FormField = ({ label, helper, required, children, error }: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-900">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {helper && <p className="text-xs text-slate-500">{helper}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
};

// 3. ContentCard Component
interface ContentCardProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}

export const ContentCard = ({ title, description, action, children }: ContentCardProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg">
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action}
        </div>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

// 4. StatCard Component
interface StatCardProps {
  label: string;
  value: string;
  icon: any;
  color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'slate';
}

export const StatCard = ({ label, value, icon: Icon, color }: StatCardProps) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    blue: 'bg-blue-50 border-blue-200',
    purple: 'bg-purple-50 border-purple-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    slate: 'bg-slate-50 border-slate-200'
  };

  const iconColorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    slate: 'text-slate-600'
  };

  const valueColorClasses = {
    green: 'text-green-900',
    blue: 'text-blue-900',
    purple: 'text-purple-900',
    orange: 'text-orange-900',
    red: 'text-red-900',
    slate: 'text-slate-900'
  };

  return (
    <div className={cn('border rounded-lg p-4', colorClasses[color])}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-600 font-medium">{label}</span>
        <Icon size={16} className={iconColorClasses[color]} />
      </div>
      <div className={cn('text-2xl font-bold', valueColorClasses[color])}>{value}</div>
    </div>
  );
};

// 5. InfoBanner Component
interface InfoBannerProps {
  type: 'info' | 'warning' | 'success' | 'error';
  title?: string;
  message: string;
}

export const InfoBanner = ({ type, title, message }: InfoBannerProps) => {
  const configs = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-600',
      textColor: 'text-blue-900'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      textColor: 'text-amber-900'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle2,
      iconColor: 'text-green-600',
      textColor: 'text-green-900'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-600',
      textColor: 'text-red-900'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className={cn(config.bg, 'border', config.border, 'rounded-lg p-4')}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={cn(config.iconColor, 'mt-0.5 shrink-0')} />
        <div className="flex-1">
          {title && <p className={cn('text-sm font-semibold', config.textColor, 'mb-1')}>{title}</p>}
          <p className={cn('text-sm', config.textColor)}>{message}</p>
        </div>
      </div>
    </div>
  );
};

// 6. EmptyState Component
interface EmptyStateProps {
  icon: any;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => {
  return (
    <div className="text-center py-12">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
        <Icon size={32} className="text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">{description}</p>
      {action}
    </div>
  );
};

// 7. StatusIndicator Component
interface StatusIndicatorProps {
  status: 'healthy' | 'degraded' | 'maintenance';
}

export const StatusIndicator = ({ status }: StatusIndicatorProps) => {
  const configs = {
    healthy: {
      icon: CheckCircle2,
      text: 'All Systems Operational',
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200'
    },
    degraded: {
      icon: AlertCircle,
      text: 'Partial Service',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200'
    },
    maintenance: {
      icon: AlertTriangle,
      text: 'Maintenance Mode',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200'
    }
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border', config.bg, config.border)}>
      <Icon size={14} className={config.color} />
      <span className={cn('text-xs font-medium', config.color)}>{config.text}</span>
    </div>
  );
};

// 8. UnsavedChangesBar Component
interface UnsavedChangesBarProps {
  hasChanges: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export const UnsavedChangesBar = ({ hasChanges, isSaving, onCancel, onSave }: UnsavedChangesBarProps) => {
  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-30">
      <div className="max-w-[1600px] mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-amber-600" />
            <span className="text-sm font-medium text-slate-900">You have unsaved changes</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving} className="gap-2">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 9. PageHeader Component
interface PageHeaderProps {
  breadcrumbs: { label: string; onClick?: () => void }[];
  title: string;
  description: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader = ({ breadcrumbs, title, description, badge, actions }: PageHeaderProps) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-[1600px] mx-auto px-8 py-5">
        <div className="flex items-center gap-2 mb-3 text-sm">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <span className="text-slate-400">→</span>}
              {crumb.onClick ? (
                <button
                  onClick={crumb.onClick}
                  className="text-slate-600 hover:text-slate-900 transition-colors"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-900 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                {title}
              </h1>
              <p className="text-sm text-slate-500">
                {description}
              </p>
            </div>
            {badge}
          </div>
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      </div>
    </div>
  );
};

// 10. QuickStatsGrid Component
interface QuickStatsGridProps {
  stats: Array<{
    label: string;
    value: string;
    icon: any;
    color: 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'slate';
  }>;
}

export const QuickStatsGrid = ({ stats }: QuickStatsGridProps) => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat, idx) => (
        <StatCard key={idx} {...stat} />
      ))}
    </div>
  );
};

// 11. SectionHeader Component
interface SectionHeaderProps {
  title: string;
  description: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
}

export const SectionHeader = ({ title, description, badge, action }: SectionHeaderProps) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-1">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>
        {badge}
      </div>
      {action}
    </div>
  );
};
