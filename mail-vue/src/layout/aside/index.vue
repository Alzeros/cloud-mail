<template>
  <div class="aside-container">
    <div class="title">
      <Icon icon="mdi:email-outline" width="20" height="20" />
      <span>{{settingStore.settings.title}}</span>
    </div>

    <!-- 邮箱选择器 -->
    <div class="account-selector" v-if="hasPerm('account:query') && settingStore.settings.manyEmail === 0">
      <el-select v-model="selectedAccountId" class="account-select" @change="handleAccountChange" size="default" popper-class="aside-account-popper">
        <el-option :value="-1" :label="$t('allAccounts')">
          <div class="account-option">
            <Icon icon="hugeicons:mailbox-01" width="16" height="16" />
            <span>{{ $t('allAccounts') }}</span>
          </div>
        </el-option>
        <el-option v-for="acc in accountList" :key="acc.accountId" :value="acc.accountId" :label="acc.email">
          <div class="account-option">
            <Icon icon="mdi-light:email" width="16" height="16" />
            <span>{{ acc.email }}</span>
          </div>
        </el-option>
      </el-select>
      <div class="account-actions">
        <div v-if="selectedAccountId > 0" class="icon-btn" @click.stop="copyCurrentAccount" :title="$t('copy')">
          <Icon icon="lucide:copy" width="16" height="16" style="font-size: 16px;" />
        </div>
        <div v-perm="'account:add'" class="icon-btn" @click="showAddAccountDialog = true" :title="$t('add')">
          <Icon icon="lucide:plus" width="16" height="16" style="font-size: 16px;" />
        </div>
      </div>
    </div>

    <div class="separator"></div>

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

  <!-- 添加邮箱对话框 -->
  <el-dialog v-model="showAddAccountDialog" :title="$t('addAccount')" width="400px">
    <div class="add-account-form">
      <el-input v-model="addAccountEmail" type="text" :placeholder="$t('emailAccount')" autocomplete="off">
        <template #append>
          <el-select v-model="addAccountSuffix" :placeholder="$t('select')" style="width: 100px">
            <el-option v-for="item in domainList" :key="item" :label="item" :value="item" />
          </el-select>
        </template>
      </el-input>
      <el-button class="btn" type="primary" @click="submitAddAccount" :loading="addAccountLoading" style="margin-top: 15px; width: 100%">
        {{ $t('add') }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script setup>
import router from "@/router/index.js";
import { useRoute } from "vue-router";
import {Icon} from "@iconify/vue";
import {useSettingStore} from "@/store/setting.js";
import {useAccountStore} from "@/store/account.js";
import {useEmailStore} from "@/store/email.js";
import {computed, onMounted, reactive, ref, watch} from "vue";
import { hasPerm } from "@/perm/perm.js"
import {ElMessage} from 'element-plus'

const settingStore = useSettingStore();
const accountStore = useAccountStore();
const emailStore = useEmailStore();
const route = useRoute();

const selectedAccountId = ref(accountStore.currentAccountId)
const accountList = reactive([])
const showAddAccountDialog = ref(false)
const addAccountEmail = ref('')
const addAccountLoading = ref(false)
const addAccountSuffix = ref('')
const domainList = computed(() => settingStore.domainList)

onMounted(() => {
  fetchAccountList()
  if (domainList.value.length > 0 && !addAccountSuffix.value) {
    addAccountSuffix.value = domainList.value[0]
  }
})

watch(() => accountStore.currentAccountId, (val) => {
  selectedAccountId.value = val
})

watch(() => showAddAccountDialog.value, (val) => {
  if (val && !addAccountSuffix.value && domainList.value.length > 0) {
    addAccountSuffix.value = domainList.value[0]
  }
})

function handleAccountChange(val) {
  if (val === -1) {
    accountStore.currentAccountId = -1
    accountStore.currentAccount = { allReceive: 1 }
  } else {
    const acc = accountList.find(a => a.accountId === val)
    if (acc) {
      accountStore.currentAccountId = acc.accountId
      accountStore.currentAccount = acc
    }
  }
  emailStore.inlineContent = null
  emailStore.emailScroll?.refreshList()
  emailStore.sendScroll?.refreshList()
}

async function copyCurrentAccount() {
  const acc = accountList.find(a => a.accountId === selectedAccountId.value)
  if (!acc) return
  try {
    await navigator.clipboard.writeText(acc.email)
    ElMessage({
      message: '复制成功',
      type: 'success',
      plain: true,
    })
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage({
      message: '复制失败',
      type: 'error',
      plain: true,
    })
  }
}

function fetchAccountList() {
  import('@/request/account.js').then(({ accountList: api }) => {
    api(0, 100, null).then(list => {
      accountList.length = 0
      accountList.push(...list)
    })
  }).catch(() => {})
}

function submitAddAccount() {
  if (!addAccountEmail.value) {
    ElMessage({ message: '请输入邮箱前缀', type: 'error', plain: true })
    return
  }
  const fullEmail = addAccountEmail.value + addAccountSuffix.value
  addAccountLoading.value = true
  import('@/request/account.js').then(({ accountAdd }) => {
    accountAdd(fullEmail, '').then(account => {
      accountList.push(account)
      showAddAccountDialog.value = false
      addAccountEmail.value = ''
      ElMessage({ message: '添加成功', type: 'success', plain: true })
    }).catch(() => {}).finally(() => {
      addAccountLoading.value = false
    })
  })
}
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
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 600;
  color: var(--foreground);
  letter-spacing: -0.02em;
}

.account-selector {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px 10px;
  .account-select {
    flex: 1;
    min-width: 0;
    :deep(.el-select__wrapper) {
      font-size: 14px;
      min-height: 32px;
      height: 32px;
    }
    :deep(.el-select__placeholder) {
      font-size: 14px;
    }
  }
  .account-actions {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
    .icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: calc(var(--radius) * 0.7);
      cursor: pointer;
      color: var(--muted-foreground);
      background: transparent;
      transition: all 0.15s ease;
      box-sizing: border-box;
      &:hover {
        background: var(--accent);
        color: var(--accent-foreground);
      }
      &:active {
        background: var(--accent);
        color: var(--foreground);
      }
      // 图标线条更细, 与下拉框箭头视觉重量一致
      svg {
        stroke-width: 1.6;
      }
    }
  }
}

.separator {
  height: 1px;
  background: var(--border);
  margin: 0 12px 4px;
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

<style>
.aside-account-popper {
  .el-select-dropdown__item {
    font-size: 14px;
  }
}
</style>