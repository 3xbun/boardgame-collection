<template>
	<main class="admin-view">
		<header class="admin-header">
			<div>
				<router-link to="/" class="back-link">
					<i class="fa-duotone fa-chevron-left"></i>
					<span>{{ $t('backToCollection') }}</span>
				</router-link>
				<h1>{{ $t('adminCollection') }}</h1>
				<p>{{ $t('adminSubtitle') }}</p>
			</div>
			<button v-if="authenticated" class="logout-btn" @click="logout">
				<i class="fa-duotone fa-arrow-right-from-bracket"></i>
				<span>{{ $t('logout') }}</span>
			</button>
		</header>

		<section v-if="!authenticated" class="admin-panel login-panel">
			<i class="fa-duotone fa-shield-keyhole panel-icon"></i>
			<h2>{{ $t('adminLogin') }}</h2>
			<form @submit.prevent="login">
				<label for="admin-password">{{ $t('password') }}</label>
				<input
					id="admin-password"
					v-model="password"
					type="password"
					autocomplete="current-password"
					:placeholder="$t('enterPassword')"
					autofocus
				/>
				<button class="primary-btn" type="submit">
					<i class="fa-duotone fa-lock-open"></i>
					<span>{{ $t('login') }}</span>
				</button>
			</form>
		</section>

		<template v-else>
			<section class="admin-panel form-panel">
				<div class="section-heading">
					<div>
						<span class="eyebrow">{{ $t('newGame') }}</span>
						<h2>{{ $t('addFromBgg') }}</h2>
					</div>
				</div>

				<div class="search-box">
					<i v-if="!searching" class="fa-duotone fa-magnifying-glass"></i>
					<i v-else class="fa-duotone fa-spinner spin-loader"></i>
					<input v-model="searchText" :placeholder="$t('searchBgg')" @input="search" />
				</div>
				<ul v-if="searchText && results.length" class="search-results">
					<li v-for="item in results" :key="item.id" @click="selectGame(item)">
						<img v-if="item.thumbnail || item.image" :src="item.thumbnail || item.image" :alt="item.name?.value || 'Board game'" />
						<span>{{ item.name?.value }}</span>
						<small v-if="item.yearpublished">{{ item.yearpublished.value }}</small>
					</li>
				</ul>
				<div v-if="selectedGame" class="selected-game">
					<div><strong>{{ gameName(selectedGame) }}</strong><span>BGG #{{ selectedGame.id }}</span></div>
					<button class="primary-btn" :disabled="saving" @click="addSelectedGame">
						<i v-if="saving" class="fa-duotone fa-spinner spin-loader"></i>
						<i v-else class="fa-duotone fa-circle-plus"></i>
						<span>{{ $t('addThisGame') }}</span>
					</button>
				</div>
			</section>

			<section class="admin-panel collection-panel">
				<div class="section-heading">
					<div>
						<span class="eyebrow">{{ $t('page') }} {{ pageNumber }}</span>
						<h2>{{ $t('database') }}</h2>
					</div>
					<button class="quiet-btn" @click="loadGames" :disabled="loading">
						<i class="fa-duotone fa-arrows-rotate" :class="{ spin: loading }"></i>
						<span>{{ $t('refresh') }}</span>
					</button>
				</div>
				<div v-if="!loading && games.length" class="pagination">
					<button class="quiet-btn" :disabled="pageNumber === 1" @click="loadGames(pageNumber - 1)">
						<i class="fa-duotone fa-chevron-left"></i><span>{{ $t('previous') }}</span>
					</button>
					<span>{{ $t('page') }} {{ pageNumber }}</span>
					<button class="quiet-btn" :disabled="!hasNext" @click="loadGames(pageNumber + 1)">
						<span>{{ $t('next') }}</span><i class="fa-duotone fa-chevron-right"></i>
					</button>
				</div>

				<div v-if="loading" class="empty-admin">{{ $t('loadingData') }}</div>
				<div v-else-if="games.length === 0" class="empty-admin">{{ $t('noGameData') }}</div>
				<div v-else class="table-wrap">
					<table>
						<thead><tr><th>{{ $t('gameName') }}</th><th>BGG ID</th><th>{{ $t('playerCount') }}</th><th>{{ $t('time') }}</th><th>{{ $t('played') }}</th><th></th></tr></thead>
						<tbody>
							<tr v-for="game in sortedGames" :key="game.Id">
								<td class="game-cell">
									<img v-if="game.Image" :src="game.Image" :alt="game.Name" />
									<span>{{ game.Name }}</span>
								</td>
								<td>{{ game.BGG_ID }}</td>
								<td>{{ game.Player || "-" }}</td>
								<td>{{ game.Playtime || 0 }} {{ $t('minutes') }}</td>
								<td>{{ game.Played || 0 }}</td>
								<td class="row-actions">
									<button class="icon-btn danger-btn" :title="$t('delete')" @click="removeGame(game)"><i class="fa-duotone fa-trash"></i></button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</template>
	</main>
