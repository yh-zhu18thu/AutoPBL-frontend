<template>
    <div class="board-page">
      <h2>Project Board</h2>
      <button @click="createProject">Create New Project</button>
      <div class="projects-grid">
        <div v-for="project in projects" :key="project.id" class="project-card" @click="goToProject(project.id)">
          <h3>{{ project.name }}</h3>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'BoardPage',
    data() {
      return {
        projects: [
          // Sample data
          { id: 1, name: 'Project 1' },
          { id: 2, name: 'Project 2' },
        ],
      };
    },
    methods: {
      createProject() {
        // Handle project creation logic here
      },
      goToProject(projectId) {
        this.$router.push(`/tutorial/${projectId}`);
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
    cursor: pointer;
  }
  </style>
  