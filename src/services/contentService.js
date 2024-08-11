import axiosInstance from "axios";

const contentService = {
    //点击一个教程的时候首先要根据这个接口判断大纲是否已生成
    get_tutorial_framework: async (tutorial_id) => {
        try {
            const response = await axiosInstance.get(`/project/tutorial_framework`, {
                tutorial_id: tutorial_id
                });
            return response.data;
        } catch (error) {
            console.error('Error while getting tutorial framework', error);
            return null;
        }
    },
    // 获得当前教程中已经出现过的所有block
    show_blocks: async (tutorial_id) => {
        try {
            const response = await axiosInstance.get(`/tutorial/show_blocks`, {
                tutorial_id: tutorial_id
            });
            return response.data;
        } catch (error) {
            console.error('Error while showing blocks', error);
            return null;
        }
    },
    // 根据show_blocks的结果来判断当前教程是否没有生成过block，没有的话调用这个block
    generate_first_block: async (tutorial_id) => {
        try {
            const response = await axiosInstance.post('/tutorial/generate_first_block', {
                tutorial_id: tutorial_id
            });
            return response.data;
        } catch (error) {
            console.error('Error while generating first block', error);
            return null;
        }
    },
    // 根据show_blocks的结果来判断当前教程是否有了一部分block，如果有了的话，定位到对应的步骤的blocks
    get_sub_step_blocks: async (tutorial_id, step_id, sub_step_id) => {
        try {
            const response = await axiosInstance.get(`/tutorial/get_sub_step_blocks`, {
                tutorial_id: tutorial_id,
                step_id: step_id,
                sub_step_id: sub_step_id
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting sub step blocks', error);
            return null;
        }
    },
    // 用户提交反馈，系统会返回下一个block的id，但需要去轮询直到下一个block生成成功
    post_user_answer: async (type, user_answer, tutorial_id, step_id, sub_step_id, block_id) => {
        try {
            const response = await axiosInstance.post('/tutorial/user_answer', {
                type: type,
                user_answer: user_answer,
                tutorial_id: tutorial_id,
                step_id: step_id,
                sub_step_id: sub_step_id,
                block_id: block_id
            });
            return response.data;
        } catch (error) {
            console.error('Error while posting user answer', error);
            return null;
        }
    },

    //用户主动发问，系统会返回下一个block的id，但需要去轮询直到下一个block生成成功
    post_user_query: async ( tutorial_id, step_id, sub_step_id, block_id,
                            user_query_input_content, user_query_preset_function, 
                            has_quote, quote_content, quote_block_id) => {
        try {
            const response = await axiosInstance.post('/tutorial/user_query', {
                tutorial_id: tutorial_id,
                step_id: step_id,
                sub_step_id: sub_step_id,
                block_id: block_id,
                user_query_input_content: user_query_input_content,
                user_query_preset_function: user_query_preset_function,
                has_quote: has_quote,
                quote_content: quote_content,
                quote_block_id: quote_block_id
            });
            return response.data;
        } catch (error) {
            console.error('Error while posting user query', error);
            return null;
        }
    },

    // 根据系统返回的block id去轮询block的生成状态以及block的内容
    get_next_block: async (block_id) => {
        try {
            const response = await axiosInstance.get(`/tutorial/get_next_block`, {
                block_id: block_id
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting next block', error);
            return null;
        }
    },

}

export default contentService;