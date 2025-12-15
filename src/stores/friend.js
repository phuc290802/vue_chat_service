import { defineStore } from "pinia"

export const friendStore = defineStore("users", {
  state: () => ({
    users: []
  }),

  actions: {
    setUsers(list) {
      this.users = list
    },

    setOnline(userId) {
      const u = this.users.find(x => x.id === userId)
      if (u) u.isOnline = true
    },

    setOffline(userId) {
      const u = this.users.find(x => x.id === userId)
      if (u) u.isOnline = false
    }
  }
})
