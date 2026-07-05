<template>
  <div class="email-layout" :class="{ 'content-only': isNarrow && inlineEmail }">
    <!-- 左侧: 邮件列表 -->
    <div class="email-list-panel" :class="{ 'panel-active': !isNarrow || !inlineEmail }">
      <div class="account-header">
        <el-select v-model="selectedAccountId" class="account-select" @change="handleAccountChange" size="small">
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
        <Icon v-perm="'account:add'" class="add-account-btn" icon="ion:add-outline" width="18" height="18" @click="showAddAccountDialog = true"/>
      </div>
      <emailScroll ref="scroll"
                   :cancel-success="cancelStar"
                   :star-success="addStar"
                   :getEmailList="getEmailList"
                   :emailDelete="emailDelete"
                   :star-add="starAdd"
                   :star-cancel="starCancel"
                   :time-sort="params.timeSort"
                   :email-read="emailRead"
                   :show-unread="true"
                   actionLeft="4px"
                   @jump="jumpContent"
      >
        <template #first>
          <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-down-outline"
                v-if="params.timeSort === 0" width="28" height="28"/>
          <Icon class="icon" @click="changeTimeSort" icon="material-symbols-light:timer-arrow-up-outline" v-else
                width="28" height="28"/>
        </template>
      </emailScroll>
    </div>

    <!-- 右侧: 邮件详情 (三栏模式) -->
    <div class="email-content-panel" :class="{ 'panel-active': isNarrow && inlineEmail }" v-if="inlineEmail">
      <div class="content-wrapper">
        <div class="content-header-actions">
          <Icon class="icon" icon="material-symbols-light:arrow-back-ios-new" width="20" height="20" @click="backToList"/>
          <Icon v-perm="'email:delete'" class="icon" icon="uiw:delete" width="16" height="16" @click="handleDelete"/>
          <span class="star" v-if="true">
            <Icon class="icon" @click="changeStar" v-if="inlineEmail.isStar" icon="fluent-color:star-16" width="20" height="20"/>
            <Icon class="icon" @click="changeStar" v-else icon="solar:star-line-duotone" width="18" height="18"/>
          </span>
          <Icon class="icon" v-perm="'email:send'" @click="openReply" icon="la:reply" width="21" height="21" />
          <Icon class="icon" v-perm="'email:send'" @click="openForward" icon="iconoir:arrow-up-right" width="20" height="20" />
        </div>
        <el-scrollbar class="content-scrollbar">
          <div class="content-container">
            <div class="email-title">{{ inlineEmail.subject }}</div>
            <div class="content-body">
              <div class="email-info">
                <div>
                  <div class="send"><span class="send-source">{{$t('from')}}</span>
                    <div class="send-name">
                      <span class="send-name-title">{{ inlineEmail.name }}</span>
                      <span><{{ inlineEmail.sendEmail }}></span>
                    </div>
                  </div>
                  <div class="receive"><span class="source">{{$t('recipient')}}</span><span class="receive-email">{{ formateReceive(inlineEmail.recipient) }}</span></div>
                  <div class="date">
                    <div>{{ formatDetailDate(inlineEmail.createTime) }}</div>
                  </div>
                </div>
                <el-alert v-if="inlineEmail.status === 3" :closable="false" :title="toMessage(inlineEmail.message)" class="email-msg" type="error" show-icon />
                <el-alert v-if="inlineEmail.status === 4" :closable="false" :title="$t('complained')" class="email-msg" type="warning" show-icon />
                <el-alert v-if="inlineEmail.status === 5" :closable="false" :title="$t('delayed')" class="email-msg" type="warning" show-icon />
              </div>
              <el-scrollbar class="htm-scrollbar" :class="inlineEmail.attList?.length === 0 ? 'bottom-distance' : ''">
                <ShadowHtml class="shadow-html" :html="formatImage(inlineEmail.content)" v-if="inlineEmail.content" />
                <pre v-else class="email-text" >{{inlineEmail.text}}</pre>
              </el-scrollbar>
              <div class="att" v-if="inlineEmail.attList?.length > 0">
                <div class="att-title">
                  <span>{{$t('attachments')}}</span>
                  <span>{{$t('attCount',{total: inlineEmail.attList.length})}}</span>
                </div>
                <div class="att-box">
                  <div class="att-item" v-for="att in inlineEmail.attList" :key="att.attId">
                    <div class="att-icon" @click="showImage(att.key)">
                      <Icon v-bind="getIconByName(att.filename)" />
                    </div>
                    <div class="att-name" @click="showImage(att.key)">{{ att.filename }}</div>
                    <div class="att-size">{{ formatBytes(att.size) }}</div>
                    <div class="opt-icon att-icon">
                      <Icon v-if="isImage(att.filename)" icon="hugeicons:view" width="22" height="22" @click="showImage(att.key)"/>
                      <a :href="cvtR2Url(att.key)" download>
                        <Icon icon="system-uicons:push-down" width="22" height="22"/>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <!-- 无邮件选中时的空状态 -->
    <div class="content-empty" :class="{ 'panel-active': !isNarrow && !inlineEmail }" v-if="!inlineEmail">
      <div class="empty-icon">
        <Icon icon="hugeicons:mailbox-01" width="48" height="48" />
      </div>
      <div class="empty-text">{{ $t('selectEmailToView') }}</div>
    </div>
  </div>

  <el-image-viewer
      v-if="showPreview"
      :url-list="srcList"
      show-progress
      @close="showPreview = false"
  />

  <!-- 添加邮箱对话框 -->
  <el-dialog v-model="showAddAccountDialog" :title="$t('addAccount')" width="400px">
    <div class="add-account-form">
      <el-input v-model="addAccountEmail" type="text" :placeholder="$t('emailAccount')" autocomplete="off">
        <template #append>
          <el-select v-model="addAccountSuffix" :placeholder="$t('select')" style="width: 100px">
            <el-option v-for="item in addAccountDomainList" :key="item" :label="item" :value="item" />
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
import {useAccountStore} from "@/store/account.js";
import {useEmailStore} from "@/store/email.js";
import {useSettingStore} from "@/store/setting.js";
import {useUiStore} from "@/store/ui.js";
import emailScroll from "@/components/email-scroll/index.vue"
import ShadowHtml from '@/components/shadow-html/index.vue'
import {emailList, emailDelete, emailLatest, emailRead} from "@/request/email.js";
import {starAdd, starCancel} from "@/request/star.js";
import {defineOptions, onMounted, reactive, ref, watch, computed} from "vue";
import {sleep} from "@/utils/time-utils.js";
import router from "@/router/index.js";
import {Icon} from "@iconify/vue";
import {useRoute} from 'vue-router'
import {formatDetailDate} from "@/utils/day.js";
import {formatBytes} from "@/utils/file-utils.js";
import {cvtR2Url, toOssDomain} from "@/utils/convert.js";
import {getIconByName} from "@/utils/icon-utils.js";
import {ElMessage, ElMessageBox} from 'element-plus'

