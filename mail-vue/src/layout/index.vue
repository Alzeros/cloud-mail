<template>
  <div class="layout">
    <aside
        class="aside"
        :class="uiStore.asideShow ? 'aside-show' : 'aside-hide'">
      <Aside />
    </aside>
    <div
        :class="(uiStore.asideShow && isMobile)? 'overlay-show':'overlay-hide'"
        @click="uiStore.asideShow = false"
    ></div>
    <div class="main-container">
      <header class="main-header">
        <Header />
      </header>
      <Main />
    </div>
  </div>
  <writer ref="writerRef" />
</template>

<script setup>
import Aside from '@/layout/aside/index.vue'
import Header from '@/layout/header/index.vue'
import Main from '@/layout/main/index.vue'
import { ref, onMounted, onBeforeUnmount } from 'vue'
import {useUiStore} from "@/store/ui.js";
import writer from '@/layout/write/index.vue'

const uiStore = useUiStore();
const writerRef = ref({})
const isMobile = ref(window.innerWidth < 1025)
const handleResize = () => {
  isMobile.value = window.innerWidth < 1025
  uiStore.asideShow = window.innerWidth > 1024;
}

onMounted(() => {
  uiStore.writerRef = writerRef

  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style lang="scss" scoped>
.aside-hide {
  position: fixed;
  left: 0;
  height: 100%;
  z-index: 100;
  transform: translateX(-100%);
  transition: all 150ms ease;
}

.aside-show {
  transform: translateX(0);
  transition: all 150ms ease;
  z-index: 101;
  @media (max-width: 1025px) {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 101;
    height: 100%;
  }
}

.aside {
  width: 260px;
  flex-shrink: 0;
  background: var(--card);
  transition: all 150ms ease;
}

.layout {
  height: 100%;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
  display: flex;
}

.main-container {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--background);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.main-header {
  background: var(--card);
  border-bottom: 1px solid var(--border);
  padding: 0 16px;
  height: 52px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.overlay-show {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.3);
  z-index: 99;
  transition: all 0.3s;
}

.overlay-hide {
  display: flex;
  pointer-events: none;
  opacity: 0;
}
</style>