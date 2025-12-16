import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink, Check, Copy, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const WALLETS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '🦊',
    description: 'Connect using MetaMask browser extension',
    installUrl: 'https://metamask.io/download/',
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '🔗',
    description: 'Scan QR code with your mobile wallet',
    installUrl: 'https://walletconnect.com/',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '🔵',
    description: 'Connect using Coinbase Wallet extension',
    installUrl: 'https://www.coinbase.com/wallet',
  },
];

export default function ConnectWalletModal({ isOpen, onClose, onConnect }) {
  const [connecting, setConnecting] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check if already connected
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      setConnectedAddress(savedAddress);
    }
  }, []);

  const checkWalletInstalled = (walletId) => {
    if (typeof window === 'undefined' || !window.ethereum) {
      return false;
    }

    if (walletId === 'metamask') {
      return window.ethereum.isMetaMask === true;
    }
    
    if (walletId === 'coinbase') {
      return window.ethereum.isCoinbaseWallet === true;
    }

    // WalletConnect works differently - it's always available as it uses QR codes
    if (walletId === 'walletconnect') {
      return true;
    }

    return false;
  };

  const connectMetaMask = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        toast.error('MetaMask is not installed. Please install it first.');
        window.open('https://metamask.io/download/', '_blank');
        return;
      }

      setConnecting(true);
      
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setConnectedAddress(address);
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'metamask');
        
        // Get network info
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = getNetworkName(chainId);
        
        toast.success(`Connected to ${networkName}!`);
        
        if (onConnect) {
          onConnect({
            address,
            walletType: 'metamask',
            chainId,
            networkName,
          });
        }
      }
    } catch (error) {
      console.error('Error connecting to MetaMask:', error);
      if (error.code === 4001) {
        toast.error('Please connect your wallet in MetaMask');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
    } finally {
      setConnecting(false);
    }
  };

  const connectCoinbase = async () => {
    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        toast.error('Coinbase Wallet is not installed. Please install it first.');
        window.open('https://www.coinbase.com/wallet', '_blank');
        return;
      }

      setConnecting(true);
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setConnectedAddress(address);
        localStorage.setItem('walletAddress', address);
        localStorage.setItem('walletType', 'coinbase');
        
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const networkName = getNetworkName(chainId);
        
        toast.success(`Connected to ${networkName}!`);
        
        if (onConnect) {
          onConnect({
            address,
            walletType: 'coinbase',
            chainId,
            networkName,
          });
        }
      }
    } catch (error) {
      console.error('Error connecting to Coinbase Wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    } finally {
      setConnecting(false);
    }
  };

  const connectWalletConnect = async () => {
    toast.info('WalletConnect integration coming soon!');
    // WalletConnect requires additional setup with their SDK
  };

  const getNetworkName = (chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0x89': 'Polygon',
      '0x13881': 'Mumbai Testnet',
      '0x38': 'BSC',
      '0x61': 'BSC Testnet',
      '0xa4b1': 'Arbitrum',
    };
    return networks[chainId] || `Chain ${parseInt(chainId, 16)}`;
  };

  const handleWalletClick = async (wallet) => {
    setSelectedWallet(wallet.id);
    
    switch (wallet.id) {
      case 'metamask':
        await connectMetaMask();
        break;
      case 'coinbase':
        await connectCoinbase();
        break;
      case 'walletconnect':
        await connectWalletConnect();
        break;
      default:
        break;
    }
  };

  const handleCopyAddress = () => {
    if (connectedAddress) {
      navigator.clipboard.writeText(connectedAddress);
      setCopied(true);
      toast.success('Address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    setConnectedAddress(null);
    toast.info('Wallet disconnected');
    if (onConnect) {
      onConnect(null);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {connectedAddress ? 'Wallet Connected' : 'Connect Wallet'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {connectedAddress ? 'Your wallet is connected' : 'Choose a wallet to connect'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {connectedAddress ? (
              // Connected State
              <div className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">
                      Successfully Connected
                    </span>
                  </div>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    Your wallet is now connected to PredictHub
                  </p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Wallet Address
                    </span>
                    <button
                      onClick={handleCopyAddress}
                      className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                    {connectedAddress}
                  </p>
                  <p className="font-mono text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatAddress(connectedAddress)}
                  </p>
                </div>

                <button
                  onClick={handleDisconnect}
                  className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              // Connection Options
              <div className="space-y-4">
                {/* Info Section */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">Before connecting:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Make sure your wallet is unlocked</li>
                        <li>Only connect to trusted applications</li>
                        <li>Never share your private keys</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Wallet Options */}
                <div className="space-y-3">
                  {WALLETS.map((wallet) => {
                    const isInstalled = checkWalletInstalled(wallet.id);
                    const isConnecting = connecting && selectedWallet === wallet.id;

                    return (
                      <motion.button
                        key={wallet.id}
                        onClick={() => handleWalletClick(wallet)}
                        disabled={connecting || !isInstalled}
                        whileHover={{ scale: isInstalled && !connecting ? 1.02 : 1 }}
                        whileTap={{ scale: isInstalled && !connecting ? 0.98 : 1 }}
                        className={`w-full p-4 rounded-xl border-2 transition-all ${
                          isInstalled
                            ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60 cursor-not-allowed'
                        } ${
                          isConnecting
                            ? 'border-blue-500 dark:border-blue-500'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-3xl">{wallet.icon}</div>
                            <div className="text-left">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                  {wallet.name}
                                </h3>
                                {!isInstalled && (
                                  <span className="text-xs px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                                    Not Installed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                {wallet.description}
                              </p>
                            </div>
                          </div>
                          {isConnecting ? (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                          ) : (
                            <ExternalLink className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        {!isInstalled && (
                          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                            <a
                              href={wallet.installUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Install {wallet.name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>

                {/* Footer Info */}
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 pt-2">
                  By connecting, you agree to PredictHub's Terms of Service and Privacy Policy
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

