import { defineStore } from "pinia";

export const useMessageStore = defineStore("message", {
  state: () => ({
    messages: []
  }),

  actions: {
    setMessages(list) {
      this.messages = list;
    },

    addMessage(msg) {
      this.messages.push(msg);
    }
  }
});
