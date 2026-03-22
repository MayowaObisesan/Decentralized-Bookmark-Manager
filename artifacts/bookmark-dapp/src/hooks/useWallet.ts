import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { ROOTSTOCK_TESTNET } from "@/lib/contract";

export type WalletState = {
  address: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  chainId: number | null;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;
};

export function useWallet() {
  const [state, setState] = useState<WalletState>({
    address: null,
    provider: null,
    signer: null,
    chainId: null,
    isConnecting: false,
    isCorrectNetwork: false,
    error: null,
  });

  const checkNetwork = useCallback((chainId: number) => {
    return chainId === ROOTSTOCK_TESTNET.chainId;
  }, []);

  const switchToRootstock = useCallback(async () => {
    const { ethereum } = window as any;
    if (!ethereum) return;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ROOTSTOCK_TESTNET.chainIdHex }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: ROOTSTOCK_TESTNET.chainIdHex,
                chainName: ROOTSTOCK_TESTNET.name,
                nativeCurrency: ROOTSTOCK_TESTNET.currency,
                rpcUrls: [ROOTSTOCK_TESTNET.rpcUrl],
                blockExplorerUrls: [ROOTSTOCK_TESTNET.blockExplorer],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      }
    }
  }, []);

  const connect = useCallback(async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      setState((s) => ({ ...s, error: "MetaMask not detected. Please install MetaMask." }));
      return;
    }

    setState((s) => ({ ...s, isConnecting: true, error: null }));

    try {
      const provider = new ethers.BrowserProvider(ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      const chainId = Number(network.chainId);
      const isCorrectNetwork = checkNetwork(chainId);

      setState({ address, provider, signer, chainId, isConnecting: false, isCorrectNetwork, error: null });

      if (!isCorrectNetwork) {
        await switchToRootstock();
      }
    } catch (err: any) {
      setState((s) => ({
        ...s,
        isConnecting: false,
        error: err.message || "Failed to connect wallet",
      }));
    }
  }, [checkNetwork, switchToRootstock]);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      provider: null,
      signer: null,
      chainId: null,
      isConnecting: false,
      isCorrectNetwork: false,
      error: null,
    });
  }, []);

  useEffect(() => {
    const { ethereum } = window as any;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else {
        setState((s) => ({ ...s, address: accounts[0] }));
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const chainId = parseInt(chainIdHex, 16);
      setState((s) => ({ ...s, chainId, isCorrectNetwork: checkNetwork(chainId) }));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [disconnect, checkNetwork]);

  return { ...state, connect, disconnect, switchToRootstock };
}
