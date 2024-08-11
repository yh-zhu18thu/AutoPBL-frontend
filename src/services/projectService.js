import axiosInstance from "axios";

const projectService = {
    get_project_list: async () => {
        try {
            const response = await axiosInstance.get('/project/tutorial_list');
            return response.data;
        } catch (error) {
            console.error('Error while getting project list', error);
            return null;
        }
    },
    generate_new_project: async (user_need) => {
        try {
            const response = await axiosInstance.post('/project/generate_tutorial', {
                user_need: user_need
            });
            return response.data;
        } catch (error) {
            console.error('Error while generating new project', error);
            return null;
        }
    }
}

export default projectService;