defineOptions({
  name: 'email'
})

const route = useRoute();
const emailStore = useEmailStore();
const accountStore = useAccountStore();
const settingStore = useSettingStore();
const uiStore = useUiStore();
const scroll = ref({})
const params = reactive({
  timeSort: 0,
})

const inlineEmail = computed(() => emailStore.inlineContent)
const showPreview = ref(false)
const srcList = reactive([])
const isNarrow = ref(window.innerWidth < 1024)
const selectedAccountId = ref(-1)
const accountList = reactive([])
const showAddAccountDialog = ref(false)
const addAccountEmail = ref('')
const addAccountLoading = ref(false)
const addAccountSuffix = ref('')
const addAccountDomainList = computed(() => settingStore.domainList)

window.addEventListener('resize', () => {
  isNarrow.value = window.innerWidth < 1024
})

onMounted(() => {
  emailStore.emailScroll = scroll;
  fetchAccountList()
  latest()
  selectedAccountId.value = accountStore.currentAccountId
  // 如果有 contentData 但没导航到 /message, 显示 inline
  if (emailStore.contentData.email && !emailStore.inlineContent) {
    emailStore.inlineContent = emailStore.contentData.email
  }
})

watch(() => accountStore.currentAccountId, () => {
  selectedAccountId.value = accountStore.currentAccountId
  scroll.value.refreshList()
  emailStore.inlineContent = null
})

