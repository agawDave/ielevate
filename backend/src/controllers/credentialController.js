const { pool } = require('../config/db');
const { mintSkillCredential } = require('../services/blockchainService');

async function listMyCredentials(req, res) {
  const [rows] = await pool.query(
    `SELECT cr.id, cr.status, cr.token_id, cr.contract_address, cr.chain, cr.tx_hash,
            cr.metadata_uri, cr.issued_at, s.name AS skill_name,
            issuer.full_name AS issuer_name
     FROM credentials cr
     JOIN skills s ON s.id = cr.skill_id
     JOIN users issuer ON issuer.id = cr.issuer_id
     WHERE cr.recipient_id = ?
     ORDER BY cr.created_at DESC`,
    [req.user.id]
  );
  res.json({ success: true, data: rows });
}

// Called after an exchange is marked 'completed' by both parties.
async function issueCredential(req, res) {
  const { exchangeId, recipientId, skillId, issuerId, metadataUri } = req.body;

  const [recipientRows] = await pool.query('SELECT wallet_address FROM users WHERE id = ?', [
    recipientId,
  ]);
  const walletAddress = recipientRows[0]?.wallet_address;
  if (!walletAddress) {
    return res.status(400).json({
      success: false,
      message: 'Recipient has not connected a wallet address yet',
    });
  }

  const [insertResult] = await pool.query(
    `INSERT INTO credentials (exchange_id, recipient_id, skill_id, issuer_id, metadata_uri, status)
     VALUES (?, ?, ?, ?, ?, 'pending')`,
    [exchangeId, recipientId, skillId, issuerId, metadataUri]
  );
  const credentialId = insertResult.insertId;

  try {
    const { txHash, tokenId } = await mintSkillCredential(walletAddress, metadataUri);
    await pool.query(
      `UPDATE credentials SET status = 'minted', tx_hash = ?, token_id = ?,
         contract_address = ?, issued_at = NOW() WHERE id = ?`,
      [txHash, tokenId, process.env.CREDENTIAL_CONTRACT_ADDRESS, credentialId]
    );
    res.status(201).json({ success: true, data: { credentialId, txHash, tokenId } });
  } catch (err) {
    await pool.query(`UPDATE credentials SET status = 'failed' WHERE id = ?`, [credentialId]);
    res.status(502).json({ success: false, message: 'Blockchain minting failed', error: err.message });
  }
}

module.exports = { listMyCredentials, issueCredential };
