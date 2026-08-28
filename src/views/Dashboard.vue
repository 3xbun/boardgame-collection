<template>
  <div class="dashboard-view">
    <!-- Header Area -->
    <header class="dashboard-header">
      <div class="brand">
        <div class="icon-glow">
          <i class="fa-duotone fa-game-board-simple header-icon"></i>
        </div>
        <div>
          <h1>{{ $t('collection') }}</h1>
          <p class="subtitle">{{ $t('collectionSubtitle') }}</p>
        </div>
      </div>
      <router-link to="/admin" class="add-btn">
        <i class="fa-duotone fa-plus"></i>
        <span>{{ $t('addGame') }}</span>
      </router-link>
    </header>

    <!-- BoardGame Modal Details Component -->
    <BoardGame :objectid="bgID" v-if="showModal" />

    <!-- Stats Dashboard Widget -->
    <div class="stats-panel">
      <div class="stat-card">
        <span class="stat-label">{{ $t('systemGames') }}</span>
        <span class="stat-value"
          >{{ DB.length }} <small>{{ $t('gamesUnit') }}</small></span
        >
      </div>
      <div class="stat-card">
        <span class="stat-label">{{ $t('totalPlayed') }}</span>
        <span class="stat-value text-gold"
          >{{ totalPlays }} <small>{{ $t('playsUnit') }}</small></span
        >
      </div>
    </div>

    <!-- Sorting Selection Chips -->
    <div class="sort-section">
      <span class="sort-title">{{ $t('sortBy') }}</span>
      <div class="sort-chips">
        <button
          :class="['sort-chip', sortBy === 'alphabetically' ? 'active' : '']"
          @click="handleSort('alphabetically')"
        >
          <i class="fa-duotone fa-font"></i>
          <span>{{ $t('gameName') }}</span>
          <span v-if="sortBy === 'alphabetically'" class="arrow-indicator">
            <i
              v-if="sortOrder === 'asc'"
              class="fa-duotone fa-arrow-down-a-z"
            ></i>
            <i v-else class="fa-duotone fa-arrow-up-a-z"></i>
          </span>
        </button>

        <button
          :class="['sort-chip', sortBy === 'played' ? 'active' : '']"
          @click="handleSort('played')"
        >
          <i class="fa-duotone fa-gamepad"></i>
          <span>{{ $t('played') }}</span>
          <span v-if="sortBy === 'played'" class="arrow-indicator">
            <i
              v-if="sortOrder === 'asc'"
              class="fa-duotone fa-arrow-down-1-9"
            ></i>
            <i v-else class="fa-duotone fa-arrow-up-1-9"></i>
          </span>
        </button>

        <button
          :class="['sort-chip', sortBy === 'playtime' ? 'active' : '']"
          @click="handleSort('playtime')"
        >
          <i class="fa-duotone fa-clock"></i>
          <span>{{ $t('playtime') }}</span>
          <span v-if="sortBy === 'playtime'" class="arrow-indicator">
            <i
              v-if="sortOrder === 'asc'"
              class="fa-duotone fa-arrow-down-1-9"
            ></i>
            <i v-else class="fa-duotone fa-arrow-up-1-9"></i>
          </span>
        </button>

        <button
          :class="['sort-chip', sortBy === 'players' ? 'active' : '']"
          @click="handleSort('players')"
        >
          <i class="fa-duotone fa-users"></i>
          <span>{{ $t('players') }}</span>
          <span v-if="sortBy === 'players'" class="arrow-indicator">
            <i
              v-if="sortOrder === 'asc'"
              class="fa-duotone fa-arrow-down-1-9"
            ></i>
            <i v-else class="fa-duotone fa-arrow-up-1-9"></i>
          </span>
        </button>
      </div>
    </div>

    <!-- Boardgames Cards Grid -->
    <div v-if="DB.length === 0" class="empty-state">
      <i class="fa-duotone fa-box-open-full empty-icon"></i>
      <h3>{{ $t('noGames') }}</h3>
      <p>{{ $t('emptyHint') }}</p>
      <router-link to="/admin" class="add-btn inline-add">
        <i class="fa-duotone fa-plus"></i>
        <span>{{ $t('firstGame') }}</span>
      </router-link>
    </div>

    <div v-else class="cards-grid">
      <div
        v-for="item in filterDB"
        :key="item.Id"
        :ref="setCardRef"
        :data-game-id="item.Id"
        :class="['game-card', { 'is-visible': visibleCards.has(item.Id) }]"
      >
        <!-- Game Thumbnail with Cover fit & Hover Zoom -->
        <div class="card-image-wrapper" @click="openModal(item.BGG_ID)">
          <img
            :src="item.Image || '/placeholder-game.png'"
            class="card-image"
            alt="Game image"
            loading="lazy"
            decoding="async"
          />
          <div class="image-overlay">
            <span class="overlay-text"
              ><i class="fa-duotone fa-magnifying-glass-plus"></i>
              {{ $t('details') }}</span
            >
          </div>
          <div v-if="Number(item.Played) > 0" class="played-badge">
            <i class="fa-duotone fa-award"></i> {{ item.Played }}
          </div>
          <div
            v-if="gameLanguage(item)"
            class="language-badge"
            :title="$t('languageBadge', { language: gameLanguageLabel(item) })"
          >
            <img
              class="flag"
              :src="gameFlagImage(item)"
              :alt="gameLanguageLabel(item)"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>

        <div class="card-content">
          <h3 class="game-title" @click="openModal(item.BGG_ID)">
            {{ item.Name }}
          </h3>

          <!-- Details Rows -->
          <div class="game-meta">
            <div class="meta-item">
              <i class="fa-duotone fa-users text-cyan"></i>
              <span>{{ item.Player }} {{ $t('people') }}</span>
            </div>
            <div class="meta-item">
              <i class="fa-duotone fa-clock text-violet"></i>
              <span>{{ item.Playtime }} {{ $t('minutes') }}</span>
            </div>
            <div class="meta-item">
              <i class="fa-duotone fa-gamepad text-emerald"></i>
              <span
                >{{ $t('playedLabel') }}
                <strong class="text-white">{{ item.Played }}</strong>
                {{ $t('playsUnit') }}</span
              >
            </div>
          </div>

          <!-- Interactive Action Button Group -->
          <div class="card-actions">
            <button
              class="action-btn view-btn"
              @click="openModal(item.BGG_ID)"
              :title="$t('viewMore')"
            >
              <i class="fa-duotone fa-eye"></i>
              <span>{{ $t('view') }}</span>
            </button>
            <button
              class="action-btn play-btn"
              :disabled="playLoadingId === item.Id"
              @click="play(item.Id, item.Name)"
              :title="$t('playLogTitle')"
            >
              <i
                v-if="playLoadingId === item.Id"
                class="fa-duotone fa-spinner spin-loader"
              ></i>
              <i v-else class="fa-duotone fa-play"></i>
              <span>{{ $t('play') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, provide, ref } from "vue";
import axios from "axios";
import BoardGame from "../components/BoardGame.vue";
import { showToast } from "../toast.js";
import { i18n } from "../i18n.js";
import { listGames, updateGame } from "../nocoApi.js";

const bgID = ref("");
const showModal = ref(false);
provide("showModal", showModal);

const DB = ref([]);
const sortBy = ref("alphabetically");
const sortOrder = ref("asc");
const playLoadingId = ref(null);
const visibleCards = ref(new Set());
let cardObserver;

const setCardRef = (element) => {
  if (!element || !cardObserver) return;
  cardObserver.observe(element);
};

const observeCards = () => {
  if (!("IntersectionObserver" in window)) {
    visibleCards.value = new Set(DB.value.map((item) => item.Id));
    return;
  }

  cardObserver = new IntersectionObserver(
    (entries) => {
      const nextVisibleCards = new Set(visibleCards.value);
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          nextVisibleCards.add(Number(entry.target.dataset.gameId));
          cardObserver.unobserve(entry.target);
        }
      });
      visibleCards.value = nextVisibleCards;
    },
    { rootMargin: "0px 0px 180px", threshold: 0.1 },
  );
};

