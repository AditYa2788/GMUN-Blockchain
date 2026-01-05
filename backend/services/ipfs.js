import { create } from 'ipfs-http-client';
import dotenv from 'dotenv';

dotenv.config();

// Initialize IPFS client
let ipfsClient = null;

try {
  // Try to connect to local IPFS node
  ipfsClient = create({
    url: process.env.IPFS_API_URL || '/ip4/127.0.0.1/tcp/5001',
    // For production, use services like Pinata or Infura
    // url: `https://ipfs.infura.io:5001/api/v0`,
    // headers: {
    //   authorization: `Basic ${Buffer.from(`${process.env.INFURA_PROJECT_ID}:${process.env.INFURA_PROJECT_SECRET}`).toString('base64')}`
    // }
  });
  console.log('✅ IPFS client initialized');
} catch (error) {
  console.warn('⚠️  Could not connect to IPFS node. Some features may not work.');
  console.warn('   To fix: Install IPFS and run "ipfs daemon" or configure IPFS service');
}

/**
 * Upload data to IPFS
 * @param {string|Buffer|Object} data - Data to upload
 * @returns {Promise<string>} IPFS hash (CID)
 */
export async function uploadToIPFS(data) {
  if (!ipfsClient) {
    throw new Error('IPFS client not initialized. Please start IPFS daemon or configure IPFS service.');
  }

  try {
    let content;
    
    // Convert object to JSON string if needed
    if (typeof data === 'object' && !Buffer.isBuffer(data)) {
      content = JSON.stringify(data);
    } else {
      content = data;
    }

    const result = await ipfsClient.add(content);
    const hash = result.cid.toString();
    
    console.log(`📤 Uploaded to IPFS: ${hash}`);
    return hash;
  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error.message}`);
  }
}

/**
 * Retrieve data from IPFS
 * @param {string} hash - IPFS hash (CID)
 * @returns {Promise<string>} Content from IPFS
 */
export async function getFromIPFS(hash) {
  if (!ipfsClient) {
    throw new Error('IPFS client not initialized');
  }

  try {
    const chunks = [];
    for await (const chunk of ipfsClient.cat(hash)) {
      chunks.push(chunk);
    }
    
    const content = Buffer.concat(chunks).toString();
    return content;
  } catch (error) {
    console.error('IPFS retrieval error:', error);
    throw new Error(`Failed to retrieve from IPFS: ${error.message}`);
  }
}

/**
 * Get IPFS gateway URL
 * @param {string} hash - IPFS hash
 * @returns {string} Gateway URL
 */
export function getIPFSGatewayURL(hash) {
  const gateway = process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/';
  return `${gateway}${hash}`;
}

export default ipfsClient;

