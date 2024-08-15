import axiosInstance from "axios";

const contentService = {
    //点击一个教程的时候首先要根据这个接口判断大纲是否已生成
    getTutorialFramework: async (tutorial_id) => {
        try {
            const response = await axiosInstance.get(`/api/project/tutorial_framework`, {
                params: {
                    tutorial_id: tutorial_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting tutorial framework', error);
            return null;
        }
    },
    // 获得当前教程中已经出现过的所有block
    showBlocks: async (tutorial_id) => {
        try {
            const response = await axiosInstance.get(`/api/tutorial/show_blocks`,{
                params: {
                    tutorial_id: tutorial_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while showing blocks', error);
            return null;
        }
    },
    // 根据show_blocks的结果来判断当前教程是否没有生成过block，没有的话调用这个block
    generateFirstBlock: async (tutorial_id) => {
        try {
            const formData = new FormData();
            formData.append('tutorial_id', tutorial_id);
            const response = await axiosInstance.post('/api/tutorial/generate_first_block', formData);
            return response.data;
        } catch (error) {
            console.error('Error while generating first block', error);
            return null;
        }
    },
    // 根据show_blocks的结果来判断当前教程是否有了一部分block，如果有了的话，定位到对应的步骤的blocks
    getSubStepBlocks: async (tutorial_id, step_id, sub_step_id) => {
        try {
            const formData = new FormData();
            const response = await axiosInstance.get(`/api/tutorial/sub_step_blocks`, {
                params: {
                    tutorial_id: tutorial_id,
                    step_index: step_id,
                    sub_step_index: sub_step_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting sub step blocks', error);
            return null;
        }
    },
    // 用户提交反馈，系统会返回下一个block的id，但需要去轮询直到下一个block生成成功
    postUserAnswer: async (type, user_answer, tutorial_id,block_id) => {
        try {
            const formData = new FormData();
            formData.append('type', type);
            formData.append('user_answer', user_answer);
            formData.append('tutorial_id', tutorial_id);
            formData.append('block_id', block_id);
            const response = await axiosInstance.post('/api/tutorial/user_answer', formData);
            return response.data;
        } catch (error) {
            console.error('Error while posting user answer', error);
            return null;
        }
    },

    //用户主动发问，系统会返回下一个block的id，但需要去轮询直到下一个block生成成功
    postUserQuery: async ( tutorial_id, step_id, sub_step_id, block_id,
                            user_query_input_content, user_query_preset_function, 
                            has_quote, quote_content, quote_block_id) => {
        try {
            const formData = new FormData();
            formData.append('tutorial_id', tutorial_id);
            formData.append('step_id', step_id);
            formData.append('sub_step_id', sub_step_id);
            formData.append('block_id', block_id);
            formData.append('user_query_input_content', user_query_input_content);
            formData.append('user_query_preset_function', user_query_preset_function);
            formData.append('has_quote', has_quote);
            formData.append('quote_content', quote_content);
            formData.append('quote_block_id', quote_block_id);
            const response = await axiosInstance.post('/api/tutorial/user_query', formData);
            return response.data;
        } catch (error) {
            console.error('Error while posting user query', error);
            return null;
        }
    },

    // 根据系统返回的block id去轮询block的生成状态以及block的内容
    getNextBlock: async (block_id) => {
        try {
            const response = await axiosInstance.get(`/api/tutorial/next_block`, {
                params: {
                    block_id: block_id
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error while getting next block', error);
            return null;
        }
    },

}

export default contentService;