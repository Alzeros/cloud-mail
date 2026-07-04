<template>
  <div class="aside-container">
    <div class="title">
      <Icon icon="mdi:email-outline" width="20" height="20" />
      <span>{{settingStore.settings.title}}</span>
    </div>
    <div class="nav-section">
      <div class="nav-item" @click="router.push({name: 'email'})" :class="route.meta.name === 'email' ? 'active' : ''">
        <Icon icon="hugeicons:mailbox-01" width="18" height="18" />
        <span>{{$t('inbox')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'send'})" v-perm="'email:send'"
           :class="route.meta.name === 'send' ? 'active' : ''">
        <Icon icon="cil:send" width="18" height="18" />
        <span>{{$t('sent')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'draft'})" v-perm="'email:send'"
           :class="route.meta.name === 'draft' ? 'active' : ''">
        <Icon icon="ep:document" width="18" height="18" />
        <span>{{$t('drafts')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'star'})"
           :class="route.meta.name === 'star' ? 'active' : ''">
        <Icon icon="solar:star-line-duotone" width="18" height="18" />
        <span>{{$t('starred')}}</span>
      </div>
    </div>

    <div class="nav-section" v-perm="['all-email:query','user:query','role:query','setting:query','analysis:query','reg-key:query']">
      <div class="section-label">{{$t('manage')}}</div>
      <div class="nav-item" @click="router.push({name: 'analysis'})" v-perm="'analysis:query'"
           :class="route.meta.name === 'analysis' ? 'active' : ''">
        <Icon icon="fluent:data-pie-20-regular" width="18" height="18" />
        <span>{{$t('analytics')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'user'})" v-perm="'user:query'"
           :class="route.meta.name === 'user' ? 'active' : ''">
        <Icon icon="si:user-alt-2-line" width="18" height="18" />
        <span>{{$t('allUsers')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'all-email'})" v-perm="'all-email:query'"
           :class="route.meta.name === 'all-email' ? 'active' : ''">
        <Icon icon="fluent:mail-list-28-regular" width="18" height="18" />
        <span>{{$t('allMail')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'role'})" v-perm="'role:query'"
           :class="route.meta.name === 'role' ? 'active' : ''">
        <Icon icon="fluent:lock-closed-16-regular" width="18" height="18" />
        <span>{{$t('permissions')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'reg-key'})" v-perm="'reg-key:query'"
           :class="route.meta.name === 'reg-key' ? 'active' : ''">
        <Icon icon="fluent:fingerprint-20-filled" width="18" height="18" />
        <span>{{$t('inviteCode')}}</span>
      </div>
      <div class="nav-item" @click="router.push({name: 'sys-setting'})" v-perm="'setting:query'"
           :class="route.meta.name === 'sys-setting' ? 'active' : ''">
        <Icon icon="eos-icons:system-ok-outlined" width="18" height="18" />
        <span>{{$t('SystemSettings')}}</span>
      </div>
    </div>

    <div class="nav-section" style="margin-top: auto;">
      <div class="nav-item" @click="router.push({name: 'setting'})"
           :class="route.meta.name === 'setting' ? 'active' : ''">
        <Icon icon="fluent:settings-48-regular" width="18" height="18" />
        <span>{{$t('settings')}}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";

const settingStore = useSettingStore();
const route = useRoute();
</script>

<style lang="scss" scoped>
.aside-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  background: var(--aside-backgound);
  border-right: 1px solid var(--border);
  gap: 4px;
}

.title {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.02em;
}

.nav-section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-label {
  padding: 8px 12px 4px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--muted-foreground);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: calc(var(--radius) * 0.8);
  font-size: 14px;
  color: var(--muted-foreground);
  cursor: pointer;
  user-select: none;
  transition: all 0.15s ease;

  &:hover {
    background: var(--accent);
    color: var(--accent-foreground);
  }

  &.active {
    background: var(--secondary);
    color: var(--secondary-foreground);
    font-weight: 500;
  }
}
</style>