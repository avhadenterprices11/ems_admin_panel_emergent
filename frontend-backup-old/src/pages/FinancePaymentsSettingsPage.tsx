import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, DollarSign, Globe, Settings, Receipt, FileText, RefreshCw,
  AlertTriangle, Shield, Activity, Database, Plus, Save, Edit, ChevronRight,
  ChevronDown, CheckCircle2, XCircle, Zap
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { cn } from '../components/ui/utils';

type SectionType = 
  | 'payment-providers' 
  | 'payment-methods' 
  | 'checkout-rules'
  | 'currency-fx'
  | 'pricing-fees'
  | 'discount-rules'
  | 'tax-config'
  | 'tax-exemptions'
  | 'invoice-tax'
  | 'payout-accounts'
  | 'settlement-rules'
  | 'fee-allocation'
  | 'invoice-settings'
  | 'receipt-settings'
  | 'numbering-templates'
  | 'refund-policy'
  | 'chargebacks'
  | 'partial-refunds'
  | 'reconciliation'
  | 'accounting-integrations'
  | 'exports-reports'
  | 'fraud-risk'
  | 'audit-logs'
  | 'data-retention';

interface PaymentProvider {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error';
  mode: 'test' | 'live';
  isDefault: boolean;
  lastUsed: string;
}

interface TaxRate {
  id: string;
  country: string;
  region: string;
  rate: number;
  description: string;
  status: 'active' | 'inactive';
}

export const FinancePaymentsSettingsPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionType>('payment-providers');
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['payment', 'pricing', 'taxes', 'payouts', 'invoices', 'refunds', 'reconciliation', 'advanced'])
  );

  const [settings, setSettings] = useState({
    // Payment Methods
    cardEnabled: true,
    upiEnabled: true,
    netBankingEnabled: true,
    walletsEnabled: true,
    bankTransferEnabled: false,
    payLaterEnabled: false,
    onAccountEnabled: true,

    // Currency
    defaultCurrency: 'GBP',
    multiCurrencyEnabled: true,
    fxSource: 'provider',
    roundingRule: '0.01',
    lockFxAtPurchase: true,

    // Tax
    taxMode: 'inclusive',
    taxOnFees: true,
    showVatBreakdown: true,
    showCompanyVat: true,

    // Invoices
    invoicesEnabled: true,
    invoiceRecipient: 'attendee',
    invoiceDelivery: 'email',
    generateOn: 'payment-success'
  });

  const [providers] = useState<PaymentProvider[]>([
    { id: 'P001', name: 'Stripe', status: 'active', mode: 'live', isDefault: true, lastUsed: '2024-12-20 10:15' },
    { id: 'P002', name: 'Razorpay', status: 'active', mode: 'live', isDefault: false, lastUsed: '2024-12-19 14:30' },
    { id: 'P003', name: 'PayPal', status: 'inactive', mode: 'test', isDefault: false, lastUsed: '2024-11-15 09:22' }
  ]);

  const [taxRates] = useState<TaxRate[]>([
    { id: 'T001', country: 'United Kingdom', region: 'England', rate: 20, description: 'Standard VAT', status: 'active' },
    { id: 'T002', country: 'India', region: 'All', rate: 18, description: 'GST', status: 'active' },
    { id: 'T003', country: 'United States', region: 'California', rate: 7.25, description: 'Sales Tax', status: 'active' }
  ]);

  const menuStructure = [
    {
      id: 'payment',
      category: 'Payment Setup',
      items: [
        { id: 'payment-providers' as SectionType, label: 'Payment Providers', status: 'configured' },
        { id: 'payment-methods' as SectionType, label: 'Payment Methods', status: 'configured' },
        { id: 'checkout-rules' as SectionType, label: 'Checkout Payment Rules', status: 'not-set' }
      ]
    },
    {
      id: 'pricing',
      category: 'Pricing & Currency',
      items: [
        { id: 'currency-fx' as SectionType, label: 'Default Currency & FX Rules', status: 'configured' },
        { id: 'pricing-fees' as SectionType, label: 'Pricing Rules & Fees', status: 'configured' },
        { id: 'discount-rules' as SectionType, label: 'Discount & Promotion Rules', status: 'not-set' }
      ]
    },
    {
      id: 'taxes',
      category: 'Taxes & Compliance',
      items: [
        { id: 'tax-config' as SectionType, label: 'Tax Configuration (VAT/GST)', status: 'attention' },
        { id: 'tax-exemptions' as SectionType, label: 'Tax Exemptions & Reverse Charge', status: 'not-set' },
        { id: 'invoice-tax' as SectionType, label: 'Invoice Tax Display Rules', status: 'configured' }
      ]
    },
    {
      id: 'payouts',
      category: 'Payouts & Settlements',
      items: [
        { id: 'payout-accounts' as SectionType, label: 'Payout Accounts', status: 'configured' },
        { id: 'settlement-rules' as SectionType, label: 'Settlement Rules', status: 'configured' },
        { id: 'fee-allocation' as SectionType, label: 'Fee Allocation', status: 'configured' }
      ]
    },
    {
      id: 'invoices',
      category: 'Invoices & Receipts',
      items: [
        { id: 'invoice-settings' as SectionType, label: 'Invoice Settings', status: 'configured' },
        { id: 'receipt-settings' as SectionType, label: 'Receipt Settings', status: 'configured' },
        { id: 'numbering-templates' as SectionType, label: 'Numbering & Templates', status: 'configured' }
      ]
    },
    {
      id: 'refunds',
      category: 'Refunds & Disputes',
      items: [
        { id: 'refund-policy' as SectionType, label: 'Refund Policy Controls', status: 'configured' },
        { id: 'chargebacks' as SectionType, label: 'Chargebacks & Disputes', status: 'not-set' },
        { id: 'partial-refunds' as SectionType, label: 'Partial Refund Rules', status: 'configured' }
      ]
    },
    {
      id: 'reconciliation',
      category: 'Reconciliation & Accounting',
      items: [
        { id: 'reconciliation' as SectionType, label: 'Reconciliation', status: 'configured' },
        { id: 'accounting-integrations' as SectionType, label: 'Accounting Integrations', status: 'not-set' },
        { id: 'exports-reports' as SectionType, label: 'Export & Reports', status: 'configured' }
      ]
    },
    {
      id: 'advanced',
      category: 'Advanced',
      items: [
        { id: 'fraud-risk' as SectionType, label: 'Fraud & Risk for Payments', status: 'configured' },
        { id: 'audit-logs' as SectionType, label: 'Audit & Finance Logs', status: 'configured' },
        { id: 'data-retention' as SectionType, label: 'Data Retention (Finance)', status: 'configured' }
      ]
    }
  ];

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
    }, 1000);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'configured':
        return <CheckCircle2 size={12} className="text-green-600" />;
      case 'attention':
        return <AlertTriangle size={12} className="text-orange-600" />;
      case 'not-set':
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-8 py-5">
          <div className="flex items-center gap-2 mb-3 text-sm">
            <button
              onClick={() => navigate('/settings')}
              className="text-slate-600 hover:text-slate-900 transition-colors"
            >
              Settings
            </button>
            <span className="text-slate-400">→</span>
            <span className="text-slate-900 font-medium">Finance & Payments</span>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                Finance & Payments
              </h1>
              <p className="text-sm text-slate-500">
                Configure payment providers, tax rates, invoices, refunds, and financial integrations
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 size={12} className="mr-1" />
                Configured
              </Badge>
              {hasChanges && (
                <Button variant="ghost" onClick={() => setHasChanges(false)} className="gap-2">
                  <RefreshCw size={16} />
                  Reset
                </Button>
              )}
              <Button onClick={handleSave} disabled={!hasChanges || isSaving} className="gap-2">
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Container */}
      <div className="flex max-w-[1600px] mx-auto">
        {/* Left Sidebar */}
        <div className="w-80 bg-white border-r border-slate-200 min-h-[calc(100vh-137px)] sticky top-[137px] overflow-y-auto">
          <div className="p-4">
            {menuStructure.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              return (
                <div key={category.id} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-600 uppercase hover:bg-slate-50 rounded transition-colors"
                  >
                    <span>{category.category}</span>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  {isExpanded && (
                    <div className="mt-1 space-y-1">
                      {category.items.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveSection(item.id)}
                            className={cn(
                              "w-full flex items-center justify-between px-3 py-2 rounded text-sm transition-colors",
                              isActive
                                ? "bg-slate-900 text-white"
                                : "text-slate-700 hover:bg-slate-100"
                            )}
                          >
                            <span>{item.label}</span>
                            {getStatusBadge(item.status)}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Payment Providers */}
          {activeSection === 'payment-providers' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Payment Providers</h2>
                  <p className="text-sm text-slate-500">Manage payment gateway integrations</p>
                </div>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Provider
                </Button>
              </div>

              {/* Providers Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Mode</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Is Default</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Last Used</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {providers.map((provider) => (
                      <tr key={provider.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900">{provider.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            provider.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                            provider.status === 'error' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }>
                            {provider.status === 'active' && <CheckCircle2 size={10} className="mr-1" />}
                            {provider.status === 'error' && <XCircle size={10} className="mr-1" />}
                            {provider.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className={
                            provider.mode === 'live'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }>
                            {provider.mode.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {provider.isDefault && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              ⭐ Default
                            </Badge>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{provider.lastUsed}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Settings size={14} className="mr-1" />
                              Configure
                            </Button>
                            {!provider.isDefault && (
                              <Button variant="ghost" size="sm" className="h-8">
                                Set as Default
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          {activeSection === 'payment-methods' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-1">Payment Methods</h2>
                <p className="text-sm text-slate-500">Enable or disable payment methods for your events</p>
              </div>

              <div className="space-y-3">
                <SwitchField
                  label="Card Payments Enabled"
                  description="Accept credit and debit card payments"
                  checked={settings.cardEnabled}
                  onCheckedChange={(val) => handleSettingChange('cardEnabled', val)}
                  badge={<Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">Primary</Badge>}
                />
                <SwitchField
                  label="UPI Enabled"
                  description="Accept UPI payments (India)"
                  checked={settings.upiEnabled}
                  onCheckedChange={(val) => handleSettingChange('upiEnabled', val)}
                />
                <SwitchField
                  label="Net Banking Enabled"
                  description="Accept direct bank transfers"
                  checked={settings.netBankingEnabled}
                  onCheckedChange={(val) => handleSettingChange('netBankingEnabled', val)}
                />
                <SwitchField
                  label="Digital Wallets Enabled"
                  description="Accept payments via digital wallets"
                  checked={settings.walletsEnabled}
                  onCheckedChange={(val) => handleSettingChange('walletsEnabled', val)}
                />
                <SwitchField
                  label="Bank Transfer Enabled"
                  description="Accept manual bank transfers"
                  checked={settings.bankTransferEnabled}
                  onCheckedChange={(val) => handleSettingChange('bankTransferEnabled', val)}
                />
                <SwitchField
                  label="Pay Later Enabled"
                  description="Allow deferred payment options"
                  checked={settings.payLaterEnabled}
                  onCheckedChange={(val) => handleSettingChange('payLaterEnabled', val)}
                  badge={<Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 text-xs">Beta</Badge>}
                />
                <SwitchField
                  label="On Account Enabled"
                  description="Allow payment against account credit"
                  checked={settings.onAccountEnabled}
                  onCheckedChange={(val) => handleSettingChange('onAccountEnabled', val)}
                />
              </div>
            </div>
          )}

          {/* Tax Configuration */}
          {activeSection === 'tax-config' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 mb-1">Tax Configuration (VAT/GST)</h2>
                  <p className="text-sm text-slate-500">Configure tax rates and calculation rules</p>
                </div>
                <Button className="gap-2">
                  <Plus size={16} />
                  Add Tax Rate
                </Button>
              </div>

              {/* Tax Rates Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Country</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Region</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Description</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {taxRates.map((rate) => (
                      <tr key={rate.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Globe size={14} className="text-slate-400" />
                            <span className="font-medium text-slate-900">{rate.country}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{rate.region}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {rate.rate}%
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-slate-600">{rate.description}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline" className={
                            rate.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }>
                            {rate.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8">
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Separator />

              {/* Tax Configuration */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Tax Calculation Rules</h3>
                <div className="space-y-4">
                  <FormField label="Tax Mode">
                    <Select value={settings.taxMode} onValueChange={(val) => handleSettingChange('taxMode', val)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inclusive">Inclusive (price includes tax)</SelectItem>
                        <SelectItem value="exclusive">Exclusive (tax added to price)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <div className="space-y-3">
                    <SwitchField
                      label="Apply Tax on Fees"
                      description="Apply tax to processing fees and service charges"
                      checked={settings.taxOnFees}
                      onCheckedChange={(val) => handleSettingChange('taxOnFees', val)}
                    />
                    <SwitchField
                      label="Show VAT Breakdown"
                      description="Display detailed tax breakdown on invoices"
                      checked={settings.showVatBreakdown}
                      onCheckedChange={(val) => handleSettingChange('showVatBreakdown', val)}
                    />
                    <SwitchField
                      label="Show Company VAT Number"
                      description="Include organization VAT number on invoices"
                      checked={settings.showCompanyVat}
                      onCheckedChange={(val) => handleSettingChange('showCompanyVat', val)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections placeholder */}
          {(activeSection !== 'payment-providers' && activeSection !== 'payment-methods' && activeSection !== 'tax-config') && (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-lg">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Settings className="text-slate-400" size={28} />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {menuStructure.flatMap(cat => cat.items).find(item => item.id === activeSection)?.label}
              </h3>
              <p className="text-sm text-slate-500">
                Configuration options for this section will be displayed here
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Reusable Components
const FormField = ({ label, required, children }: any) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
    </div>
  );
};

const SwitchField = ({ label, description, checked, onCheckedChange, badge }: any) => {
  return (
    <div className="flex items-start justify-between py-2">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Label className="text-sm font-medium text-slate-700">{label}</Label>
          {badge}
        </div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};
