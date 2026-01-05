import { LogOut, User, Wallet } from "lucide-react";
import { useWallet } from "../hooks/useWallet.js";
import { formatAddress } from "../services/wallet.js";

function Navbar({ activeTab, setActiveTab }) {
  const { account, isAuthenticated, connect, disconnectWallet, isMetaMaskInstalled } = useWallet();
  const navItems = [
    { name: "Appointments", id: "appointments" },
    { name: "Prescriptions", id: "prescriptions" },
    { name: "Profile", id: "profile" },
  ];

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      alert(error.message || 'Failed to connect wallet');
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-14">
            <div className="text-xl font-bold text-blue-600 tracking-tight cursor-pointer" onClick={() => setActiveTab("appointments")}>
              MedChain
            </div>
            <div className="flex gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`text-sm transition-all duration-200 pb-5 mt-5 border-b-2 ${
                    activeTab === item.id
                      ? "text-blue-600 font-semibold border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-900"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {account && isAuthenticated ? (
              <>
                <div className="hidden md:block text-right">
                  <p className="text-[10px] text-gray-400 font-mono">{formatAddress(account)}</p>
                </div>
                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <button 
                  onClick={disconnectWallet}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Disconnect"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                disabled={!isMetaMaskInstalled}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Wallet className="w-4 h-4" />
                {isMetaMaskInstalled ? 'Connect Wallet' : 'Install MetaMask'}
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;