</template>

<script setup>
import axios from "axios";
import { computed, onMounted, ref } from "vue";
import { getBoardGame, searchBoardGames } from "../bggApi.js";
import { addGame, deleteGame, listGames } from "../nocoApi.js";
import { showToast } from "../toast.js";
import { i18n } from "../i18n.js";

const ADMIN_PASSWORD = "bgg";
const authenticated = ref(sessionStorage.getItem("admin_authenticated") === "true");
const password = ref("");
const games = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchText = ref("");
const results = ref([]);
const selectedGame = ref(null);
const searching = ref(false);
const pageNumber = ref(1);
const hasNext = ref(false);
const pageSize = 25;
let searchTimeout;
const sortedGames = computed(() =>
	[...games.value].sort((first, second) =>
		String(first.Name || "").localeCompare(String(second.Name || ""), undefined, {
			sensitivity: "base",
		}),
	),
);

const login = () => {
	if (password.value !== ADMIN_PASSWORD) {
		showToast(i18n.global.t("wrongPassword"), "error");
		return;
	}
	authenticated.value = true;
	sessionStorage.setItem("admin_authenticated", "true");
	password.value = "";
	loadGames();
};

const logout = () => {
	authenticated.value = false;
	sessionStorage.removeItem("admin_authenticated");
};

const loadGames = (page = 1) => {
	loading.value = true;
	listGames({ limit: pageSize, offset: (page - 1) * pageSize }).then(({ games: pageGames, hasNext: nextPage }) => {
		games.value = pageGames;
		pageNumber.value = page;
		hasNext.value = nextPage;
	}).catch(() => showToast(i18n.global.t("loadError"), "error")).finally(() => { loading.value = false; });
};

const search = () => {
	clearTimeout(searchTimeout);
	if (!searchText.value.trim()) {
		results.value = [];
		return;
	}
	searching.value = true;
	searchTimeout = setTimeout(() => {
		searchBoardGames(searchText.value).then((items) => { results.value = items; }).catch(() => showToast(i18n.global.t("searchNotSuccessful"), "error")).finally(() => { searching.value = false; });
	}, 400);
};

const selectGame = (item) => {
	searchText.value = item.name?.value || "";
	results.value = [];
	getBoardGame(item.id).then((details) => { selectedGame.value = details || { ...item, name: item.name?.value }; }).catch(() => { selectedGame.value = { ...item, name: item.name?.value }; });
};

const gameName = (game) => {
	const names = Array.isArray(game?.name) ? game.name : [game?.name];
	return names.find((item) => item?.type === "primary")?.value || names[0]?.value || i18n.global.t("unknownGameName");
};

const extractTags = (game) => {
	const links = game?.link;
	if (!Array.isArray(links)) return "";
	return links.filter((link) => link.type === "boardgamecategory" || link.type === "boardgamemechanic").map((link) => link.value).join(", ");
};

const addSelectedGame = () => {
	if (!selectedGame.value) return;
	saving.value = true;
	const game = selectedGame.value;
	const name = gameName(game);
	const minPlayers = game.minplayers?.value || 0;
	const maxPlayers = game.maxplayers?.value || minPlayers;
	addGame({ BGG_ID: game.id, Name: name, Image: game.image, Playtime: game.playingtime?.value || 0, Player: `${minPlayers}-${maxPlayers}`, Played: 0, Tags: extractTags(game) }).then(() => {
		showToast(i18n.global.t("gameAddedShort"), "success");
		selectedGame.value = null;
		searchText.value = "";
		loadGames();
	}).catch(() => showToast(i18n.global.t("addGameError"), "error")).finally(() => { saving.value = false; });
};

const removeGame = (game) => {
	if (!window.confirm(i18n.global.t("confirmDelete", { name: game.Name }))) return;
	deleteGame(game.Id).then(() => {
		games.value = games.value.filter((item) => item.Id !== game.Id);
		showToast(i18n.global.t("deleted"), "success");
	}).catch(() => showToast(i18n.global.t("deleteError"), "error"));
};

onMounted(() => {
	if (authenticated.value) loadGames();
});
</script>

