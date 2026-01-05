import express from 'express';
import { ethers } from 'ethers';
import { getProvider, getSigner } from '../services/web3.js';

const router = express.Router();

/**
 * GET /api/blockchain/network
 * Get blockchain network info
 */
router.get('/network', async (req, res) => {
  try {
    const provider = getProvider();
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();

    res.json({
      chainId: Number(network.chainId),
      name: network.name,
      blockNumber,
      rpcUrl: process.env.RPC_URL
    });
  } catch (error) {
    console.error('Get network info error:', error);
    res.status(500).json({ error: 'Failed to fetch network info' });
  }
});

/**
 * GET /api/blockchain/address/:address
 * Get address balance and info
 */
router.get('/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const provider = getProvider();

    const balance = await provider.getBalance(address);
    const balanceInEth = ethers.formatEther(balance);

    res.json({
      address,
      balance: balanceInEth,
      balanceWei: balance.toString()
    });
  } catch (error) {
    console.error('Get address info error:', error);
    res.status(500).json({ error: 'Failed to fetch address info' });
  }
});

/**
 * POST /api/blockchain/verify-contract
 * Verify contract address and get info
 */
router.post('/verify-contract', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Contract address required' });
    }

    const provider = getProvider();
    
    // Check if it's a contract (has code)
    const code = await provider.getCode(address);
    const isContract = code !== '0x';

    res.json({
      address,
      isContract,
      hasCode: isContract
    });
  } catch (error) {
    console.error('Verify contract error:', error);
    res.status(500).json({ error: 'Failed to verify contract' });
  }
});

export default router;

