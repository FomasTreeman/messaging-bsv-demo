// import type { Actions, PageServerLoad } from './$types';
import { WalletClient, Script } from '@bsv/sdk';
import type { Actions } from './$types';

async function connectWallet() {
    // Connect to wallet with BEEF capabilities
    const wallet = new WalletClient('auto', 'localhost:3000'); //TODO: Add new Metanet App
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

	const response = await listMessages(wallet);

	console.log('Loaded messages:', response);

	return { 
		connected: true,
		messages: response.actions || [],
		error: null
	};
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const message = data.get('message') as string;

		if (!message) {
			return {
				success: false,
				error: 'Message is required'
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
			const response = await wallet.createAction({
				description: message,
				labels: ['fom_tree messages'],
				outputs: [
					{
						satoshis: 1,
						lockingScript: Script.fromASM(`OP_FALSE OP_RETURN ${Buffer.from(message, 'utf8').toString('hex')}`).toHex(),
						basket: 'blockchain messages',
						outputDescription: message
					}
				]
			});

			return {
				success: true,
				message: message,
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
