import { API_BASE_URL } from "./api";

// ---------- AVA-ECHO AVALANCHE L1 CONFIGURATION ----------
// Note: In production, these should be injected via build-time env vars (VITE_*)

export const AVALANCHE_L1_RPC = import.meta.env?.VITE_AVALANCHE_RPC_URL || "https://subnets.avax.network/myechochain/testnet/rpc";
export const CHAIN_ID = parseInt(import.meta.env?.VITE_CHAIN_ID || "9000");

export const ECHO_CONTRACT_ADDRESS = import.meta.env?.VITE_ECHO_CONTRACT_ADDRESS || "0x_ECHO_CONTRACT_PLACEHOLDER";
export const TELEPORTER_MESSENGER_ADDRESS = import.meta.env?.VITE_TELEPORTER_MESSENGER_ADDRESS || "0x253b2783c004018253b2783c004018253b2783c0";

// ---------- ON-CHAIN OBJECT IDs (Avalanche Move / EVM) ----------

export const SCORES_RECORD_ID = import.meta.env?.VITE_SCORES_RECORD_ID || "0x_SCORES_PLACEHOLDER";
export const ITEM_REGISTRY_ID = import.meta.env?.VITE_ITEM_REGISTRY_ID || "0x_ITEM_REGISTRY_PLACEHOLDER";

export const BACKEND_API_URL = API_BASE_URL;

/**
 * Helper to format item type for Avalanche Move/EVM
 */
export function itemStructType(contractAddress = ECHO_CONTRACT_ADDRESS, structName = "ItemNFT") {
  return `${contractAddress}::${structName}`;
}
