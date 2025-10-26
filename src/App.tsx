import { AppProviders } from './providers/AppProviders';
import { WalletConnectButton } from './components/WalletConnectButton';
import { NetworkSelector } from './components/NetworkSelector';
import { RoleBasedRouter } from './components/RoleBasedRouter';
import { logProductionStatus } from './config/production';
import { useEffect } from 'react';
import './App.css';

function App() {
  // Check production readiness on app load
  useEffect(() => {
    logProductionStatus();
  }, []);

  return (
    <AppProviders>
      <div className="app">
        <header className="app-header">
          <h1>Sui Care dApp</h1>
          <p>Decentralized Healthcare Management System</p>
          <div className="header-controls">
            <WalletConnectButton />
            <NetworkSelector />
          </div>
        </header>
        
        <main className="app-main">
          <RoleBasedRouter />
        </main>
      </div>
    </AppProviders>
  );
}

export default App;