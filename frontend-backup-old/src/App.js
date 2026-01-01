import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminLayout } from './components/AdminLayout.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { EventsPage } from './pages/EventsPage.tsx';
import { EventSetupPage } from './pages/EventSetupPage.tsx';
import { EventManagePage } from './pages/EventManagePage.tsx';
import { FormsPage } from './pages/FormsPage.tsx';
import { CreateFormPage } from './pages/CreateFormPage.tsx';
import { PeoplePage } from './pages/PeoplePage.tsx';
import { CreatePersonAdvancedPage } from './pages/CreatePersonAdvancedPage.tsx';
import { EditPersonPage } from './pages/EditPersonPage.tsx';
import { CommunicationsPage } from './pages/CommunicationsPage.tsx';
import { CreateCampaignPage } from './pages/CreateCampaignPage.tsx';
import { CommunicationsEmailPage } from './pages/CommunicationsEmailPage.tsx';
import { FinancePage } from './pages/FinancePage.tsx';
import { ManageTransactionsPage } from './pages/ManageTransactionsPage.tsx';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage.tsx';
import { CreateReportPage } from './pages/CreateReportPage.tsx';
import { SettingsPage } from './pages/SettingsPage.tsx';
import { OrganizationIdentityPage } from './pages/OrganizationIdentityPage.tsx';
import { UsersRolesAccessPage } from './pages/UsersRolesAccessPage.tsx';
import { PeopleIdentitySystemPage } from './pages/PeopleIdentitySystemPage.tsx';
import { EventsProgramsAwardsPage } from './pages/EventsProgramsAwardsPage.tsx';
import { CommunicationsCampaignsSettingsPage } from './pages/CommunicationsCampaignsSettingsPage.tsx';
import { DeliverySafetyControlsPage } from './pages/DeliverySafetyControlsPage.tsx';
import { CompliancePrivacyPage } from './pages/CompliancePrivacyPage.tsx';
import { NotificationsAlertsPage } from './pages/NotificationsAlertsPage.tsx';
import { FinancePaymentsSettingsPage } from './pages/FinancePaymentsSettingsPage.tsx';
import { LocalizationRegionsPage } from './pages/LocalizationRegionsPage.tsx';
import { PoliciesLegalPage } from './pages/PoliciesLegalPage.tsx';
import { FilesAssetsPage } from './pages/FilesAssetsPage.tsx';
import { IntegrationsAPIsPage } from './pages/IntegrationsAPIsPage.tsx';
import { AdvancedSystemPage } from './pages/AdvancedSystemPage.tsx';
import { CustomScrollbarStyles } from './components/CustomScrollbarStyles.tsx';
import { ConferencesPage } from './pages/ConferencesPage.tsx';
import { ConferenceManagePage } from './pages/ConferenceManagePage.tsx';
import { AwardsPage } from './pages/AwardsPage.tsx';
import { AwardManagePage } from './pages/AwardManagePage.tsx';
import { MetricsExample } from './pages/MetricsExample.tsx';

import LoginPage from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { isAuthenticated } from './utils/auth';

function App() {
  // Redirect to login if not authenticated
  if (!isAuthenticated() && window.location.pathname !== '/login') {
    return (
      <div className="App">
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }

  // Redirect from login to dashboard if already authenticated
  if (isAuthenticated() && window.location.pathname === '/login') {
    return (
      <div className="App">
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    );
  }

  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <CustomScrollbarStyles />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
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
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
