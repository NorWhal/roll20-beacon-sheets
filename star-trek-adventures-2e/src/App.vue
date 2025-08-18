<template>
  <div class="star-trek-adventures-2e">
    <div class="section__body tabs">
      <h1>Star Trek Adventures</h1>
      <router-link :to="{ name: 'gm' }">
        GM Tab
      </router-link>
      <router-link :to="{ name: 'pc' }">
        PC Tab
      </router-link>
    </div>
    <router-view v-slot="{ Component }">
      <transition name="fade">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { useStarTrekStore } from "./sheet/stores";

useStarTrekStore();
</script>

<style lang="scss">
.tabs {
  display: flex;
  gap: 1rem;
  align-items: center ;
  margin-bottom: 8px;
  a {
    height: min-content;
    color: var(--secondary-text-color);
    padding: 8px;
    border-radius: 8px;
    text-decoration: none;
    border: 1px solid var(--secondary-border-color);
    // Router-links get this class added if you're already on the page it leads you to. Useful for tabs.
    &.router-link-active {
      color: var(--primary-border-color);
      font-weight: 600;
      text-decoration: underline;
      border-color: var(--primary-text-color);
    }
  }

  h1 {
    margin: 0;
  }
}

.footer {
  margin-top: 8px;
}

.fade-enter-active,
.fade-leave-active {
  position: absolute;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
