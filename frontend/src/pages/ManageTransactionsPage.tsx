import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  DollarSign, Download, Settings, RefreshCw, Search, Filter, X,
  ChevronDown, ChevronRight, Eye, RotateCcw, Edit3, CheckCircle2,
  XCircle, Clock, AlertTriangle, Copy, ExternalLink, User,
  Calendar, CreditCard, FileText, TrendingUp, TrendingDown,
  AlertCircle, Shield, Activity
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';

interface ManageTransactionsPageProps {
  transactionId?: string;
  onBack?: () => void;
}

interface Transaction {
  id: string;
  transactionId: string;
  dateTime: string;
  personName: string;
  personId: string;
  sourceModule: 'Events' | 'Awards' | 'Memberships' | 'Sponsorships';
  relatedEntity: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: 'paid' | 'failed' | 'pending' | 'refunded' | 'partial-refund';
  gatewayReference: string;
  invoiceId: string;
  isManual: boolean;
  riskFlag?: 'duplicate' | 'chargeback' | 'high-value' | 'failed-retry';
}

const transactions: Transaction[] = [
  {
    id: 'TXN001',
    transactionId: 'TXN-2024-120245',
    dateTime: '2024-12-20 14:32:15',
    personName: 'Sarah Johnson',
    personId: 'P-12345',
    sourceModule: 'Events',
    relatedEntity: 'Innovation Summit 2024',
    amount: 299.00,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    status: 'paid',
    gatewayReference: 'pi_3MtwBwLkdIwHu7ix2ixqw4vZ',
    invoiceId: 'INV-2024-5678',
    isManual: false
  },
  {
    id: 'TXN002',
    transactionId: 'TXN-2024-120244',
    dateTime: '2024-12-20 13:45:22',
    personName: 'Michael Chen',
    personId: 'P-12346',
    sourceModule: 'Awards',
    relatedEntity: 'Young Innovator Award 2024',
    amount: 50.00,
    currency: 'USD',
    paymentMethod: 'PayPal',
    status: 'paid',
    gatewayReference: 'PAYID-M3XYA6A1234567890',
    invoiceId: 'INV-2024-5679',
    isManual: false
  },
  {
    id: 'TXN003',
    transactionId: 'TXN-2024-120243',
    dateTime: '2024-12-20 12:18:45',
    personName: 'Dr. Emma Wilson',
    personId: 'P-12347',
    sourceModule: 'Events',
    relatedEntity: 'Tech Conference 2024',
    amount: 450.00,
    currency: 'EUR',
    paymentMethod: 'Credit Card',
    status: 'refunded',
    gatewayReference: 'pi_3MtwBwLkdIwHu7ix2ixqw4vX',
    invoiceId: 'INV-2024-5680',
    isManual: false,
    riskFlag: 'duplicate'
  },
  {
    id: 'TXN004',
    transactionId: 'TXN-2024-120242',
    dateTime: '2024-12-20 11:05:12',
    personName: 'James Rodriguez',
    personId: 'P-12348',
    sourceModule: 'Memberships',
    relatedEntity: 'Annual Professional Membership',
    amount: 199.00,
    currency: 'USD',
    paymentMethod: 'Bank Transfer',
    status: 'pending',
    gatewayReference: 'N/A',
    invoiceId: 'INV-2024-5681',
    isManual: true
  },
  {
    id: 'TXN005',
    transactionId: 'TXN-2024-120241',
    dateTime: '2024-12-20 10:22:38',
    personName: 'Lisa Anderson',
    personId: 'P-12349',
    sourceModule: 'Events',
    relatedEntity: 'Innovation Summit 2024',
    amount: 299.00,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    status: 'failed',
    gatewayReference: 'pi_3MtwBwLkdIwHu7ix2ixqw4vY',
    invoiceId: 'INV-2024-5682',
    isManual: false,
    riskFlag: 'failed-retry'
  },
  {
    id: 'TXN006',
    transactionId: 'TXN-2024-120240',
    dateTime: '2024-12-20 09:15:20',
    personName: 'David Park',
    personId: 'P-12350',
    sourceModule: 'Sponsorships',
    relatedEntity: 'Platinum Event Sponsorship',
    amount: 5000.00,
    currency: 'USD',
    paymentMethod: 'Wire Transfer',
    status: 'paid',
    gatewayReference: 'WIRE-20241220-001',
    invoiceId: 'INV-2024-5683',
    isManual: true,
    riskFlag: 'high-value'
  }
];

