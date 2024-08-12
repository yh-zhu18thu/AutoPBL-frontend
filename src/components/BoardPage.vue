<template>
    <div class="board-page">
      <h2>Project Board</h2>
      <button @click="showCreateProjectDialog = true">Create New Project</button>
      <!-- Popup Dialog -->
      <div v-if="showCreateProjectDialog" class="dialog-overlay">
        <div class="dialog">
          <h3>输入您的项目需求</h3>
          <!-- Multi-line input area -->
          <textarea v-model="newProjectDescription" rows="5" cols="30" placeholder="请输入您的项目需求..."></textarea>
          <!-- Buttons -->
          <div class="dialog-actions">
            <button @click="createProject">Submit</button>
            <button @click="cancelCreateProject">Cancel</button>
          </div>
        </div>
      </div>

      <div class="projects-grid">
        <div
            v-for="project in projects"
            :key="project.tutorial_id"
            :class="['project-card', getStatusClass(project.status)]"
            :style="{ cursor: project.status === 2 ? 'pointer' : 'not-allowed' }"
            @click="goToProject(project.tutorial_id)"
            :disabled="project.status !== 2"
          >
            <h3>{{ project.tutorial_name }}</h3>
          </div>
      </div>
    </div>
  </template>
  
  <script>
  import projectService from '@/services/projectService';
  export default {
    name: 'BoardPage',
    data() {
      return {
        projects: [],
        projectCnt: 0,
        showCreateProjectDialog: false,
        newProjectDescription: '',
      };
    },
    mounted() {
      this.intervalId = setInterval(() => {
        this.getProjectList();
      }, 5000);
    },
    created() {
      // Fetch projects from API
      this.getProjectList();
    },
    beforeDestroy () {
      clearInterval(this.intervalId);
    },
    methods: {
      getStatusClass(status) {
        switch (status) {
          case 0:
            return 'status-generating';
          case 1:
            return 'status-error';
          case 2:
            return 'status-available';
          default:
            return '';
        }
      },
      createProject:async function() {
        const response = await projectService.generateNewProject(this.newProjectDescription);
        console.log(response);
        if (response.status === "success") {
          alert('Begin to create project');
          this.getProjectList();
          this.showCreateProjectDialog = false;
        } else {
          alert('Failed to create project');
        }
      },
      cancelCreateProject() {
        this.showCreateProjectDialog = false;
      },
      getProjectList: async function() {
        const response = await projectService.getProjectList();
        console.log(response);
        if (response.status === "success") {
          this.projectCnt = response.tutorial_cnt;
          this.projects = response.tutorials;
        } else {
          if (response.status === "fail") {
            alert(response.info);
          }
          else{
            console.error('Failed to fetch projects');
          }
        }
      },
      goToProject(tutorialId) {
        this.$router.push({ name: '/tutorial', query: { tutorialId: tutorialId } });
      },
    },
  };
  </script>
  
  <style scoped>
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  .project-card {
    border: 1px solid #ccc;
    padding: 16px;
    transition: background-color 0.3s ease;
  }

  .status-generating {
    background-color: #f0f0f0; /* Gray background for "生成中" */
    color: #999; /* Light text color */
  }

  .status-error {
    background-color: #ffe6e6; /* Light red background for "生成出错" */
    color: #ff0000; /* Red text color */
  }

  .status-available {
    background-color: #e6ffe6; /* Light green background for "可使用" */
    color: #00cc00; /* Green text color */
  }

  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .dialog {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    max-width: 100%;
  }

  .dialog-actions {
    margin-top: 15px;
    display: flex;
      justify-content: space-between;
  }

  textarea {
    width: 100%;
    margin-top: 10px;
    padding: 5px;
    border-radius: 3px;
    border: 1px solid #ccc;
  }

</style>
  