<template>
  <Teleport to="body">
    <div class="modal-backdrop" v-if="showModal && ready" @click.self="close()">
      <div class="modal-container">
        <!-- Close Button (Top Right) -->
        <button class="modal-close-btn" @click="close()" :title="$t('close')">
          <i class="fa-duotone fa-xmark"></i>
        </button>

        <!-- Header Area -->
        <header class="modal-header">
          <h1 class="modal-title">{{ bgData.name }}</h1>
          <p class="modal-year" v-if="bgData.yearpublished">
            ({{ bgData.yearpublished.value }})
          </p>
        </header>

        <!-- Main Summary Section -->
        <div class="modal-summary">
          <div class="modal-image-wrapper">
            <img :src="bgData.image" class="modal-image" alt="Game cover" />
          </div>

          <div class="modal-info-list">
            <div class="info-pill pill-cyan">
              <i class="fa-duotone fa-users"></i>
              <span class="pill-label">{{ $t('players') }}</span>
              <span class="pill-text">
                {{
                  bgData.minplayers.value === bgData.maxplayers.value
                    ? bgData.minplayers.value
                    : `${bgData.minplayers.value} – ${bgData.maxplayers.value}`
                }}
                คน
              </span>
            </div>

            <div class="info-pill pill-violet">
              <i class="fa-duotone fa-clock"></i>
              <span class="pill-label">{{ $t('playtime') }}</span>
              <span class="pill-text">
                {{
                  bgData.minplaytime.value === bgData.maxplaytime.value
                    ? bgData.minplaytime.value
                    : `${bgData.minplaytime.value} – ${bgData.maxplaytime.value}`
                }}
                นาที
              </span>
            </div>

            <div class="info-pill pill-amber">
              <i class="fa-duotone fa-cake-candles"></i>
              <span class="pill-label">อายุขั้นต่ำ</span>
              <span class="pill-text">{{ bgData.minage.value }}+ ปี</span>
            </div>
          </div>
        </div>

        <!-- YouTube Watch Tutorial Button -->
        <a
          target="_blank"
          class="youtube-tutorial-btn"
          :href="
            'https://www.youtube.com/results?search_query=' +
            encodeURIComponent(bgData.name + ' วิธีเล่น')
          "
          :title="$t('watchTutorial')"
        >
          <i class="fa-brands fa-youtube"></i>
          <span>{{ $t('watchTutorial') }}</span>
        </a>

        <!-- Categories & Mechanics Tags -->
        <div
          class="modal-tags-section"
          v-if="categories && categories.length > 0"
        >
          <div class="tags-header">
            <i class="fa-duotone fa-tags"></i>
            <span>แท็ก & กลไกของเกม</span>
          </div>
          <div class="tags-cloud">
            <span class="tag-badge" v-for="link in categories" :key="link.id">
              {{ link.value }}
            </span>
          </div>
        </div>

        <!-- Description Block -->
        <div class="modal-description-box">
          <h3>{{ $t('description') }}</h3>
          <div class="desc-divider"></div>
          <div class="description-text" v-html="bgData.description"></div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { getBoardGame } from "../bggApi.js";
import { showToast } from "../toast.js";

const bgData = ref({});
const showModal = inject("showModal");
const props = defineProps(["objectid"]);
const ready = ref(false);

const categories = computed(() => {
  const links = bgData.value.link;
  if (!links) return [];

  // Return links matching BGG category or mechanic
  return links.filter(
    (link) =>
      link.type === "boardgamecategory" || link.type === "boardgamemechanic",
  );
});

const close = () => {
  showModal.value = false;
};