const StatusBadge = ({ status, compact = false }: { status: string; compact?: boolean }) => {
  const statusColors: any = {
    paid: 'bg-green-50 text-green-700 border-green-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    refunded: 'bg-blue-50 text-blue-700 border-blue-200',
    'partial-refund': 'bg-purple-50 text-purple-700 border-purple-200'
  };

  const statusIcons: any = {
    paid: CheckCircle2,
    failed: XCircle,
    pending: Clock,
    refunded: RotateCcw,
    'partial-refund': RotateCcw
  };

  const StatusIcon = statusIcons[status];

  return (
    <Badge variant="outline" className={`${statusColors[status]} text-xs flex items-center gap-1 w-fit`}>
      <StatusIcon size={compact ? 10 : 12} />
      {status.replace('-', ' ')}
    </Badge>
  );
};

const RiskBadge = ({ type }: { type: string }) => {
  const configs: any = {
    duplicate: { label: 'Duplicate', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    chargeback: { label: 'Chargeback', color: 'bg-red-50 text-red-700 border-red-200' },
    'high-value': { label: 'High Value', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    'failed-retry': { label: 'Failed Retry', color: 'bg-orange-50 text-orange-700 border-orange-200' }
  };

  const config = configs[type];

  return (
    <Badge variant="outline" className={`${config.color} text-xs flex items-center gap-1`}>
      <AlertTriangle size={10} />
      {config.label}
    </Badge>
  );
};

const SummaryCard = ({ label, value, currency, trend, percentage, icon: Icon, color }: any) => {
  const colors: any = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  const iconColors: any = {
    green: 'text-green-600',
    red: 'text-red-600',
    amber: 'text-amber-600',
    slate: 'text-slate-600'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs sm:text-sm text-slate-600">{label}</span>
        <div className={`p-2 rounded-lg ${colors[color]}`}>
          <Icon size={16} className={iconColors[color]} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-lg sm:text-2xl font-semibold text-slate-900">
            {currency} {value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {percentage && (
            <div className={`text-xs mt-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {percentage} vs last period
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RiskIndicator = ({ label, count, severity }: any) => {
  const colors: any = {
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
    success: 'text-green-600'
  };

  const bgColors: any = {
    error: 'bg-red-50',
    warning: 'bg-amber-50',
    info: 'bg-blue-50',
    success: 'bg-green-50'
  };

  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-slate-50">
      <span className="text-xs sm:text-sm text-slate-700">{label}</span>
      <div className={`px-2 py-1 rounded text-xs font-medium ${bgColors[severity]} ${colors[severity]}`}>
        {count}
      </div>
    </div>
  );
};

const TransactionDetailDrawer = ({ transaction, onClose, onRefund }: any) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end">
      <div className="bg-white w-full sm:w-[600px] h-full shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">Transaction Details</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs sm:text-sm font-mono text-slate-600">{transaction.transactionId}</code>
            <Button variant="ghost" size="sm">
              <Copy size={14} />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none px-4 sm:px-6">
              <TabsTrigger value="summary" className="text-xs sm:text-sm">Summary</TabsTrigger>
              <TabsTrigger value="linked" className="text-xs sm:text-sm">Linked</TabsTrigger>
              <TabsTrigger value="payment" className="text-xs sm:text-sm">Payment</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs sm:text-sm">Audit</TabsTrigger>
            </TabsList>

            <div className="p-4 sm:p-6">
              <TabsContent value="summary" className="mt-0">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-slate-900 mb-3 text-sm">Amount Breakdown</h3>
                    <div className="space-y-2 bg-slate-50 p-4 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal</span>
                        <span className="font-medium text-slate-900">
                          {transaction.currency} {transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Processing Fee</span>
                        <span className="font-medium text-slate-900">
                          {transaction.currency} {(transaction.amount * 0.029).toFixed(2)}
                        </span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">Total</span>
                        <span className="font-semibold text-slate-900">
                          {transaction.currency} {(transaction.amount * 1.029).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="linked" className="mt-0">
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <User size={16} className="text-slate-500" />
                      <span className="text-xs font-medium text-slate-600">Person</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900">{transaction.personName}</div>
                    <div className="text-xs text-slate-500">{transaction.personId}</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar size={16} className="text-slate-500" />
                      <span className="text-xs font-medium text-slate-600">{transaction.sourceModule}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900">{transaction.relatedEntity}</div>
                    <div className="text-xs text-slate-500">EVT-2024-001</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="mt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Payment Method</span>
                    <span className="font-medium text-slate-900">{transaction.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Gateway</span>
                    <code className="text-xs font-mono text-slate-900">{transaction.gatewayReference}</code>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Currency</span>
                    <span className="font-medium text-slate-900">{transaction.currency}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audit" className="mt-0">
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">Transaction Created</span>
                      <span className="text-xs text-slate-500">{transaction.dateTime}</span>
                    </div>
                    <div className="text-xs text-slate-600">By System</div>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-900">Payment Processed</span>
                      <span className="text-xs text-slate-500">{transaction.dateTime}</span>
                    </div>
                    <div className="text-xs text-slate-600">By Gateway</div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

const RefundDialog = ({ open, onOpenChange, transaction }: any) => {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            Process a full or partial refund for this transaction
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex justify-between mb-2 text-sm">
              <span className="text-slate-600">Transaction ID</span>
              <code className="font-mono text-slate-900">{transaction.transactionId}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Amount</span>
              <span className="font-semibold text-slate-900">
                {transaction.currency} {transaction.amount.toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2">Refund Type</Label>
            <Select defaultValue="full">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Refund</SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-sm text-amber-800">
                Refunds take 5-10 business days. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            toast.success('Refund processed successfully');
            onOpenChange(false);
          }}>
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const ReconcileDialog = ({ open, onOpenChange }: any) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Reconcile Transactions</DialogTitle>
          <DialogDescription>
            Match platform transactions with bank statements
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label className="text-sm font-medium text-slate-700 mb-2">Period</Label>
            <Select defaultValue="current-month">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current-month">Current Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2 text-sm">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-800">Platform</span>
                <span className="font-medium text-blue-900">$12,450.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-800">Gateway</span>
                <span className="font-medium text-blue-900">$12,450.00</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between">
                <span className="font-semibold text-blue-900">Difference</span>
                <span className="font-semibold text-green-600">$0.00</span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => {
            toast.success('Reconciliation completed');
            onOpenChange(false);
          }}>
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const TransactionCard = ({ transaction, isExpanded, onToggle, onView, onRefund }: any) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
      {/* Collapsed View */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
            <User size={18} className="text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-slate-900 truncate">{transaction.personName}</div>
            <div className="text-xs text-slate-500">{transaction.personId}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="font-semibold text-slate-900">
              {transaction.currency} {transaction.amount.toFixed(2)}
            </div>
            <StatusBadge status={transaction.status} compact />
          </div>
          <ChevronDown
            size={20}
            className={`text-slate-400 transition-transform shrink-0 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>

      {/* Expanded View */}
      <div
        className={`overflow-hidden transition-all duration-200 ${
          isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 pt-2 space-y-3 border-t border-slate-100">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-slate-500 mb-1">Transaction ID</div>
              <code className="text-xs font-mono text-slate-900">{transaction.transactionId}</code>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Date</div>
              <div className="text-xs text-slate-900">{transaction.dateTime.split(' ')[0]}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Source</div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {transaction.sourceModule}
              </Badge>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Method</div>
              <div className="text-xs text-slate-900">{transaction.paymentMethod}</div>
            </div>
          </div>
          {transaction.riskFlag && (
            <div className="pt-2">
              <RiskBadge type={transaction.riskFlag} />
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={onView}
            >
              <Eye size={14} className="mr-1" />
              View
            </Button>
            {transaction.status === 'paid' && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onRefund}
              >
                <RotateCcw size={14} className="mr-1" />
                Refund
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export function ManageTransactionsPage({ transactionId, onBack }: ManageTransactionsPageProps) {
  const [searchParams] = useSearchParams();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [showReconcileDialog, setShowReconcileDialog] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Filter states
  const [dateRange, setDateRange] = useState('30d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [currencyFilter, setCurrencyFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-open transaction detail drawer if transaction ID is in URL
  useEffect(() => {
    const txnId = searchParams.get('id');
    if (txnId) {
      const transaction = transactions.find(t => t.id === txnId);
      if (transaction) {
        setSelectedTransaction(transaction);
      }
    }
  }, [searchParams]);

  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const handleExport = () => {
    toast.success('Export started');
  };

  const handleReconcile = () => {
    setShowReconcileDialog(true);
  };

  // Calculate summary values
  const totalCollected = transactions
    .filter(t => t.status === 'paid')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount : 0), 0);

  const totalRefunded = transactions
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount : 0), 0);

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount : 0), 0);

  const failedPayments = transactions
    .filter(t => t.status === 'failed')
    .reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount : 0), 0);

  // Risk counts
  const duplicateCount = transactions.filter(t => t.riskFlag === 'duplicate').length;
  const failedRetryCount = transactions.filter(t => t.riskFlag === 'failed-retry').length;
  const highValueCount = transactions.filter(t => t.riskFlag === 'high-value').length;
  const chargebackCount = transactions.filter(t => t.riskFlag === 'chargeback').length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-2">
                Manage Transactions
              </h1>
              <p className="text-sm text-slate-600">
                Centralized payment, refund, and financial activity across events, awards, and programs
              </p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Button className="bg-[#0e042f] hover:bg-[#1d293d] text-white rounded-xl gap-2 text-sm" size="sm" onClick={handleExport}>
                <Download size={16} />
                <span className="hidden sm:inline">Export</span>
              </Button>
              <Button variant="outline" className="gap-2 text-sm" size="sm" onClick={handleReconcile}>
                <RefreshCw size={16} />
                <span className="hidden sm:inline">Reconcile</span>
              </Button>
              <Button variant="outline" className="gap-2 text-sm" size="sm">
                <Settings size={16} />
                <span className="hidden sm:inline">Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
          {/* Main Content Area - 9 columns */}
          <div className="xl:col-span-9">
            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-lg mb-4 sm:mb-6">
              <div className="p-3 sm:p-4 border-b border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-slate-900 text-sm sm:text-base">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter size={16} />
                    {showFilters ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {showFilters && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Date Range */}
                    <div>
                      <Label className="text-xs text-slate-600 mb-1">Date Range</Label>
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="today">Today</SelectItem>
                          <SelectItem value="7d">Last 7 days</SelectItem>
                          <SelectItem value="30d">Last 30 days</SelectItem>
                          <SelectItem value="90d">Last 90 days</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Status */}
                    <div>
                      <Label className="text-xs text-slate-600 mb-1">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="failed">Failed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="refunded">Refunded</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Source */}
                    <div>
                      <Label className="text-xs text-slate-600 mb-1">Source</Label>
                      <Select value={moduleFilter} onValueChange={setModuleFilter}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modules</SelectItem>
                          <SelectItem value="events">Events</SelectItem>
                          <SelectItem value="awards">Awards</SelectItem>
                          <SelectItem value="memberships">Memberships</SelectItem>
                          <SelectItem value="sponsorships">Sponsorships</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Currency */}
                    <div>
                      <Label className="text-xs text-slate-600 mb-1">Currency</Label>
                      <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                          <SelectItem value="eur">EUR</SelectItem>
                          <SelectItem value="gbp">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>

              {/* Search */}
              <div className="p-3 sm:p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <Input
                    placeholder="Search by Transaction ID, Person, Invoice..."
                    className="pl-10 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden xl:block bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="w-12 px-4 py-3"></th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Person
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Source
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-right px-4 py-3 text-xs font-medium text-slate-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {transactions.map((transaction) => {
                      const isExpanded = expandedCards.has(transaction.id);
                      return (
                        <React.Fragment key={transaction.id}>
                          {/* Main Row */}
                          <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleCard(transaction.id)}
                                className="text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                <ChevronRight
                                  size={18}
                                  className={`transition-transform duration-200 ${
                                    isExpanded ? 'rotate-90' : ''
                                  }`}
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                                  <User size={16} className="text-slate-500" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-slate-900">{transaction.personName}</div>
                                  <div className="text-xs text-slate-500">{transaction.personId}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                {transaction.sourceModule}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-slate-900">
                                {transaction.currency} {transaction.amount.toFixed(2)}
                              </div>
                              <div className="text-xs text-slate-500">{transaction.paymentMethod}</div>
                            </td>
                            <td className="px-4 py-3">
                              <StatusBadge status={transaction.status} />
                              {transaction.riskFlag && (
                                <div className="mt-1">
                                  <RiskBadge type={transaction.riskFlag} />
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCard(transaction.id)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                {isExpanded ? 'Collapse' : 'Expand'}
                                <ChevronDown
                                  size={14}
                                  className={`ml-1 transition-transform duration-200 ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </Button>
                            </td>
                          </tr>

                          {/* Expanded Details Row */}
                          <tr className={`border-b border-slate-200 transition-all duration-200 ${
                            isExpanded ? '' : 'hidden'
                          }`}>
                            <td colSpan={6} className="px-4 py-0">
                              <div
                                className={`overflow-hidden transition-all duration-200 ${
                                  isExpanded ? 'max-h-[400px] py-4' : 'max-h-0'
                                }`}
                              >
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                  <div className="grid grid-cols-3 gap-6">
                                    {/* Left Column */}
                                    <div className="space-y-3">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Transaction ID</div>
                                        <code className="text-sm font-mono text-slate-900">{transaction.transactionId}</code>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Date & Time</div>
                                        <div className="text-sm text-slate-900">{transaction.dateTime.split(' ')[0]}</div>
                                        <div className="text-xs text-slate-500">{transaction.dateTime.split(' ')[1]}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Invoice ID</div>
                                        <code className="text-sm font-mono text-slate-900">{transaction.invoiceId}</code>
                                      </div>
                                    </div>

                                    {/* Middle Column */}
                                    <div className="space-y-3">
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Payment Method</div>
                                        <div className="text-sm text-slate-900">{transaction.paymentMethod}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Gateway Reference</div>
                                        <code className="text-xs font-mono text-slate-900 break-all">
                                          {transaction.gatewayReference}
                                        </code>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 mb-1">Related Entity</div>
                                        <div className="text-sm text-slate-900">{transaction.relatedEntity}</div>
                                      </div>
                                    </div>

                                    {/* Right Column - Actions */}
                                    <div className="space-y-2">
                                      <div className="text-xs text-slate-500 mb-2">Actions</div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full gap-2"
                                        onClick={() => setSelectedTransaction(transaction)}
                                      >
                                        <Eye size={14} />
                                        View Details
                                      </Button>
                                      {transaction.status === 'paid' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full gap-2"
                                          onClick={() => {
                                            setSelectedTransaction(transaction);
                                            setShowRefundDialog(true);
                                          }}
                                        >
                                          <RotateCcw size={14} />
                                          Refund
                                        </Button>
                                      )}
                                      {transaction.status === 'failed' && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="w-full gap-2"
                                        >
                                          <RefreshCw size={14} />
                                          Retry Payment
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Showing <span className="font-medium">1-6</span> of <span className="font-medium">142</span> transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">Previous</Button>
                  <Button variant="outline" size="sm">Next</Button>
                </div>
              </div>
            </div>

            {/* Mobile/Tablet Cards */}
            <div className="xl:hidden space-y-3">
              {transactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                  isExpanded={expandedCards.has(transaction.id)}
                  onToggle={() => toggleCard(transaction.id)}
                  onView={() => setSelectedTransaction(transaction)}
                  onRefund={() => {
                    setSelectedTransaction(transaction);
                    setShowRefundDialog(true);
                  }}
                />
              ))}
            </div>
          </div>

          {/* Finance Summary Sidebar - 3 columns */}
          <div className="xl:col-span-3">
            <div className="sticky top-6 space-y-4">
              {/* Summary Cards */}
              <SummaryCard
                label="Total Collected"
                value={totalCollected}
                currency="USD"
                trend="up"
                percentage="+12.5%"
                icon={TrendingUp}
                color="green"
              />
              <SummaryCard
                label="Total Refunded"
                value={totalRefunded}
                currency="USD"
                trend="down"
                percentage="-8.2%"
                icon={TrendingDown}
                color="red"
              />
              <SummaryCard
                label="Pending Amount"
                value={pendingAmount}
                currency="USD"
                icon={Clock}
                color="amber"
              />
              <SummaryCard
                label="Failed Payments"
                value={failedPayments}
                currency="USD"
                icon={XCircle}
                color="slate"
              />

              {/* Risk & Exceptions */}
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <h3 className="font-medium text-slate-900 mb-3 text-sm">Risk & Exceptions</h3>
                <div className="space-y-2">
                  <RiskIndicator label="Duplicate Payments" count={duplicateCount} severity="warning" />
                  <RiskIndicator label="Failed Retries" count={failedRetryCount} severity="error" />
                  <RiskIndicator label="High-Value Transactions" count={highValueCount} severity="info" />
                  <RiskIndicator label="Chargebacks" count={chargebackCount} severity="success" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Drawer */}
      {selectedTransaction && !showRefundDialog && (
        <TransactionDetailDrawer
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onRefund={() => {
            setShowRefundDialog(true);
          }}
        />
      )}

      {/* Refund Dialog */}
      <RefundDialog
        open={showRefundDialog}
        onOpenChange={setShowRefundDialog}
        transaction={selectedTransaction}
      />

      {/* Reconcile Dialog */}
      <ReconcileDialog
        open={showReconcileDialog}
        onOpenChange={setShowReconcileDialog}
      />
    </div>
  );
}