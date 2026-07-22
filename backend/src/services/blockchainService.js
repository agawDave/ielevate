const { ethers } = require('ethers');

// Minimal ABI for a hypothetical ERC-721 "SkillCredential" contract with a mint function.
// Replace with the actual ABI once the contract is deployed.
const CREDENTIAL_ABI = [
  'function mintCredential(address recipient, string memory metadataURI) public returns (uint256)',
  'event CredentialMinted(uint256 indexed tokenId, address indexed recipient, string metadataURI)',
];

function getProvider() {
  return new ethers.JsonRpcProvider(process.env.CHAIN_RPC_URL);
}

function getSignerWallet() {
  const provider = getProvider();
  return new ethers.Wallet(process.env.MINTER_PRIVATE_KEY, provider);
}

function getContract() {
  const wallet = getSignerWallet();
  return new ethers.Contract(process.env.CREDENTIAL_CONTRACT_ADDRESS, CREDENTIAL_ABI, wallet);
}

/**
 * Mints an on-chain credential for a completed skill exchange.
 * recipientAddress: the learner's wallet address
 * metadataUri: IPFS/Arweave URI pointing to JSON describing the skill, issuer, date, etc.
 */
async function mintSkillCredential(recipientAddress, metadataUri) {
  const contract = getContract();
  const tx = await contract.mintCredential(recipientAddress, metadataUri);
  const receipt = await tx.wait();

  const mintedEvent = receipt.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed && parsed.name === 'CredentialMinted');

  return {
    txHash: receipt.hash,
    tokenId: mintedEvent ? mintedEvent.args.tokenId.toString() : null,
  };
}

module.exports = { mintSkillCredential };
