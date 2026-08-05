<template>
  <div class="add-game-view">
    <!-- Header Area -->
    <header class="page-header">
      <router-link to="/" class="back-link">
        <i class="fa-duotone fa-chevron-left"></i>
        <span>ดูคอลเลคชั่น</span>
      </router-link>
      <h1>เพิ่มบอร์ดเกม</h1>
    </header>

    <!-- Search Input Bar -->
    <div class="search-container">
      <div class="search-bar">
        <i
          v-if="!isSearching"
          class="fa-duotone fa-magnifying-glass search-icon"
        ></i>
        <i
          v-else
          class="fa-duotone fa-spinner spin-loader search-icon text-primary"
        ></i>

        <input
          type="text"
          v-model="searchText"
          placeholder="พิมพ์ชื่อบอร์ดเกมเพื่อค้นหา..."
          @input="search"
        />

        <button
          v-if="searchText"
          class="clear-btn"
          @click="clearSearch"
          title="ล้างคำค้นหา"
        >
          <i class="fa-duotone fa-circle-xmark"></i>
        </button>
      </div>
    </div>

    <!-- Search Results Autocomplete Dropdown -->
    <div class="results-wrapper" v-if="result">
      <ul class="results-list">
        <!-- Multiple Results Case (Array) -->
        <template v-if="Array.isArray(result) && result.length > 0">
          <li
            class="search-item"
            v-for="item in result"
            :key="item.id"
            @click="selectGame(item)"
          >
            <div class="search-item-content">
              <i class="fa-duotone fa-chess-knight item-icon"></i>
              <span class="game-name">{{ item.name?.value }}</span>
              <span class="game-year" v-if="item.yearpublished"
                >({{ item.yearpublished.value }})</span
              >
            </div>
            <i class="fa-duotone fa-chevron-right arrow-icon"></i>
          </li>
        </template>

        <!-- Single Result Case (Object) -->
        <template
          v-else-if="
            result && typeof result === 'object' && !Array.isArray(result)
          "
        >
          <li class="search-item" @click="selectGame(result)">
            <div class="search-item-content">
              <i class="fa-duotone fa-chess-knight item-icon"></i>
              <span class="game-name">{{ result.name?.value }}</span>
              <span class="game-year" v-if="result.yearpublished"
                >({{ result.yearpublished.value }})</span
              >
            </div>
            <i class="fa-duotone fa-chevron-right arrow-icon"></i>
          </li>
        </template>

        <!-- No Results Found -->
        <li v-else class="search-empty">
          <i class="fa-duotone fa-triangle-exclamation"></i>
          <span>ไม่พบข้อมูลเกมที่ตรงกับคำค้นหา</span>
        </li>
      </ul>
    </div>

    <!-- Selected Game Details / Preview Card -->
    <div class="preview-container" v-if="bgData">
      <div class="preview-card">
        <!-- Hero Cover Image -->
        <div class="preview-image-wrapper">
          <img
            :src="bgData.image"
            class="preview-image"
            alt="Board game cover"
          />
          <div v-if="isInCollection" class="owned-tag">
            <i class="fa-duotone fa-circle-check"></i> สะสมแล้ว
          </div>
        </div>

        <div class="preview-content">
          <!-- Game Meta Header -->
          <div class="preview-header">
            <h2>{{ bgData.name }}</h2>
            <span class="pub-year" v-if="bgData.yearpublished">
              ({{ bgData.yearpublished.value }})
            </span>
          </div>

          <!-- Statistics Info Grid -->
          <div class="preview-stats" v-if="bgData.type">
            <div class="preview-stat-pill bg-cyan">
              <i class="fa-duotone fa-users"></i>
              <span>
                {{
                  bgData.minplayers.value === bgData.maxplayers.value
                    ? bgData.minplayers.value
                    : `${bgData.minplayers.value}-${bgData.maxplayers.value}`
                }}
                คน
              </span>
            </div>

            <div class="preview-stat-pill bg-violet">
              <i class="fa-duotone fa-clock"></i>
              <span>{{ bgData.playingtime.value }} นาที</span>
            </div>
          </div>

          <!-- Add to Collection Controls -->
          <div class="preview-control">
            <button
              v-if="!isInCollection"
              class="add-collection-btn"
              :disabled="isAdding"
              @click="addToCollection"
            >
              <i v-if="isAdding" class="fa-duotone fa-spinner spin-loader"></i>
              <i v-else class="fa-duotone fa-circle-plus"></i>
              <span>เพิ่มเข้าคอลเลคชั่น</span>
            </button>
            <button v-else class="add-collection-btn owned-disabled" disabled>
              <i class="fa-duotone fa-circle-check"></i>
              <span>มีเกมนี้อยู่ในคอลเลคชั่นแล้ว</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import { showToast } from "../toast.js";

const searchText = ref("");
const DB = ref([]);
const result = ref("");
const bg = ref("");
const bgData = ref("");

const isSearching = ref(false);
const isAdding = ref(false);
const searchTimeout = ref(null);

const search = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }

  if (!searchText.value.trim()) {
    result.value = "";
    return;
  }

  isSearching.value = true;

  // Debounce API requests for 400ms
  searchTimeout.value = setTimeout(() => {
    axios
      .post("https://n8n.3xbun.com/webhook/bgg-api/search", {
        keyword: searchText.value,
      })
      .then((res) => {
        result.value = res.data[0]?.items?.item || [];
        isSearching.value = false;
      })
      .catch((err) => {
        console.error(err);
        isSearching.value = false;
        showToast("เกิดข้อผิดพลาดในการค้นหาข้อมูล", "error");
      });
  }, 400);
};