const totalPlays = computed(() => {
  return DB.value.reduce((sum, item) => sum + (Number(item.Played) || 0), 0);
});

const gameLanguage = (item) => {
  const lang = String(item.Language || "").toLowerCase();
  return lang === "th" || lang === "en" ? lang : null;
};

const gameFlagImage = (item) => {
  return gameLanguage(item) === "th"
    ? "https://flagsapi.com/TH/flat/64.png"
    : "https://flagsapi.com/GB/flat/64.png";
};

const gameLanguageLabel = (item) => {
  const lang = gameLanguage(item);
  return lang === "th" ? i18n.global.t("thai") : i18n.global.t("english");
};

const openModal = (bggId) => {
  bgID.value = bggId;
  showModal.value = true;
};

const handleSort = (criteria) => {
  if (sortBy.value === criteria) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = criteria;
    if (criteria === "played" || criteria === "playtime") {
      sortOrder.value = "desc";
    } else {
      sortOrder.value = "asc";
    }
  }
};

const filterDB = computed(() => {
  const multiplier = sortOrder.value === "asc" ? 1 : -1;

  return [...DB.value].sort((a, b) => {
    if (sortBy.value === "alphabetically") {
      const nameA = a.Name || "";
      const nameB = b.Name || "";
      if (nameA < nameB) return -1 * multiplier;
      if (nameA > nameB) return 1 * multiplier;
      return 0;
    } else if (sortBy.value === "played") {
      const playedA = Number(a.Played) || 0;
      const playedB = Number(b.Played) || 0;
      if (playedA < playedB) return -1 * multiplier;
      if (playedA > playedB) return 1 * multiplier;
      return 0;
    } else if (sortBy.value === "playtime") {
      const playtimeA = Number(a.Playtime) || 0;
      const playtimeB = Number(b.Playtime) || 0;
      if (playtimeA < playtimeB) return -1 * multiplier;
      if (playtimeA > playtimeB) return 1 * multiplier;
      return 0;
    } else if (sortBy.value === "players") {
      const playerA = Number(a.Player ? a.Player.split("-")[0] : 0) || 0;
      const playerB = Number(b.Player ? b.Player.split("-")[0] : 0) || 0;
      if (playerA < playerB) return -1 * multiplier;
      if (playerA > playerB) return 1 * multiplier;
      return 0;
    }
    return 0;
  });
});

