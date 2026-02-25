import { API_BASE_URL } from "./api";

// ---------- AVA-ECHO AVALANCHE L1 CONFIGURATION ----------
// Note: In production, these should be injected via build-time env vars (VITE_*)

export const AVALANCHE_L1_RPC = import.meta.env?.VITE_AVALANCHE_RPC_URL || "https://subnets.avax.network/myechochain/testnet/rpc";
export const CHAIN_ID = parseInt(import.meta.env?.VITE_CHAIN_ID || "9000");

// Move Package/Module Config
export const PACKAGE_ID = import.meta.env?.VITE_ECHO_CONTRACT_ADDRESS || "0x_ECHO_CONTRACT_PLACEHOLDER";
export const MODULE_NAME = "contracts";

// Object IDs (Registry and System objects)
export const AVATAR_REGISTRY_OBJECT_ID = import.meta.env?.VITE_AVATAR_REGISTRY_ID || "0x_AVATAR_REGISTRY_PLACEHOLDER";
export const RANDOM_OBJECT_ID = "0x8"; // Standard system random object for Move
export const REWARD_POOL_OBJECT_ID = import.meta.env?.VITE_REWARD_POOL_ID || "0x_REWARD_POOL_PLACEHOLDER";
export const CLOCK_OBJECT_ID = "0x6"; // Standard clock object

export const TELEPORTER_MESSENGER_ADDRESS = import.meta.env?.VITE_TELEPORTER_MESSENGER_ADDRESS || "0x253b2783c004018253b2783c004018253b2783c0";

export const BACKEND_API_URL = API_BASE_URL;

/**
 * Helper to format item type for Avalanche Move
 */
export function itemNftStructType(contractAddress = PACKAGE_ID, structName = "ItemNFT") {
  return `${contractAddress}::${MODULE_NAME}::${structName}`;
}
