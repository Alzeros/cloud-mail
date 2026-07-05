<template>
  <div class="layout">
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
import Header from '@/layout/header/index.vue'
import Main from '@/layout/main/index.vue'
import { ref, onMounted } from 'vue'
import {useUiStore} from "@/store/ui.js";
import writer from '@/layout/write/index.vue'

const uiStore = useUiStore();
const writerRef = ref({})

onMounted(() => {
  uiStore.writerRef = writerRef
})
</script>

<style lang="scss" scoped>
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
</style>