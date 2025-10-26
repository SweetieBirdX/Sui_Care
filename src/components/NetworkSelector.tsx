export function NetworkSelector() {
  return (
    <div className="network-selector">
      <h3>Select Network</h3>
      <div className="network-buttons">
        <button className="network-button active">
          Sui Testnet
        </button>
        <button className="network-button">
          Sui Mainnet
        </button>
      </div>
      <p>Current Network: testnet</p>
    </div>
  );
}