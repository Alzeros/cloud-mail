    import { defineStore } from 'pinia'

export const useAccountStore = defineStore('account', {
    state: () => ({
        currentAccountId: -1,
        currentAccount: { allReceive: 1 },
        changeUserAccountName: ''
    })
})