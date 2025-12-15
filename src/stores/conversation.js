import { defineStore } from "pinia"
import { useAuthStore } from "./auth";

export const useConversationStore = defineStore("conversation", {
  state: () => ({
    list: []
  }),

  actions: {
    setConversations(conversations) {
      const authStore = useAuthStore();

      if (!authStore.currentUser) {
        console.warn("currentUser is null → chưa login hoặc chưa load xong");
        return;
      }

      const myId = authStore.currentUser.id;

      this.list = conversations.map(c => {
        const users = c.members.map(m => m.user);

        return {
          id: c.id,
          name: c.name,
          isGroup: c.isGroup,
          isDirectMessage: c.isDirectMessage,
          avatarUrl: c.avatarUrl,
          users,
          otherUser: !c.isGroup
            ? users.find(u => u.id !== myId)
            : null,
          lastMessage: c.lastMessage,
          createdAt: c.createdAt
        };
      });
    },

    updateConversationLastMessage(conversationId, message) {
      const c = this.list.find(x => x.id === conversationId);
      if (c) c.lastMessage = message;
    }
  }
});