const play = (id, gameName) => {
  playLoadingId.value = id;
  const item = DB.value.find((game) => game.Id === id);
  const played = (Number(item?.Played) || 0) + 1;
  updateGame(id, { Played: played }).then(() => {
      // Find item in DB and increment Played reactively
      if (item) {
        item.Played = played;
        // Update local storage to persist immediately
        localStorage.setItem("BoardgameDB", JSON.stringify(DB.value));
      }
      playLoadingId.value = null;
      showToast(
        i18n.global.t("playLogged", { name: gameName }),
        "success",
      );

      // Silently sync with backend database in the background
      fetchCollectionSilently();
    })
    .catch((err) => {
      console.error(err);
      playLoadingId.value = null;
      showToast(i18n.global.t("saveError"), "error");
    });
};

const fetchCollectionSilently = () => {
  listGames({ limit: 1000 }).then(({ games }) => {
    DB.value = games;
    localStorage.setItem("BoardgameDB", JSON.stringify(games));
  });
};

onMounted(() => {
  observeCards();
  if (localStorage.getItem("BoardgameDB")) {
    DB.value = JSON.parse(localStorage.getItem("BoardgameDB"));
  }

  listGames({ limit: 1000 }).then(({ games }) => {
    DB.value = games;
    localStorage.setItem("BoardgameDB", JSON.stringify(games));
  });
});

onBeforeUnmount(() => {
  cardObserver?.disconnect();
});
</script>

