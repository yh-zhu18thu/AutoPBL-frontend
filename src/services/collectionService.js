import axiosInstance from "axios";

const collectionService = {
    getCollectionList: async () => {
        try {
            const response = await axiosInstance.get('/api/collection/collection_list');
            console.log('response', response.data);
            return response.data;
        } catch (error) {
            console.error('Error while getting collection list', error);
            return null;
        }
    },
    addNewCollection: async (tutorial_id, step_id, sub_step_id, block_id,
                                content_type, content) => {
        try {
            const formData = new FormData();
            formData.append('tutorial_id', tutorial_id);
            formData.append('step_id', step_id);
            formData.append('sub_step_id', sub_step_id);
            formData.append('block_id', block_id);
            formData.append('content_type', content_type);
            formData.append('content', content);
            const response = await axiosInstance.post('/api/collection/add_collection', formData);
            return response.data;
        } catch (error) {
            console.error('Error while adding new collection', error);
            return null;
        }
    }
};

export default collectionService;
