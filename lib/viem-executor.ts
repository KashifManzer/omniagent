import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  parseEther,
  encodeFunctionData,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Saga network configuration
export const sagaChain = {
  id: 2749127454006000,
  name: 'btest',
  network: 'btest',
  nativeCurrency: {
    decimals: 18,
    name: 'Btest',
    symbol: 'btt',
  },
  rpcUrls: {
    default: {
      http: ['https://btest-2749127454006000-1.jsonrpc.sagarpc.io'],
    },
    public: {
      http: ['https://btest-2749127454006000-1.jsonrpc.sagarpc.io'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Saga Explorer',
      url: 'https://btest-2749127454006000-1.sagaexplorer.io/',
    },
  },
} as const;

// Public client for reading from blockchain
export const publicClient = createPublicClient({
  chain: sagaChain,
  transport: http(),
});

// Wallet client for transactions
export const createWalletClientForExecution = (account: `0x${string}`) => {
  return createWalletClient({
    account,
    chain: sagaChain,
    transport: custom(window.ethereum),
  });
};

// Contract address
export const DAO_ACTION_EXECUTOR_ADDRESS =
  '0xBCFC5dD40922c8A4dCb9A5E679221a5E68c911d6' as const;

// ABI for the execute function
export const executeFunctionAbi = {
  name: 'execute',
  type: 'function',
  stateMutability: 'nonpayable',
  inputs: [
    { name: 'target', type: 'address' },
    { name: 'value', type: 'uint256' },
    { name: 'data', type: 'bytes' },
  ],
  outputs: [{ name: '', type: 'bytes' }],
} as const;

// ABI for the owner function
export const ownerFunctionAbi = {
  name: 'owner',
  type: 'function',
  stateMutability: 'view',
  inputs: [],
  outputs: [{ name: '', type: 'address' }],
} as const;

// Function to encode the execute call
export const encodeExecuteCall = (
  target: `0x${string}`,
  value: bigint,
  data: `0x${string}`
) => {
  return encodeFunctionData({
    abi: [executeFunctionAbi],
    args: [target, value, data],
  });
};

// Function to execute a proposal
export const executeProposal = async (
  account: `0x${string}`,
  target: `0x${string}`,
  value: string,
  calldata: `0x${string}`
) => {
  const walletClient = createWalletClientForExecution(account);

  const valueBigInt = value ? parseEther(value) : 0n;

  const hash = await walletClient.writeContract({
    address: DAO_ACTION_EXECUTOR_ADDRESS,
    abi: [executeFunctionAbi],
    functionName: 'execute',
    args: [target, valueBigInt, calldata],
  });

  return hash;
};

// Function to wait for transaction confirmation
export const waitForTransaction = async (hash: `0x${string}`) => {
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  return receipt;
};

// Function to get the current owner of the DAOActionExecutor
export const getCurrentOwner = async () => {
  const owner = await publicClient.readContract({
    address: DAO_ACTION_EXECUTOR_ADDRESS,
    abi: [ownerFunctionAbi],
    functionName: 'owner',
  });
  return owner;
};

// Function to check if a contract exists at the given address
export const checkContractExists = async (address: `0x${string}`) => {
  try {
    const code = await publicClient.getBytecode({ address });
    return code !== undefined && code !== '0x';
  } catch {
    return false;
  }
};

// Function to simulate a transaction
export const simulateTransaction = async (
  target: `0x${string}`,
  value: string,
  calldata: `0x${string}`
) => {
  const valueBigInt = value ? parseEther(value) : 0n;

  try {
    const result = await publicClient.simulateContract({
      address: DAO_ACTION_EXECUTOR_ADDRESS,
      abi: [executeFunctionAbi],
      functionName: 'execute',
      args: [target, valueBigInt, calldata],
    });

    return { success: true, result };
  } catch (error) {
    return { success: false, error };
  }
};
