import React from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { WorkspaceHeader } from './components/WorkspaceHeader';
import { ViewerPanel } from './components/viewer/ViewerPanel';
import { AdminPanel } from './components/admin/AdminPanel';
import { SplitWorkspaceView } from './components/split/SplitWorkspaceView';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/auth/AuthModal';
import { RewardAdModal } from './components/ads/RewardAdModal';

const MainWorkspaceContent: React.FC = () => {
  const { workspaceMode } = useWorkspace();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <WorkspaceHeader />
      <div className="flex-1 flex min-w-0">
        {workspaceMode === 'viewer' && <ViewerPanel />}
        {workspaceMode === 'admin' && <AdminPanel />}
        {workspaceMode === 'split' && <SplitWorkspaceView />}
      </div>
      <AuthModal />
      <RewardAdModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <WorkspaceProvider>
      <MainWorkspaceContent />
    </WorkspaceProvider>
  );
}
