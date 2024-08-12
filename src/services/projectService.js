import axiosInstance from "axios";

const projectService = {
    getProjectList: async () => {
        try {
            const formData = new FormData();
            const response = await axiosInstance.get('/api/project/tutorial_list', formData);
            return response.data;
        } catch (error) {
            console.error('Error while getting project list', error);
            return null;
        }
    },
    generateNewProject: async (user_needs) => {
        try {
            const formData = new FormData();
            formData.append('user_needs', user_needs);
            const response = await axiosInstance.post('/api/project/generate_tutorial', formData);
            return response.data;
        } catch (error) {
            console.error('Error while generating new project', error);
            return null;
        }
    }
}

export default projectService;