import axiosInstance from "axios";

const chatService = {
    // 获取当前教程中发生过的所有聊天历史
    getChatHistory: async (tutorial_id) => {
        try {
            const response = await axiosInstance.get(`/api/chat/show_chats`, {
                params: {
                    tutorial_id: tutorial_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting chat history', error);
            return null;
        }
    },
    // 获得
    getChatMessages: async () => {
    // 获取当前用户的聊天记录
    getUserChatRecords: async (tutorial_id, user_id) => {
        try {
            const response = await axiosInstance.get(`/api/chat/get_user_chat_records`, {
                params: {
                    tutorial_id: tutorial_id,
                    user_id: user_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting user chat records', error);
            return null;
        }
    }
};

export default chatService;