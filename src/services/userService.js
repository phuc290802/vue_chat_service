import api from "./api"

export const userService ={
    async GetAllUser(){
      const respone = await api.get("/user")
      return respone.data
    },
    async AddFriend(userId) {
      const response = await api.post(`/conversation/new?user2=${userId}`);
      return response.data;
    }
}