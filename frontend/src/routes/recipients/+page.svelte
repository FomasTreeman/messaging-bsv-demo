<script lang="ts">
	import type { PageData } from './$types';
	
	export let data: PageData;
</script>

<svelte:head>
	<title>Recipients - BSV Demo</title>
</svelte:head>

<div class="container">
	<h1>Recipients & Messages</h1>
	
	{#if !data.connected}
		<div class="error">
			<p>❌ {data.error}</p>
		</div>
	{:else}
		<div class="recipients-grid">
			{#each data.recipients as recipient}
				<div class="recipient-card">
					<div class="recipient-header">
						<h2>{recipient.name}</h2>
						<div class="recipient-info">
							<p><strong>DID:</strong> {recipient.did}</p>
							<p><strong>Address:</strong> {recipient.address}</p>
							<p><strong>Messages:</strong> {recipient.messageCount}</p>
						</div>
					</div>
					
					<div class="messages-section">
						<h3>Messages</h3>
						{#if recipient.messages.length > 0}
							<div class="messages-list">
								{#each recipient.messages as message}
									<div class="message-item">
										<div class="message-content">
											<p><strong>Description:</strong> {message.description}</p>
											<p><strong>TxID:</strong> {message.txid}</p>
											{#if message.timestamp}
												<p><strong>Time:</strong> {new Date(message.timestamp).toLocaleString()}</p>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<p class="no-messages">No messages found for this recipient.</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
	
	<div class="navigation">
		<a href="/">← Back to Main</a>
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	h1 {
		text-align: center;
		margin-bottom: 30px;
		color: #333;
	}

	.error {
		background-color: #fee;
		border: 1px solid #fcc;
		padding: 15px;
		border-radius: 5px;
		margin-bottom: 20px;
		text-align: center;
	}

	.recipients-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 20px;
		margin-bottom: 30px;
	}

	.recipient-card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 20px;
		background-color: #f9f9f9;
	}

	.recipient-header {
		margin-bottom: 20px;
	}

	.recipient-header h2 {
		margin: 0 0 10px 0;
		color: #2c3e50;
	}

	.recipient-info p {
		margin: 5px 0;
		font-size: 14px;
		color: #666;
		word-break: break-all;
	}

	.messages-section h3 {
		margin: 0 0 15px 0;
		color: #34495e;
		border-bottom: 2px solid #3498db;
		padding-bottom: 5px;
	}

	.messages-list {
		max-height: 300px;
		overflow-y: auto;
	}

	.message-item {
		background-color: white;
		border: 1px solid #e0e0e0;
		border-radius: 5px;
		padding: 15px;
		margin-bottom: 10px;
	}

	.message-content p {
		margin: 5px 0;
		font-size: 13px;
	}

	.message-content p:first-child {
		font-weight: bold;
		color: #2c3e50;
	}

	.no-messages {
		text-align: center;
		color: #888;
		font-style: italic;
		padding: 20px;
	}

	.navigation {
		text-align: center;
		margin-top: 30px;
	}

	.navigation a {
		color: #3498db;
		text-decoration: none;
		font-weight: bold;
	}

	.navigation a:hover {
		text-decoration: underline;
	}
</style>