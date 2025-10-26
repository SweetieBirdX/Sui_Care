import { AppProviders } from './providers/AppProviders';
import { WalletConnectButton } from './components/WalletConnectButton';
import { NetworkSelector } from './components/NetworkSelector';
import { WalletInfo } from './components/WalletInfo';
import './App.css';

function App() {
  return (
    <AppProviders>
      <div className="app">
        <header className="app-header">
          <h1>Sui Care dApp</h1>
          <p>Your gateway to the Sui ecosystem</p>
        </header>
        
        <main className="app-main">
          <div className="wallet-section">
            <WalletConnectButton />
            <NetworkSelector />
          </div>
          
          <div className="wallet-info-section">
            <WalletInfo />
          </div>
        </main>
      </div>
    </AppProviders>
  );
}

export default App;