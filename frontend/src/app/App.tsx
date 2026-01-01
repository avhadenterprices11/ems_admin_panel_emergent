import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { EventSetupPage } from './pages/EventSetupPage';
import { EventManagePage } from './pages/EventManagePage';
import { FormsPage } from './pages/FormsPage';
import { CreateFormPage } from './pages/CreateFormPage';
import { PeoplePage } from './pages/PeoplePage';
import { CreatePersonAdvancedPage } from './pages/CreatePersonAdvancedPage';
import { EditPersonPage } from './pages/EditPersonPage';
import { CommunicationsPage } from './pages/CommunicationsPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { CommunicationsEmailPage } from './pages/CommunicationsEmailPage';
import { FinancePage } from './pages/FinancePage';
import { ManageTransactionsPage } from './pages/ManageTransactionsPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { CreateReportPage } from './pages/CreateReportPage';
import { SettingsPage } from './pages/SettingsPage';
import { OrganizationIdentityPage } from './pages/OrganizationIdentityPage';
import { UsersRolesAccessPage } from './pages/UsersRolesAccessPage';
import { PeopleIdentitySystemPage } from './pages/PeopleIdentitySystemPage';
import { EventsProgramsAwardsPage } from './pages/EventsProgramsAwardsPage';
import { CommunicationsCampaignsSettingsPage } from './pages/CommunicationsCampaignsSettingsPage';
import { DeliverySafetyControlsPage } from './pages/DeliverySafetyControlsPage';
import { CompliancePrivacyPage } from './pages/CompliancePrivacyPage';
import { NotificationsAlertsPage } from './pages/NotificationsAlertsPage';
import { FinancePaymentsSettingsPage } from './pages/FinancePaymentsSettingsPage';
import { LocalizationRegionsPage } from './pages/LocalizationRegionsPage';
import { PoliciesLegalPage } from './pages/PoliciesLegalPage';
import { FilesAssetsPage } from './pages/FilesAssetsPage';
import { IntegrationsAPIsPage } from './pages/IntegrationsAPIsPage';
import { AdvancedSystemPage } from './pages/AdvancedSystemPage';
import { CustomScrollbarStyles } from './components/CustomScrollbarStyles';
import { ConferencesPage } from './pages/ConferencesPage';
import { ConferenceManagePage } from './pages/ConferenceManagePage';
import { AwardsPage } from './pages/AwardsPage';
import { AwardManagePage } from './pages/AwardManagePage';
import { MetricsExample } from './pages/MetricsExample';
import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <CustomScrollbarStyles />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Main routes */}
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/new" element={<EventSetupPage />} />
            <Route path="events/:id" element={<EventManagePage />} />
            <Route path="forms" element={<FormsPage />} />
            <Route path="forms/new" element={<CreateFormPage />} />
            <Route path="people" element={<PeoplePage />} />
            <Route path="people/new" element={<CreatePersonAdvancedPage />} />
            <Route path="people/:id/edit" element={<EditPersonPage />} />
            <Route path="communications" element={<CommunicationsPage />} />
            <Route path="communications/new" element={<CreateCampaignPage />} />
            <Route path="communications/email" element={<CommunicationsEmailPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="finance/transactions" element={<ManageTransactionsPage />} />
            <Route path="reports/analytics" element={<ReportsAnalyticsPage />} />
            <Route path="reports/new" element={<CreateReportPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/organization-identity" element={<OrganizationIdentityPage />} />
            <Route path="settings/users-roles-access" element={<UsersRolesAccessPage />} />
            <Route path="settings/people-identity-system" element={<PeopleIdentitySystemPage />} />
            <Route path="settings/events-programs-awards" element={<EventsProgramsAwardsPage />} />
            <Route path="settings/communications-campaigns-settings" element={<CommunicationsCampaignsSettingsPage />} />
            <Route path="settings/delivery-safety-controls" element={<DeliverySafetyControlsPage />} />
            <Route path="settings/compliance-privacy" element={<CompliancePrivacyPage />} />
            <Route path="settings/notifications-alerts" element={<NotificationsAlertsPage />} />
            <Route path="settings/finance-payments-settings" element={<FinancePaymentsSettingsPage />} />
            <Route path="settings/localization-regions" element={<LocalizationRegionsPage />} />
            <Route path="settings/policies-legal" element={<PoliciesLegalPage />} />
            <Route path="settings/files-assets" element={<FilesAssetsPage />} />
            <Route path="settings/integrations-apis" element={<IntegrationsAPIsPage />} />
            <Route path="settings/advanced-system" element={<AdvancedSystemPage />} />
            <Route path="conferences" element={<ConferencesPage />} />
            <Route path="conferences/:id" element={<ConferenceManagePage />} />
            <Route path="awards" element={<AwardsPage />} />
            <Route path="awards/:id" element={<AwardManagePage />} />
            <Route path="metrics-example" element={<MetricsExample />} />
            
            {/* Catch all - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}