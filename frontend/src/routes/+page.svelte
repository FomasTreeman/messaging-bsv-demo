<script>
	// Svelte imports
	import { onMount } from 'svelte';
	
	// App imports
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	// Props
	/** @type {import('./$types').PageData} */
	export let data;

	/** @type {import('./$types').ActionData} */
	export let form;

	// Component state
	let message = '';
	let submitting = false;

	// Reactive statements
	$: walletConnected = data.connected;
	$: error = data.error;
	$: messages = data.messages || [];

	// Handle successful form submission
	$: if (form?.success) {
		message = '';
		// Refresh the messages to show the new one after blockchain propagation
		setTimeout(() => {
			invalidateAll();
		}, 2000);
	}

	// Auto-refresh functionality
	let refreshInterval = null;

	function startAutoRefresh() {
		if (walletConnected) {
			refreshInterval = setInterval(() => {
				invalidateAll();
			}, 30000); // Refresh every 30 seconds
		}
	}

	function stopAutoRefresh() {
		if (refreshInterval) {
			clearInterval(refreshInterval);
			refreshInterval = null;
		}
	}

	// Lifecycle hooks
	onMount(() => {
		startAutoRefresh();
		return () => stopAutoRefresh();
	});
</script>

<main>
	<div class="page-container">
		<div class="container">
			<h1>Submit a Message to Blockchain ✨</h1>

			{#if error}
				<div class="error-state">
					<div class="error-icon">⚠️</div>
					<h2>Wallet Connection Failed</h2>
					<p>{error}</p>
					<button
						on:click={() => {
							invalidateAll();
						}}
						class="btn-primary"
					>
						Retry Connection
					</button>
				</div>
			{:else if form?.success}
				<div class="success-state">
					<div class="success-icon">✓</div>
					<h2>Message Sent to Blockchain!</h2>
					<p>Your message has been submitted to the BSV blockchain:</p>
					<blockquote>{form.message}</blockquote>
					<div class="tx-info">
						<p><strong>Transaction ID:</strong></p>
						<p class="txid">{form.txid}</p>
					</div>
					<button
						on:click={() => {
							form = null;
						}}
						class="btn-secondary"
					>
						Send Another Message
					</button>
				</div>
			{:else if walletConnected}
				<div class="wallet-connected">
					<div class="success-icon small">✓</div>
					<p>Wallet connected! Ready to submit messages.</p>
				</div>
				
				<form
					method="POST"
					use:enhance={() => {
						submitting = true;
						return async ({ update }) => {
							submitting = false;
							await update();
						};
					}}
					class="message-form"
				>
					<div class="form-group">
						<label for="message">Your Message</label>
						<input
							id="message"
							name="message"
							type="text"
							bind:value={message}
							placeholder="Share your thoughts on the blockchain..."
							required
							disabled={submitting}
						/>
					</div>

					{#if form?.error}
						<div class="error-message">
							{form.error}
						</div>
					{/if}

					<button type="submit" class="btn-primary" disabled={submitting}>
						{#if submitting}
							<div class="spinner"></div>
							<span>Submitting to Blockchain...</span>
						{:else}
							<span>Send to Blockchain</span>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M22 2L11 13"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M22 2L15 22L11 13L2 9L22 2Z"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						{/if}
					</button>
				</form>
			{:else}
				<div class="loading-state">
					<div class="spinner"></div>
					<p>Connecting to wallet...</p>
				</div>
			{/if}
		</div>

		<div class="messages-container">
			<div class="messages-header">
				<h2>📝 Your Messages</h2>
				<div class="live-indicator">
					<div class="pulse"></div>
					<span>LIVE</span>
				</div>
			</div>
			<div class="messages-content">
				{#if !walletConnected}
					<div class="empty-state">
						<p>Please connect your wallet to view your messages.</p>
					</div>
				{:else if messages.length === 0}
					<div class="empty-state">
						<p>No messages found yet.</p>
						<p>Submit your first message to the blockchain!</p>
					</div>
				{:else}
					{#each messages as messageItem (messageItem.txid || Math.random())}
						<div class="message-item">
							<div class="message-header">
								<span class="message-type">TX: {messageItem.txid.substring(0, 8)}...{messageItem.txid.slice(-8)}</span>
								<span class="message-value">{messageItem.satoshis} sats</span>
							</div>
							{#if messageItem.description}
								<div class="message-content">
									{messageItem.description}
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
</main>

<style>
	/* === GLOBAL STYLES === */
	main {
		min-height: 100vh;
		background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 25%, #8b5cf6 75%, #ec4899 100%);
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		padding: 2rem;
	}

	/* === LAYOUT === */
	.page-container {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		align-items: start;
	}

	/* === SHARED CARD STYLES === */
	.container,
	.messages-container {
		background: rgba(255, 255, 255, 0.95);
		border-radius: 20px;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
		backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.container {
		padding: 3rem;
		text-align: center;
	}

	.messages-container {
		overflow: hidden;
	}

	/* === TYPOGRAPHY === */
	h1 {
		font-size: 2rem;
		font-weight: 700;
		color: #1f2937;
		margin-bottom: 2rem;
		text-align: center;
	}

	h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: white;
		margin-bottom: 1rem;
	}

	p {
		color: #718096;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	/* === FORM STYLES === */
	.message-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-top: 2rem;
	}

	.form-group {
		text-align: left;
	}

	label {
		display: block;
		font-weight: 600;
		color: #4a5568;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	input {
		width: 100%;
		padding: 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 12px;
		font-size: 1rem;
		background: #f8fafc;
		box-sizing: border-box;
		transition: all 0.3s ease;
	}

	input:focus {
		outline: none;
		border-color: #3b82f6;
		background: white;
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
		transform: translateY(-1px);
	}

	input::placeholder {
		color: #a0aec0;
	}
	/* === BUTTON STYLES === */
	.btn-primary {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
	}

	.btn-primary:active {
		transform: translateY(0);
	}

	.btn-primary:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: #f7fafc;
		color: #4a5568;
		border: 2px solid #e2e8f0;
		padding: 0.8rem 1.5rem;
		border-radius: 12px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 1rem;
	}

	.btn-secondary:hover {
		background: #edf2f7;
		border-color: #cbd5e0;
		transform: translateY(-1px);
	}

	/* === STATE STYLES === */
	.success-state,
	.error-state,
	.loading-state,
	.wallet-connected {
		text-align: center;
		animation: fadeIn 0.5s ease-in;
	}

	.success-icon,
	.error-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		font-weight: bold;
		color: white;
		margin: 0 auto 1.5rem;
		animation: bounce 0.6s ease-in-out;
	}

	.success-icon.small {
		width: 40px;
		height: 40px;
		font-size: 1rem;
		margin: 0 auto 0.5rem;
	}

	.success-icon {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	}

	.error-icon {
		background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
	}

	.loading-state {
		padding: 2rem;
	}

	.wallet-connected {
		margin-bottom: 1rem;
		padding: 1rem;
		background: #f0f9ff;
		border: 1px solid #0ea5e9;
		border-radius: 12px;
	}

	blockquote {
		background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
		padding: 1.5rem;
		border-radius: 12px;
		border-left: 4px solid #667eea;
		margin: 1.5rem 0;
		font-style: italic;
		color: #2d3748;
		line-height: 1.6;
	}

	.tx-info {
		background: #f7fafc;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
		padding: 1rem;
		margin: 1rem 0;
		text-align: left;
	}

	.tx-info p {
		margin: 0.25rem 0;
	}

	.txid {
		font-family: 'Courier New', monospace;
		font-size: 0.8rem;
		word-break: break-all;
		background: #edf2f7;
		padding: 0.5rem;
		border-radius: 4px;
		color: #2d3748;
	}

	.error-message {
		background: #fed7d7;
		color: #c53030;
		padding: 0.8rem;
		border-radius: 8px;
		font-size: 0.9rem;
		text-align: center;
		border: 1px solid #feb2b2;
	}

	/* === MESSAGES STYLES === */
	.messages-header {
		background: linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #db2777 100%);
		color: white;
		padding: 1.5rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.messages-header h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
	}

	.live-indicator {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.pulse {
		width: 8px;
		height: 8px;
		background: white;
		border-radius: 50%;
		animation: pulse 2s infinite;
	}

	.messages-content {
		max-height: 500px;
		overflow-y: auto;
		padding: 1rem;
	}

	.message-item {
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 1rem;
		margin-bottom: 0.75rem;
		animation: slideIn 0.3s ease-out;
		transition: all 0.2s ease;
	}

	.message-item:hover {
		background: #f1f5f9;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.message-item:last-child {
		margin-bottom: 0;
	}

	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.8rem;
	}

	.message-type {
		font-weight: 600;
		color: #667eea;
		background: #e6edff;
		padding: 0.2rem 0.5rem;
		border-radius: 6px;
	}

	.message-value {
		color: #059669;
		font-weight: 600;
		font-family: 'Courier New', monospace;
	}

	.message-content {
		color: #2d3748;
		line-height: 1.4;
		text-align: left;
		margin-bottom: 0.5rem;
		background: #f0f9ff;
		padding: 0.75rem;
		border-radius: 8px;
		border-left: 3px solid #0ea5e9;
	}

	.message-footer {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		margin-top: 0.5rem;
		gap: 0.5rem;
	}

	.txid-label,
	.output-index {
		background: #e2e8f0;
		color: #4a5568;
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: 'Courier New', monospace;
		font-size: 0.7rem;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #718096;
	}

	.empty-state p {
		margin: 0.5rem 0;
	}

	/* === LOADING SPINNER === */
	.spinner {
		width: 24px;
		height: 24px;
		border: 3px solid rgba(102, 126, 234, 0.3);
		border-radius: 50%;
		border-top: 3px solid #667eea;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	/* === ANIMATIONS === */
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes bounce {
		0%, 20%, 53%, 80%, 100% {
			transform: translate3d(0, 0, 0);
		}
		40%, 43% {
			transform: translate3d(0, -8px, 0);
		}
		70% {
			transform: translate3d(0, -4px, 0);
		}
		90% {
			transform: translate3d(0, -2px, 0);
		}
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.7;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* === RESPONSIVE DESIGN === */
	@media (max-width: 768px) {
		.page-container {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		main {
			padding: 1rem;
		}

		.container {
			padding: 2rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.messages-content {
			max-height: 300px;
		}
	}
</style>
