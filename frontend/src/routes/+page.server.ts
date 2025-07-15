// import type { Actions, PageServerLoad } from './$types';
import { WalletClient, Script, PrivateKey } from '@bsv/sdk';
import type { Actions } from './$types';

// Predefined recipient addresses and keys to avoid server-side random generation
const RECIPIENTS = [
	{
		did: 'did:bsv:alice',
		name: 'Alice',
		address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
	},
	{
		did: 'did:bsv:bob', 
		name: 'Bob',
		address: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
	},
	{
		did: 'did:bsv:charlie',
		name: 'Charlie',
		address: '1Hare1UGoJ8m4f5t3U37VWrmXfFRVN8v6'
	}
];

// Function to register DID-to-address mapping on blockchain
async function registerDidOnBlockchain(wallet: WalletClient, did: string, address: string) {
	PrivateKey.fromRandom();

	const registrationData = JSON.stringify({
		type: 'did-registration',
		did: did,
		address: address,
		timestamp: Date.now()
	});

	const response = await wallet.createAction({
		description: `Register DID ${did} to address ${address}`,
		labels: ['did-registry'],
		outputs: [
			{
				satoshis: 1,
				lockingScript: Script.fromASM(
					`OP_FALSE OP_RETURN ${Buffer.from(registrationData, 'utf8').toString('hex')}`
				).toHex(),
				basket: 'did registry',
				outputDescription: `DID Registration: ${did}`
			}
		]
	});

	return response;
}

async function connectWallet() {
	// Connect to wallet with BEEF capabilities
	const wallet = new WalletClient('auto', 'fom_tree-test');

	const isConnected = await wallet.isAuthenticated();

	if (isConnected) {
		return wallet;
	}

	return null;
}

export const load = async () => {
	const wallet = await connectWallet();
	if (!wallet) {
		return {
			connected: false,
			error: 'Wallet not connected',
			messages: []
		};
	}

	// Register DIDs on blockchain if not already registered
	try {
		for (const recipient of RECIPIENTS) {
			await registerDidOnBlockchain(wallet, recipient.did, recipient.address);
		}
	} catch (error) {
		console.error('Error registering DIDs:', error);
	}

	const response = await listMessages(wallet);

	console.log('Loaded messages:', response);


	return {
		connected: true,
		messages: response.actions || [],
		recipients: RECIPIENTS.map(r => ({ did: r.did, name: r.name, address: r.address })),
		error: null,
		walletAddress: (await wallet.getPublicKey({ identityKey: true })).publicKey,
	};
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const message = data.get('message') as string;
		const recipientDid = data.get('recipient') as string;

		if (!message) {
			return {
				success: false,
				error: 'Message is required'
			};
		}

		if (!recipientDid) {
			return {
				success: false,
				error: 'Recipient DID is required'
			};
		}

		const recipient = RECIPIENTS.find(r => r.did === recipientDid);
		if (!recipient) {
			return {
				success: false,
				error: 'Recipient not found'
			};
		}

		const wallet = await connectWallet();
		if (!wallet) {
			return {
				success: false,
				error: 'Wallet not connected'
			};
		}

		try {
			const messageData = JSON.stringify({
				message,
				to: recipient.did,
				from: 'user',
				timestamp: Date.now()
			});

			const response = await wallet.createAction({
				description: `Message to ${recipient.name} (${recipient.did})`,
				labels: ['fom_tree messages', 'did-messaging'],
				outputs: [
					{
						satoshis: 1,
						lockingScript: Script.fromASM(
							`OP_FALSE OP_RETURN ${Buffer.from(messageData, 'utf8').toString('hex')}`
						).toHex(),
						basket: 'blockchain messages',
						outputDescription: `Message to ${recipient.name}`
					}
				]
			});

			return {
				success: true,
				message: message,
				recipient: recipient.name,
				recipientDid: recipient.did,
				recipientAddress: recipient.address,
				txid: response.txid || 'Unknown'
			};
		} catch (error) {
			console.error('Error submitting message:', error);
			return {
				success: false,
				error: 'Failed to submit message to blockchain'
			};
		}
	}
} satisfies Actions;

async function listMessages(wallet: WalletClient) {
	const response = await wallet.listActions({
		labels: ['fom_tree messages']
	});

	return response;
}