watch(() => showAddAccountDialog.value, (val) => {
  if (val && !addAccountSuffix.value && addAccountDomainList.value.length > 0) {
    addAccountSuffix.value = addAccountDomainList.value[0]
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
  scroll.value?.refreshList()
}

function fetchAccountList() {
  import('@/request/account.js').then(({ accountList: api }) => {
    api(0, 100, null).then(list => {
      accountList.length = 0
      accountList.push(...list)
      // 如果当前选中的是 -1，但还没同步到 store，同步一下
      if (accountStore.currentAccountId === -1 && list.length > 0) {
        // 保持全部邮箱模式
      }
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

function changeTimeSort() {
  params.timeSort = params.timeSort ? 0 : 1
  scroll.value.refreshList()
}

function jumpContent(email) {
  emailStore.inlineContent = email
  emailStore.contentData.delType = 'logic'
  emailStore.contentData.showUnread = true
  emailStore.contentData.showStar = true
  emailStore.contentData.showReply = true
  // 窄屏时跳转到 content 路由
  if (isNarrow.value) {
    emailStore.contentData.email = email
    router.push('/message')
  }
}

function backToList() {
  emailStore.inlineContent = null
}

const existIds = new Set();

async function latest() {
  while (true) {
    let autoRefresh = settingStore.settings.autoRefresh;
    await sleep(autoRefresh > 1 ? autoRefresh * 1000 : 3000);

    if (route.name !== 'email') {
      continue;
    }

    const latestId = scroll.value.latestEmail?.emailId

    if (!scroll.value.firstLoad && autoRefresh > 1) {
      try {
        const accountId = accountStore.currentAccountId
        const allReceive = scroll.value.latestEmail?.allReceive
        const curTimeSort = params.timeSort
        let list = []

        if (accountId === scroll.value.latestEmail?.reqAccountId) {
          list = await emailLatest(latestId, accountId, allReceive);
        }

        if (accountId === accountStore.currentAccountId && params.timeSort === curTimeSort && allReceive === accountStore.currentAccount.allReceive) {
          if (list.length > 0) {
            for (let email of list) {
              email.reqAccountId = accountId;
              email.allReceive = allReceive;
              if (!existIds.has(email.emailId)) {
                existIds.add(email.emailId)
                scroll.value.addItem(email)
                await sleep(50)
              }
            }
          }
        }
      } catch (e) {
        if (e.code === 401 || e.code === 403) {
          settingStore.settings.autoRefresh = 0;
        }
        console.error(e)
      }
    }
  }
}

function addStar(email) {
  emailStore.starScroll?.addItem(email)
}

function cancelStar(email) {
  emailStore.starScroll?.deleteEmail([email.emailId])
}

function getEmailList(emailId, size) {
  const accountId = accountStore.currentAccountId;
  const allReceive = accountStore.currentAccount.allReceive;
  return emailList(accountId, allReceive, emailId, params.timeSort, size, 0).then(data => {
    data.latestEmail.reqAccountId = accountId;
    data.latestEmail.allReceive = allReceive;
    return data;
  })
}

function toMessage(message) {
  return message ? JSON.parse(message).message : '';
}

function formatImage(content) {
  content = content || '';
  const domain = settingStore.settings.r2Domain;
  return content.replace(/{{domain}}/g, toOssDomain(domain) + '/');
}

function showImage(key) {
  if (!isImage(key)) return;
  const url = cvtR2Url(key)
  srcList.length = 0
  srcList.push(url)
  showPreview.value = true
}

function isImage(filename) {
  return ['png', 'jpg', 'jpeg', 'bmp', 'gif','jfif'].includes(getExtName(filename))
}

function formateReceive(recipient) {
  if (!recipient) return ''
  try {
    recipient = JSON.parse(recipient)
    return recipient.map(item => item.address).join(', ')
  } catch { return '' }
}

function getExtName(filename) {
  return filename?.split('.').pop()?.toLowerCase() || ''
}

function changeStar() {
  if (!inlineEmail.value) return
  if (inlineEmail.value.isStar) {
    inlineEmail.value.isStar = 0;
    starCancel(inlineEmail.value.emailId).then(() => {
      inlineEmail.value.isStar = 0;
    }).catch(() => {
      inlineEmail.value.isStar = 1;
    })
  } else {
    inlineEmail.value.isStar = 1;
    starAdd(inlineEmail.value.emailId).then(() => {
      inlineEmail.value.isStar = 1;
    }).catch(() => {
      inlineEmail.value.isStar = 0;
    })
  }
}

function handleDelete() {
  if (!inlineEmail.value) return
  ElMessageBox.confirm('确定删除?', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    emailDelete(inlineEmail.value.emailId).then(() => {
      ElMessage({ message: '删除成功', type: 'success', plain: true })
      emailStore.deleteIds = [inlineEmail.value.emailId]
      emailStore.inlineContent = null
    })
  })
}

function openReply() {
  if (!inlineEmail.value) return
  uiStore.writerRef.openReply(inlineEmail.value)
}

function openForward() {
  if (!inlineEmail.value) return
  uiStore.writerRef.openForward(inlineEmail.value)
}

</script>

<style lang="scss" scoped>
.email-layout {
  display: flex;
  height: 100%;
  overflow: hidden;
  position: relative;
  &.content-only {
    .email-list-panel { display: none; }
    .email-content-panel { display: flex; }
  }
}

.email-list-panel {
  width: 420px;
  min-width: 320px;
  flex-shrink: 0;
  border-right: 1px solid var(--border);
  background: var(--card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.2s ease;
  @media (max-width: 1366px) {
    width: 360px;
    min-width: 260px;
  }
  @media (max-width: 1023px) {
    display: none;
    &.panel-active { display: flex; width: 100%; }
  }
}

.email-content-panel {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: var(--background);
  overflow: hidden;
  @media (max-width: 1023px) {
    display: none;
    &.panel-active { display: flex; }
  }
}

.content-empty {
  flex: 1;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--muted-foreground);
  gap: 12px;
  @media (min-width: 1024px) {
    display: flex;
  }
  &.panel-active { display: flex; }
  .empty-icon {
    opacity: 0.3;
  }
  .empty-text {
    font-size: 14px;
  }
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.content-header-actions {
  padding: 9px 15px 8px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-bottom: 1px solid var(--border);
  font-size: 18px;
  color: var(--muted-foreground);
  .star {
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 21px;
  }
  .icon {
    cursor: pointer;
    transition: color 0.15s ease;
    &:hover { color: var(--foreground); }
  }
}

.content-scrollbar {
  flex: 1;
  height: 100%;
}

.content-container {
  font-size: 14px;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 10px;
  @media (max-width: 1023px) {
    padding-left: 15px;
    padding-right: 15px;
  }
}

.email-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
}

.content-body {
  display: flex;
  flex-direction: column;
}

.email-info {
  border-bottom: 1px solid var(--border);
  margin-bottom: 20px;
  padding-bottom: 8px;
  .date {
    color: var(--muted-foreground);
    margin-bottom: 6px;
    font-size: 13px;
  }
  .email-msg {
    max-width: 400px;
    width: fit-content;
    margin-bottom: 15px;
  }
  .send {
    display: flex;
    margin-bottom: 6px;
    .send-name {
      color: var(--foreground);
      display: flex;
      flex-wrap: wrap;
    }
    .send-name-title {
      padding-right: 5px;
      font-weight: 500;
    }
  }
  .receive {
    margin-bottom: 6px;
    display: flex;
    .receive-email {
      max-width: 700px;
      word-break: break-word;
    }
    span:nth-child(2) { color: var(--muted-foreground); }
  }
  .send-source, .source {
    white-space: nowrap;
    font-weight: 500;
    padding-right: 10px;
    color: var(--muted-foreground);
  }
}

.att {
  margin-top: 24px;
  margin-bottom: 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  width: fit-content;
  min-width: min(410px,calc(100vw - 60px));
  max-width: 600px;
  .att-box {
    min-width: min(410px,calc(100vw - 90px));
    max-width: 568px;
    display: grid;
    gap: 10px;
    grid-template-rows: 1fr;
  }
  .att-title {
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    color: var(--muted-foreground);
    font-size: 13px;
    span:first-child {
      font-weight: 600;
      color: var(--foreground);
    }
  }
  .att-item {
    cursor: pointer;
    div { align-self: center; }
    background: var(--muted);
    padding: 8px 10px;
    border-radius: calc(var(--radius) * 0.6);
    align-self: start;
    display: grid;
    grid-template-columns: auto 1fr auto auto;
    .att-icon { display: grid; }
    .att-size {
      color: var(--muted-foreground);
      font-size: 12px;
    }
    .att-name {
      margin-left: 10px;
      margin-right: 10px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      word-break: break-all;
    }
    .opt-icon {
      padding-left: 10px;
      color: var(--muted-foreground);
      align-items: center;
      display: flex;
      gap: 8px;
      cursor: pointer;
      a {
        color: var(--muted-foreground);
        align-items: center;
        display: flex;
      }
    }
  }
}

.email-text {
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.bottom-distance {
  margin-bottom: 30px;
}

.icon {
  cursor: pointer;
}

.account-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--card);
  .account-select {
    flex: 1;
    min-width: 0;
  }
  .add-account-btn {
    flex-shrink: 0;
    color: var(--muted-foreground);
    cursor: pointer;
    transition: color 0.15s ease;
    &:hover {
      color: var(--foreground);
    }
  }
}

.account-option {
  display: flex;
  align-items: center;
  gap: 8px;
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>