import { ApiPromise, WsProvider } from "@polkadot/api";

export interface ChainConfig {
  name: string;
  rpcUrl: string;
  wsUrl: string;
  logo: string;
  contractAddress?: string;
  prefix: number
}

export const chainsConfig: ChainConfig[] = [
  {
    name: "Polkadot",
    rpcUrl: "https://rpc.polkadot.io",
    wsUrl: "wss://rpc.polkadot.io",
    logo: "/images/polkadot-logo.svg",
    prefix: 0,
  },
  {
    name: "Kusama",
    rpcUrl: "https://kusama-rpc.polkadot.io",
    wsUrl: "wss://kusama-rpc.polkadot.io",
    logo: "/images/kusama-logo.svg",
    prefix: 1,
  },
  {
    name: "Westend",
    rpcUrl: "https://westend-rpc.polkadot.network",
    wsUrl: "wss://westend-rpc.polkadot.io",
    logo: "/images/polkadot-logo.svg",
    prefix: 2
  },
  // Add more chains as needed
  {
    name: "Paseo",
    rpcUrl: "https://pas-rpc.stakeworld.io",
    wsUrl: "wss://pas-rpc.stakeworld.io",
    logo: "/images/polkadot-logo.svg",
    prefix: 42

  }
];

export const getApiForChain = async (
  chainConfig: ChainConfig
): Promise<ApiPromise> => {
  const provider = new WsProvider(chainConfig.wsUrl);
  return await ApiPromise.create({ provider });
};