<style scoped>
.admin-view { display: flex; flex-direction: column; gap: 1.5rem; text-align: left; }
.admin-header, .section-heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.back-link { display: inline-flex; align-items: center; gap: .4rem; font-size: .85rem; margin-bottom: .8rem; }
h1 { font-size: 1.6rem; font-weight: 800; }
.admin-header p { color: var(--text-secondary); font-size: .85rem; }
.admin-panel { background: rgba(255,255,255,.035); border: 1px solid rgba(255,255,255,.08); border-radius: var(--radius-lg); padding: 1.25rem; }
.login-panel { max-width: 420px; width: 100%; margin: 2rem auto; text-align: center; }
.panel-icon { color: var(--secondary); font-size: 2.5rem; margin-bottom: .75rem; }
h2 { font-size: 1.15rem; font-weight: 750; }
.login-panel form { display: flex; flex-direction: column; gap: .65rem; text-align: left; margin-top: 1.25rem; }
label { color: var(--text-secondary); font-size: .8rem; font-weight: 600; }
input { width: 100%; margin-top: .3rem; padding: .65rem .75rem; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: rgba(0,0,0,.2); color: var(--text-primary); font: inherit; }
input:focus { outline: 2px solid var(--border-focus); outline-offset: 1px; }
.primary-btn { background: var(--primary); color: white; }
.primary-btn:hover { background: var(--primary-hover); }
.logout-btn, .quiet-btn { background: rgba(255,255,255,.06); color: var(--text-secondary); }
.quiet-btn:hover, .logout-btn:hover { color: var(--text-primary); background: rgba(255,255,255,.1); }
.form-panel { display: flex; flex-direction: column; gap: 1.25rem; }
.search-box { display: flex; align-items: center; gap: .7rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: .15rem .8rem; background: rgba(0,0,0,.2); color: var(--secondary); }
.search-box input { border: 0; margin: 0; background: transparent; }
.search-box input:focus { outline: 0; }
.search-results { list-style: none; border: 1px solid var(--border-color); border-radius: var(--radius-sm); overflow: hidden; margin-top: -.8rem; }
.search-results li { display: flex; justify-content: space-between; gap: 1rem; padding: .7rem .8rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,.06); }
.search-results li:last-child { border-bottom: 0; }
.search-results li:hover { background: rgba(99,102,241,.15); }
.search-results img, .game-cell img { width: 38px; height: 48px; border-radius: 3px; object-fit: cover; flex: 0 0 auto; background: var(--bg-surface); }
.search-results span { flex: 1; align-self: center; }
.search-results small, .selected-game > div span { color: var(--text-muted); }
.selected-game .primary-btn, .selected-game .primary-btn span { color: white; }
.selected-game { display: flex; align-items: center; justify-content: space-between; gap: 1rem; padding: .9rem; border: 1px solid rgba(6,182,212,.35); border-radius: var(--radius-md); background: rgba(6,182,212,.08); }
.selected-game div { display: flex; flex-direction: column; gap: .15rem; }
.pagination { display: flex; align-items: center; justify-content: center; gap: .9rem; margin-top: 1rem; }
.pagination > span { color: var(--text-secondary); font-size: .82rem; min-width: 4rem; text-align: center; }
.eyebrow { color: var(--secondary); font-size: .7rem; font-weight: 700; text-transform: uppercase; }
.game-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: .9rem; }
.form-submit { grid-column: 1 / -1; justify-self: start; }
.table-wrap { overflow-x: auto; margin-top: 1rem; }
table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: .82rem; }
th:nth-child(1), td:nth-child(1) { width: 45%; }
th:nth-child(2), td:nth-child(2) { width: 13%; }
th:nth-child(3), td:nth-child(3) { width: 11%; }
th:nth-child(4), td:nth-child(4) { width: 13%; }
th:nth-child(5), td:nth-child(5) { width: 8%; }
th:nth-child(6), td:nth-child(6) { width: 10%; }
th { color: var(--text-muted); font-size: .7rem; text-align: left; text-transform: uppercase; }
th, td { padding: .75rem .5rem; border-bottom: 1px solid rgba(255,255,255,.07); }
td:first-child { color: var(--text-primary); font-weight: 650; }
.game-cell { width: 100% !important;display: flex; align-items: center; gap: .65rem; }
.game-cell span { flex: 1 1 auto; min-width: 0; overflow-wrap: break-word; }
.row-actions { white-space: nowrap; text-align: right; }
.icon-btn { padding: .45rem; background: transparent; color: var(--secondary); }
.icon-btn:hover { background: rgba(6,182,212,.12); }
.danger-btn { color: var(--danger); }
.danger-btn:hover { background: rgba(239,68,68,.12); }
.empty-admin { color: var(--text-muted); padding: 2rem 0; text-align: center; }
.spin { animation: spin 1s linear infinite; }
@media (max-width: 560px) {
	.admin-header { flex-direction: column; }
	.game-form { grid-template-columns: 1fr; }
	.form-submit { grid-column: auto; }
	table { font-size: .76rem; }
	th:nth-child(2), td:nth-child(2), th:nth-child(5), td:nth-child(5) { display: none; }
	th:nth-child(1), td:nth-child(1) { width: 62%; }
	th:nth-child(3), td:nth-child(3) { width: 14%; }
	th:nth-child(4), td:nth-child(4) { width: 14%; }
	th:nth-child(6), td:nth-child(6) { width: 10%; }
}
</style>
