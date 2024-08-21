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
    // 获得某个聊天记录的所有消息
    getChatMessages: async (chat_id) => {
        try {
            const response = await axiosInstance.get(`/api/chat/show_messages`, {
                params: {
                    chat_id: chat_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting chat messages', error);
            return null;
        }
    },

    // 获取当前用户的聊天记录
    sendMessage: async (chat_id, message) => {
        try {
            const formData = new FormData();
            formData.append('chat_id', chat_id);
            formData.append('user_input', message);
            const response = await axiosInstance.post(`/api/chat/continue_chat`, formData);
            return response.data;
        } catch (error) {
            console.error('Error while sending message', error);
            return null;
        }
    },

    initiateChat: async (tutorial_id, step_id, sub_step_id, block_id,user_input_content,selected_function,has_quote,quote_content,quote_block_id) => {
        try {
            const formData = new FormData();
            formData.append('tutorial_id', tutorial_id);
            formData.append('step_id', step_id);
            formData.append('sub_step_id', sub_step_id);
            formData.append('block_id', block_id);
            formData.append('user_input_content', user_input_content);
            formData.append('selected_function', selected_function);
            formData.append('has_quote', has_quote);
            formData.append('quote_content', quote_content);
            formData.append('quote_block_id', quote_block_id);
            const response = await axiosInstance.post(`/api/chat/initiate_chat`, formData);
            return response.data;
        } catch (error) {
            console.error('Error while initiating chat', error);
            return null;
        }
    },

    getChat: async (chat_id) => {
        try {
            const response = await axiosInstance.get(`/api/chat/get_chats`, {
                params: {
                    chat_id: chat_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting chat', error);
            return null;
        }
    },

    getNextMessage: async (chat_message_id) => {
        try {
            const response = await axiosInstance.get(`/api/chat/get_message`, {
                params: {
                    chat_message_id: chat_message_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting message', error);
            return null;
        }
    }
};

export default chatService;