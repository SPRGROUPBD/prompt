import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { AdminSidebar } from './AdminSidebar';
import { DashboardSection } from './sections/DashboardSection';
import { AllPromptsSection } from './sections/AllPromptsSection';
import { PromptEditorSection } from './sections/PromptEditorSection';
import { CategoriesSection } from './sections/CategoriesSection';
import { AdSettingsSection } from './sections/AdSettingsSection';
import { SettingsSection } from './sections/SettingsSection';

export const AdminPanel: React.FC = () => {
  const { adminSection } = useWorkspace();

  const renderActiveSection = () => {
    switch (adminSection) {
      case 'dashboard':
        return <DashboardSection />;
      case 'prompts':
        return <AllPromptsSection />;
      case 'new-prompt':
        return <PromptEditorSection />;
      case 'categories':
        return <CategoriesSection />;
      case 'ads':
        return <AdSettingsSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardSection />;
    }
  };

  return (
    <div className="flex-1 flex min-w-0 bg-slate-950 text-slate-100 overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto pb-16">
          {renderActiveSection()}
        </div>
      </main>
    </div>
  );
};