<style scoped>
.dashboard-view {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
  text-align: left;
}

/* Header design */
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-glow {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
  width: 3rem;
  height: 3rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}

.header-icon {
  font-size: 1.5rem;
  color: var(--primary);
}

h1 {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #ffffff 40%, var(--primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.subtitle {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.add-btn {
  background: linear-gradient(
    135deg,
    var(--primary) 0%,
    var(--primary-hover) 100%
  );
  color: white;
  padding: 0.6rem 1.15rem;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px var(--primary-glow);
  transition: all var(--transition-fast);
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
  color: white;
}

.add-btn:active {
  transform: translateY(0);
}

/* Stats Widgets */
.stats-panel {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
}

.stat-value small {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-weight: 500;
}

.text-gold {
  color: var(--warning);
}

/* Sorting section */
.sort-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sort-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sort-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.sort-chip {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  padding: 0.45rem 0.85rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: all var(--transition-fast);
}

.sort-chip:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--text-primary);
  border-color: rgba(255, 255, 255, 0.15);
}

.sort-chip.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  box-shadow: 0 4px 10px var(--primary-glow);
  font-weight: 600;
}

.arrow-indicator {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
}

/* Empty State */
.empty-state {
  padding: 3rem 1rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed var(--border-color);
  border-radius: var(--radius-lg);
}

.empty-icon {
  font-size: 3rem;
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 1.1rem;
  font-weight: 700;
}

.empty-state p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  max-width: 320px;
}

.inline-add {
  margin-top: 0.5rem;
}

/* Cards Grid Layout */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}

.game-card {
  background: rgba(15, 23, 42, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  opacity: 0;
  transform: translateY(1rem) scale(0.98);
}

.game-card.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.game-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.25);
  box-shadow:
    0 12px 20px -8px var(--primary-glow),
    0 4px 6px -2px rgba(0, 0, 0, 0.5);
  background: rgba(30, 41, 59, 0.3);
}

@media (prefers-reduced-motion: reduce) {
  .game-card,
  .game-card.is-visible {
    opacity: 1;
    transform: none;
    transition: none;
  }
}

/* Thumbnail Wrapper with Overlay */
.card-image-wrapper {
  position: relative;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  cursor: pointer;
  background: #090d16;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-normal);
}

.game-card:hover .card-image {
  transform: scale(1.06);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(11, 15, 25, 0.6);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity var(--transition-fast);
}

.card-image-wrapper:hover .image-overlay {
  opacity: 1;
}

.overlay-text {
  color: white;
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.played-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(245, 158, 11, 0.95);
  color: #0f172a;
  padding: 0.15rem 0.45rem;
  border-radius: 2rem;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.language-badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  background: rgba(11, 15, 25, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  width: 1.35rem;
  height: 1.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
  cursor: default;
  overflow: hidden;
}

.language-badge .flag {
  height: 2rem;
}

/* Card Information Body */
.card-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-grow: 1;
}

.game-title {
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1.35;
  cursor: pointer;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 2.6rem;
  color: var(--text-primary);
  transition: color var(--transition-fast);
}

.game-title:hover {
  color: var(--primary);
}

/* Meta list inside Card */
.game-meta {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.meta-item i {
  font-size: 0.85rem;
  width: 1rem;
  text-align: center;
}

.text-cyan {
  color: var(--secondary);
}

.text-violet {
  color: var(--primary);
}

.text-emerald {
  color: var(--success);
}

/* Card Button Group */
.card-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.action-btn {
  border-radius: var(--radius-sm);
  padding: 0.45rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  border: none;
  transition: all var(--transition-fast);
}

.view-btn {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.view-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.play-btn {
  background: rgba(99, 102, 241, 0.15);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.play-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  box-shadow: 0 0 8px var(--primary-glow);
}

.play-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }
  .add-btn {
    width: 100%;
    justify-content: center;
  }
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .card-image-wrapper {
    aspect-ratio: 16 / 9;
  }
}
</style>
