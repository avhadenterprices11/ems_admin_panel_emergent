import React, { useState, useEffect } from 'react';
import { 
  Save, 
  CreditCard,
  Receipt,
  Building2,
  Loader2,
  DollarSign,
  Percent
} from 'lucide-react';
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Separator } from "../../ui/separator";
import { Textarea } from "../../ui/textarea";
import { Switch } from "../../ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { toast } from 'sonner';
import { eventsAPI, PaymentTaxSettings } from '../../../api/events.api';

interface SettingsPaymentProps {
  eventId: number | string;
}

const CURRENCIES = [
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { value: 'SGD', label: 'SGD - Singapore Dollar', symbol: 'S$' },
  { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { value: 'CHF', label: 'CHF - Swiss Franc', symbol: 'CHF' },
  { value: 'AED', label: 'AED - UAE Dirham', symbol: 'د.إ' },
];

export const SettingsPayment = ({ eventId }: SettingsPaymentProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [currency, setCurrency] = useState('USD');
  const [stripeEnabled, setStripeEnabled] = useState(true);
  const [razorpayEnabled, setRazorpayEnabled] = useState(false);
  const [offlineEnabled, setOfflineEnabled] = useState(true);
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxName, setTaxName] = useState('VAT');
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [legalEntityName, setLegalEntityName] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  
  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const settings = await eventsAPI.getPaymentTaxSettings(eventId);
        setCurrency(settings.currency || 'USD');
        setStripeEnabled(settings.stripe_enabled ?? true);
        setRazorpayEnabled(settings.razorpay_enabled ?? false);
        setOfflineEnabled(settings.offline_enabled ?? true);
        setTaxEnabled(settings.tax_enabled ?? false);
        setTaxName(settings.tax_name || 'VAT');
        setTaxPercentage(settings.tax_percentage ?? 0);
        setLegalEntityName(settings.legal_entity_name || '');
        setBillingAddress(settings.billing_address || '');
        setTaxId(settings.tax_id || '');
      } catch (error) {
        console.error('Failed to load payment/tax settings:', error);
        toast.error('Failed to load payment settings');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      loadSettings();
    }
  }, [eventId]);

  // Save settings
  const handleSave = async () => {
    // Validate tax percentage
    if (taxEnabled && (taxPercentage < 0 || taxPercentage > 100)) {
      toast.error('Tax percentage must be between 0 and 100');
      return;
    }

    try {
      setSaving(true);
      await eventsAPI.updatePaymentTaxSettings(eventId, {
        currency,
        stripe_enabled: stripeEnabled,
        razorpay_enabled: razorpayEnabled,
        offline_enabled: offlineEnabled,
        tax_enabled: taxEnabled,
        tax_name: taxName,
        tax_percentage: taxPercentage,
        legal_entity_name: legalEntityName || null,
        billing_address: billingAddress || null,
        tax_id: taxId || null,
      });
      toast.success('Payment & Tax settings saved successfully');
    } catch (error: any) {
      console.error('Failed to save payment/tax settings:', error);
      toast.error(error.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-[#1d293d]">Payment & Tax</h3>
        <Button 
          className="bg-[#0f172b]" 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 size={16} className="mr-2 animate-spin" />
          ) : (
            <Save size={16} className="mr-2" />
          )}
          Save Changes
        </Button>
      </div>
      <Separator />
      
      <div className="space-y-8">
        {/* Currency Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="text-slate-400" size={20} />
            <h4 className="font-semibold text-slate-800">Currency</h4>
          </div>
          <div className="max-w-xs">
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger data-testid="currency-select">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.value} value={c.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 w-6">{c.symbol}</span>
                      <span>{c.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Currency for ticket prices and payments
            </p>
          </div>
        </div>

        <Separator />

        {/* Payment Methods Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="text-slate-400" size={20} />
            <h4 className="font-semibold text-slate-800">Payment Methods</h4>
          </div>
          <p className="text-sm text-slate-500">
            Enable or disable payment methods for this event
          </p>
          
          <div className="space-y-4">
            {/* Stripe */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#635bff] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Stripe</p>
                  <p className="text-xs text-slate-500">Credit/Debit cards, Apple Pay, Google Pay</p>
                </div>
              </div>
              <Switch 
                checked={stripeEnabled} 
                onCheckedChange={setStripeEnabled}
                data-testid="stripe-toggle"
              />
            </div>

            {/* Razorpay */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#072654] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Razorpay</p>
                  <p className="text-xs text-slate-500">UPI, Netbanking, Cards (India)</p>
                </div>
              </div>
              <Switch 
                checked={razorpayEnabled} 
                onCheckedChange={setRazorpayEnabled}
                data-testid="razorpay-toggle"
              />
            </div>

            {/* Offline/Invoice */}
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <Receipt className="text-white" size={20} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Offline / Invoice</p>
                  <p className="text-xs text-slate-500">Bank transfer, Check, Pay at venue</p>
                </div>
              </div>
              <Switch 
                checked={offlineEnabled} 
                onCheckedChange={setOfflineEnabled}
                data-testid="offline-toggle"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tax Configuration Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="text-slate-400" size={20} />
            <h4 className="font-semibold text-slate-800">Tax Configuration</h4>
          </div>
          
          {/* Enable Tax Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <p className="font-medium text-slate-800">Enable Tax Collection</p>
              <p className="text-xs text-slate-500">Apply tax to ticket purchases</p>
            </div>
            <Switch 
              checked={taxEnabled} 
              onCheckedChange={setTaxEnabled}
              data-testid="tax-toggle"
            />
          </div>

          {/* Tax Details (shown when enabled) */}
          {taxEnabled && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-2">
                <Label>Tax Name</Label>
                <Input 
                  placeholder="VAT, GST, Sales Tax..."
                  value={taxName}
                  onChange={(e) => setTaxName(e.target.value)}
                  data-testid="tax-name-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Tax Percentage (%)</Label>
                <Input 
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0.00"
                  value={taxPercentage}
                  onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                  data-testid="tax-percentage-input"
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Invoice Details Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="text-slate-400" size={20} />
            <h4 className="font-semibold text-slate-800">Invoice Details</h4>
          </div>
          <p className="text-sm text-slate-500">
            Information displayed on invoices and receipts
          </p>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Legal Entity Name</Label>
              <Input 
                placeholder="Your Company Name Inc."
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
                data-testid="legal-entity-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Billing Address</Label>
              <Textarea 
                placeholder="123 Business Street&#10;Suite 100&#10;City, State 12345&#10;Country"
                rows={4}
                value={billingAddress}
                onChange={(e) => setBillingAddress(e.target.value)}
                data-testid="billing-address-input"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tax ID / GST / VAT Number</Label>
              <Input 
                placeholder="XX-XXXXXXX"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                data-testid="tax-id-input"
              />
              <p className="text-xs text-slate-500">
                Your business tax identification number
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
