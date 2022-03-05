<script lang="ts">
	import { onMount } from "svelte";

	function getPWADisplayMode() {
		const isStandalone = window.matchMedia(
			"(display-mode: standalone)"
		).matches;
		if (document.referrer.startsWith("android-app://")) {
			return "twa";
		} else if ((navigator as any).standalone || isStandalone) {
			return "standalone";
		}
		return "browser";
	}

	let show_install_button = getPWADisplayMode() === "browser";
	let deferred_prompt;

	onMount(() => {
		// install the service worker
		if (!isDebug && "serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				navigator.serviceWorker
					.register("./service-worker.js")
					.then((reg) => {
						console.log("Service worker registered.", reg);
					});
			});
		}

		// see if we can install in this context
		window.addEventListener("beforeinstallprompt", (e) => {
			e.preventDefault();
			deferred_prompt = e;
		});
	});

	function install() {
		show_install_button = false;
		if (deferred_prompt) {
			deferred_prompt.prompt();
			deferred_prompt.userChoice.then((choice) => {
				if (choice.outcome === "accepted") {
					console.log("yay!");
				}
				deferred_prompt = null;
			});
		}
	}

	function close() {
		show_install_button = false;
	}

	const button_classes =
		"false flex items-center justify-center gap-1 font-bold outline-none uppercase tracking-wider focus:outline-none focus:shadow-none transition-all duration-300 rounded-full py-2.5 px-6 text-xs leading-normal bg-transparent border border-solid shadow-none text-light-blue-500 border-light-blue-500 hover:bg-light-blue-50 hover:border-light-blue-700 hover:text-light-blue-700 hover:bg-light-blue-50 active:bg-light-blue-100";
</script>

{#if show_install_button && deferred_prompt}
	<div class="installer slide-in-from-bottom p-2 flex rounded-full">
		<button class={button_classes} on:click={() => install()}
			>install</button
		>
		<button class={button_classes} on:click={() => close()}>X</button>
	</div>
{/if}

<style lang="scss">
	.installer {
		background: black;
		color: white;
		position: absolute;
		bottom: 0;
		right: 0;
	}
</style>