const clearSearch = () => {
  searchText.value = "";
  result.value = "";
};

const selectGame = (item) => {
  bg.value = item;
  getBG(item.id);
  result.value = "";
};

const getBG = (id) => {
  axios
    .post("https://n8n.3xbun.com/webhook/bgg-api/get-bg", { id: id })
    .then((res) => {
      const data = res.data[0].items.item;
      const name = data.name;
      const thaiLang = /[ก-๙]/;

      bgData.value = data;

      if (name && name.length > 0) {
        bgData.value.name = name.filter((n) => n.type == "primary")[0].value;

        if (name.filter((n) => thaiLang.test(n.value)).length > 0) {
          bgData.value.name = name.filter((n) =>
            thaiLang.test(n.value),
          )[0].value;
        }
      } else if (name) {
        bgData.value.name = name.value;
      }
    })
    .catch((err) => {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการดึงข้อมูลบอร์ดเกม", "error");
    });
};

const addToCollection = () => {
  isAdding.value = true;
  const playtime = bgData.value.playingtime.value;
  const player =
    bgData.value.minplayers.value === bgData.value.maxplayers.value
      ? bgData.value.minplayers.value
      : `${bgData.value.minplayers.value}-${bgData.value.maxplayers.value}`;

  const payload = {
    BGG_ID: bgData.value.id,
    Name: bgData.value.name,
    Image: bgData.value.image,
    Playtime: playtime,
    Player: player,
  };

  axios
    .post("https://n8n.3xbun.com/webhook/bgg-api/add", payload)
    .then((res) => {
      showToast(`เพิ่ม "${bgData.value.name}" เข้าคอลเลคชั่นแล้ว!`, "success");
      updateDB();
      isAdding.value = false;
    })
    .catch((err) => {
      console.error(err);
      isAdding.value = false;
      showToast("เกิดข้อผิดพลาดในการเพิ่มเข้าคอลเลคชั่น", "error");
    });
};

const isInCollection = computed(() => {
  if (!bgData.value || !bgData.value.id) return false;
  return DB.value.some((b) => b.BGG_ID == bgData.value.id);
});

const updateDB = () => {
  axios.get("https://n8n.3xbun.com/webhook/bgg-api/collection").then((res) => {
    DB.value = res.data;
    localStorage.setItem("BoardgameDB", JSON.stringify(res.data));
  });
};

onMounted(() => {
  if (localStorage.getItem("BoardgameDB")) {
    DB.value = JSON.parse(localStorage.getItem("BoardgameDB"));
  }
  updateDB();
});
</script>

<style scoped>
.add-game-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

/* Header styled with back arrow */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.back-link:hover {
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

/* Search bar styling with focus glow & loading icon */
.search-container {
  width: 100%;
}

.search-bar {
  display: flex;
  align-items: center;
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 1rem;
  gap: 0.75rem;
  transition: all var(--transition-fast);
}

.search-bar:focus-within {
  border-color: var(--border-focus);
  box-shadow: 0 0 12px var(--primary-glow);
  background: rgba(15, 23, 42, 0.6);
}

.search-icon {
  font-size: 1.1rem;
  color: var(--text-muted);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.95rem;
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
}

.clear-btn:hover {
  color: var(--danger);
}

/* Autocomplete Results container styling */
.results-wrapper {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  max-height: 250px;
  overflow-y: auto;
  animation: slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.results-list {
  list-style: none;
  padding: 0.5rem 0;
  margin: 0;
}

.search-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1.25rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.search-item:not(:last-child) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.search-item-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
}

.item-icon {
  color: var(--text-muted);
}

.search-item:hover .item-icon {
  color: var(--primary);
}

.game-name {
  font-weight: 600;
  color: var(--text-primary);
}

.game-year {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.arrow-icon {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0;
  transform: translateX(-4px);
  transition: all var(--transition-fast);
}

.search-item:hover .arrow-icon {
  opacity: 1;
  transform: translateX(0);
  color: var(--primary);
}

.search-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 500;
}

/* Selected Game Details Card styling */
.preview-container {
  margin-top: 0.5rem;
  animation: fadeIn 0.4s ease;
}

.preview-card {
  background: rgba(15, 23, 42, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.preview-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #090d16;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.owned-tag {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: var(--success);
  color: #0b0f19;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  box-shadow: 0 4px 10px var(--success-glow);
}

.preview-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.preview-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.preview-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.3;
}

.pub-year {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 600;
}

.preview-stats {
  display: flex;
  gap: 0.75rem;
}

.preview-stat-pill {
  padding: 0.45rem 1rem;
  border-radius: 2rem;
  font-size: 0.85rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.bg-cyan {
  background: rgba(6, 182, 212, 0.1);
  color: var(--secondary);
  border: 1px solid rgba(6, 182, 212, 0.2);
}

.bg-violet {
  background: rgba(99, 102, 241, 0.1);
  color: #a5b4fc;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.preview-control {
  margin-top: 0.5rem;
}

.add-collection-btn {
  width: 100%;
  background: linear-gradient(135deg, var(--success) 0%, #059669 100%);
  color: #0b0f19;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 0.8rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 12px var(--success-glow);
}

.add-collection-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.5);
}

.add-collection-btn:active {
  transform: translateY(0);
}

.add-collection-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.owned-disabled {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  box-shadow: none !important;
  transform: none !important;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
