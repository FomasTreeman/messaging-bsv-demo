import { WalletClient } from '@bsv/sdk';
import type { PageServerLoad } from './$types';

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

async function connectWallet() {
	const wallet = new WalletClient('auto', 'fom_tree-test');
	const isConnected = await wallet.isAuthenticated();
	
	if (isConnected) {
		return wallet;
	}
	
	return null;
}

async function getMessagesForRecipient(wallet: WalletClient, recipientDid: string) {
	const response = await wallet.listActions({
		labels: ['fom_tree messages', 'did-messaging']
	});

	// Filter messages for specific recipient
	const recipientMessages = response.actions?.filter(action => {
		try {
			// Parse the OP_RETURN data to check if it's for this recipient
			const description = action.description || '';
			return description.includes(recipientDid);
		} catch (error) {
			return false;
		}
	}) || [];

	return recipientMessages;
}

export const load: PageServerLoad = async () => {
	const wallet = await connectWallet();
	if (!wallet) {
		return {
			connected: false,
			error: 'Wallet not connected',
			recipients: []
		};
	}

	// Get messages for each recipient
	const recipientsWithMessages = await Promise.all(
		RECIPIENTS.map(async (recipient) => {
			const messages = await getMessagesForRecipient(wallet, recipient.did);
			return {
				...recipient,
				messages: messages,
				messageCount: messages.length
			};
		})
	);

	return {
		connected: true,
		recipients: recipientsWithMessages.map(r => ({
			did: r.did,
			name: r.name,
			address: r.address,
			messages: r.messages,
			messageCount: r.messageCount
		})),
		error: null
	};
};