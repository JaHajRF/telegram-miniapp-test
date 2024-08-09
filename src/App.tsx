import './App.css';
import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import '@twa-dev/sdk';

function App() {
  const wallet = useTonWallet();
  return (
    <div>
      <div>My wallet address: {wallet?.account.address}</div>
      <TonConnectButton />
    </div>
  );
}

export default App