const getBG = (id) => {
  getBoardGame(id)
    .then((data) => {

      const name = data.name;
      const thaiLang = /[ก-๙]/;

      bgData.value = data;

      if (name && name.length > 0) {
        const primaryName = name.find((n) => n.type === "primary");
        bgData.value.name =
          primaryName?.value || name[0]?.value || "ไม่ทราบชื่อเกม";

        const thaiName = name.find((n) => thaiLang.test(n.value));
        if (thaiName) {
          bgData.value.name = thaiName.value;
        }
      } else if (name) {
        bgData.value.name = name.value;
      } else {
        bgData.value.name = "ไม่ทราบชื่อเกม";
      }

      ready.value = true;
    })
    .catch((err) => {
      console.error(err);
      showToast("เกิดข้อผิดพลาดในการโหลดข้อมูลบอร์ดเกม", "error");
    });
};

onMounted(() => {
  getBG(props.objectid);
});
</script>

<style scoped>
/* Modal backdrop with blur & dark background overlay */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-backdrop);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  animation: fadeIn 0.25s ease forwards;
}

/* Modal Content Container Card */
.modal-container {
  background: #151f32;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  max-width: 600px;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
}

/* Floating Close Button top right */
.modal-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  color: var(--text-secondary);
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
}

.modal-close-btn i {
  font-size: 1.1rem;
}

/* Header typography styling */
.modal-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding-right: 2rem;
  text-align: left;
}

.modal-title {
  font-size: 1.45rem;
  font-weight: 800;
  line-height: 1.3;
  color: var(--text-primary);
}

.modal-year {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* Split Image and Information Row */
.modal-summary {
  display: flex;
  gap: 1.5rem;
}

.modal-image-wrapper {
  width: 42%;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #090d16;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.modal-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-info-list {
  width: 58%;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  justify-content: center;
}

/* Rounded metadata list items styling */
.info-pill {
  padding: 0.5rem 0.85rem;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.03);
}

.info-pill i {
  font-size: 1rem;
  width: 1.25rem;
  text-align: center;
}

.pill-label {
  color: var(--text-secondary);
  font-weight: 500;
}

.pill-text {
  margin-left: auto;
  font-weight: 700;
  color: var(--text-primary);
}

.pill-cyan {
  background: rgba(6, 182, 212, 0.08);
  color: var(--secondary);
  border-color: rgba(6, 182, 212, 0.15);
}

.pill-violet {
  background: rgba(99, 102, 241, 0.08);
  color: #a5b4fc;
  border-color: rgba(99, 102, 241, 0.15);
}

.pill-amber {
  background: rgba(245, 158, 11, 0.08);
  color: var(--warning);
  border-color: rgba(245, 158, 11, 0.15);
}

/* High-end custom crimson YouTube pill button */
.youtube-tutorial-btn {
  background: linear-gradient(135deg, #e50914 0%, #b80710 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
  transition: all var(--transition-fast);
}

.youtube-tutorial-btn:hover {
  transform: translateY(-2.5px);
  box-shadow: 0 6px 20px rgba(229, 9, 20, 0.55);
  color: white;
}

.youtube-tutorial-btn:active {
  transform: translateY(0);
}

.youtube-tutorial-btn i {
  font-size: 1.25rem;
}

/* Tags section */
.modal-tags-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  text-align: left;
}

.tags-header {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-badge {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: var(--text-secondary);
  padding: 0.25rem 0.6rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 500;
}

/* Beautiful scrollable description block */
.modal-description-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  text-align: left;
}

.modal-description-box h3 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
}

.desc-divider {
  height: 1px;
  background: linear-gradient(90deg, var(--border-color) 0%, transparent 100%);
  width: 100%;
}

.description-text {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-secondary);
  max-height: 220px;
  overflow-y: auto;
  padding-right: 0.5rem;
  text-align: justify;
}

/* Responsive adjustment */
@media (max-width: 480px) {
  .modal-container {
    padding: 1.5rem 1.25rem;
    max-height: 90vh;
  }
  .modal-summary {
    flex-direction: column;
    gap: 1rem;
  }
  .modal-image-wrapper {
    width: 100%;
    aspect-ratio: 1 / 1;
  }
  .modal-info-list {
    width: 100%;
  }
}
</style>
