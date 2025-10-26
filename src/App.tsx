import { AppProviders } from './providers/AppProviders';
import { WalletConnectButton } from './components/WalletConnectButton';
import { NetworkSelector } from './components/NetworkSelector';
import { RoleBasedRouter } from './components/RoleBasedRouter';
import { logProductionStatus } from './config/production';
import { useEffect } from 'react';
import { Stethoscope } from 'lucide-react';
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
          <div className="header-content">
                    <div className="app-logo">
                      <div className="logo-icon">
                        <Stethoscope className="w-8 h-8 text-white" />
                      </div>
                      <div className="logo-text">
                        <h1>Sui Care</h1>
                        <p>Decentralized Healthcare Management</p>
                      </div>
                    </div>
            <div className="header-controls">
              <WalletConnectButton />
              <NetworkSelector />
            </div>
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