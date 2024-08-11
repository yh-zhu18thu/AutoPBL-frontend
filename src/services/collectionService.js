import axiosInstance from "axios";

const collectionService = {
    get_collection_list: async () => {
        try {
            const response = await axiosInstance.get('/collection/collection_list');
            return response.data;
        } catch (error) {
            console.error('Error while getting collection list', error);
            return null;
        }
    },
    add_new_collection: async (tutorial_id, step_id, sub_step_id, block_id,
                                content_type, content) => {
        try {
            const response = await axiosInstance.post('/collection/add_collection', {
                tutorial_id: tutorial_id,
                step_id: step_id,
                sub_step_id: sub_step_id,
                block_id: block_id,
                content_type: content_type,
                content: content
            });
            return response.data;
        } catch (error) {
            console.error('Error while adding new collection', error);
            return null;
        }
    }
};

export default collectionService;
