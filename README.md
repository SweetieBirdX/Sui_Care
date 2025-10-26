# Sui Care dApp

A React TypeScript dApp built with Sui SDK integration, featuring wallet connectivity and state management for the Sui ecosystem.

## Features

- 🔗 **Wallet Integration**: Connect with Sui-compatible wallets
- 🌐 **Multi-Network Support**: Testnet and Mainnet network switching
- 📊 **Real-time Data**: Live wallet balance and object information
- 🎨 **Modern UI**: Beautiful, responsive interface with glassmorphism design
- ⚡ **TypeScript**: Full type safety and developer experience
- 🔄 **State Management**: React Query for efficient data fetching

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **@mysten/dapp-kit** for Sui wallet integration
- **@mysten/sui** for Sui blockchain interaction
- **@tanstack/react-query** for state management
- **CSS3** with modern styling

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Sui_Care
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # React components
│   ├── WalletConnectButton.tsx
│   ├── NetworkSelector.tsx
│   └── WalletInfo.tsx
├── config/             # Configuration files
│   └── networks.ts     # Network configurations
├── providers/          # React context providers
│   └── AppProviders.tsx
├── App.tsx            # Main application component
├── App.css            # Application styles
├── main.tsx           # Application entry point
└── index.css          # Global styles
```

## Network Configuration

The application supports both Sui Testnet and Mainnet:

- **Testnet**: `https://fullnode.testnet.sui.io:443`
- **Mainnet**: `https://fullnode.mainnet.sui.io:443`

You can switch between networks using the network selector in the UI.

## Wallet Integration

The dApp integrates with Sui-compatible wallets through the `@mysten/dapp-kit` library, providing:

- Wallet connection/disconnection
- Account information display
- Balance queries
- Object queries
- Transaction capabilities

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Style

The project uses TypeScript with strict mode enabled. All components are functional components using React hooks.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
