<script lang="ts">
	import GithubCorner from "./common/GithubCorner.svelte";
	import Installer from "./common/Installer.svelte";
	import Game from "./components/Game.svelte";
</script>

<svelte:head>
	<!-- Material Icons -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/icon?family=Material+Icons"
	/>
	<!-- Roboto -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700"
	/>
	<!-- Roboto Mono -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css?family=Roboto+Mono"
	/>
</svelte:head>

<GithubCorner href="https://github.com/loremdipso/YAN2048_Svelte" />

<main class="fade-in">
	<Game />
	<Installer />
</main>

<style lang="scss">
	:global(html, body, main) {
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	main {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.fade-in {
		animation: 1s ease-out 0s 1 FadeIn;
	}
	@keyframes FadeIn {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}
</style>
