<template>
  <div class="board-page">
    <h2>用户看板</h2>
    <button @click="showCreateProjectDialog = true">Create New Project</button>
    <!-- Popup Dialog -->
    <div v-if="showCreateProjectDialog" class="dialog-overlay">
      <div class="dialog">
        <h3>输入您的项目需求</h3>
        <!-- Multi-line input area -->
        <textarea v-model="newProjectDescription" rows="5" cols="30" placeholder="请输入您的项目需求..."></textarea>
        <!-- Buttons -->
        <div class="dialog-actions">
          <button @click="createProject">提交</button>
          <button @click="cancelCreateProject">取消</button>
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

    <!-- 收藏列表展示区域 -->
    <div class="collection-list">
      <h3>收藏列表</h3>
      <div v-for="item in collectionList" :key="item.id" class="collection-item">
        <div class="item-tag">{{ item.tag }}</div>
        <div class="item-content">{{ item.content }}</div>
        <div class="item-note">{{ item.note }}</div>
      </div>
    </div>
  </div>
</template>
  
  <script>
  import projectService from '@/services/projectService';
  import collectionService from '@/services/collectionService';
  export default {
    name: 'BoardPage',
    data() {
      return {
        projects: [],
        projectCnt: 0,
        showCreateProjectDialog: false,
        newProjectDescription: '',
        intervalId: null,
        collectionList: []
      };
    },
    mounted() {
      // Fetch collections from API
      this.getCollectionList();
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
        //console.log(response);
        if (response.status === "success") {
          alert('开始创建项目');
          this.intervalId = setInterval(() => {
              this.getProjectList();
              // check the status of the last tutorial created
              setTimeout(() => {
                if (this.projects[this.projectCnt - 1].status === 2) {
                  alert('项目创建成功');
                  clearInterval(this.intervalId);
                }
              }, 500);
          }, 1000);
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
      getCollectionList: async function() {
        const response = await collectionService.getCollectionList();
        //alert(JSON.stringify(response));
        if (response.status === "success") {
          const collectionItems = response.collections;
          for (let i = 0; i < collectionItems.length; i++) {
            const collectionItemsJson = JSON.parse(collectionItems[i].content);
            this.collectionList.push({
              id: i,
              tag: collectionItemsJson.type,
              content: collectionItemsJson.content,
              note: collectionItemsJson.note
            });
          }
        } else {
          if (response.status === "fail") {
            alert(response.info);
          }
          else{
            console.error('Failed to fetch collections');
          }
        }

      },
      goToProject(tutorialId) {
        // Redirect to the project page, router rule:{ path: '/tutorial/:tutorial_id', component: TutorialPage }
        this.$router.push({ path: '/tutorial/' + tutorialId });
      },
    },
  };
  </script>
  
  <style scoped>
.board-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh; /* 占据整个页面高度 */
  padding: 20px;
  background-color: #f5f7fa; /* 浅灰色背景 */
}

h2, h3 {
  color: #2c3e50; /* 深蓝色标题 */
}

button {
  background-color: #3498db; /* 蓝色按钮背景 */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9; /* 鼠标悬停时按钮变为深蓝色 */
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  width: 100%;
  margin-top: 20px;
}

.project-card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 5px;
  transition: background-color 0.3s ease, transform 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.project-card:hover {
  transform: translateY(-5px); /* 鼠标悬停时卡片上移 */
}

.status-generating {
  background-color: #ecf0f1; /* 更浅的灰色背景 */
  color: #7f8c8d; /* 中灰色文字 */
}

.status-error {
  background-color: #ffcccc; /* 柔和的红色背景 */
  color: #e74c3c; /* 红色文字 */
}

.status-available {
  background-color: #d0e8f2; /* 淡蓝色背景 */
  color: #2ecc71; /* 绿色文字 */
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
  border-radius: 10px;
  width: 300px;
  max-width: 100%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.dialog h3 {
  color: #34495e; /* 深蓝色标题 */
}

.dialog-actions button {
  background-color: #3498db;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.dialog-actions button:hover {
  background-color: #2980b9;
}

textarea {
  width: 100%;
  margin-top: 10px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ccc;
  transition: border-color 0.3s ease;
}

textarea:focus {
  border-color: #3498db; /* 聚焦时边框变蓝 */
}

.dialog-actions {
  margin-top: 15px;
  display: flex;
  justify-content: space-between;
}

/* 收藏列表样式 */
.collection-list {
  margin-top: 40px;
  width: 100%;
  max-width: 800px;
  text-align: center;
}

.collection-item {
  display: flex;
  flex-direction: column;
  padding: 15px;
  margin-bottom: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-left: 5px solid #3498db;
}

.item-tag {
  font-weight: bold;
  color: #2980b9; /* 深蓝色标签 */
  margin-bottom: 8px;
}

.item-content {
  color: #2c3e50; /* 深蓝色文字 */
  margin-bottom: 8px;
  line-height: 1.5;
  word-wrap: break-word; /* 自动换行 */
}

.item-note {
  font-style: italic;
  color: #7f8c8d; /* 灰色文字 */
}



</style>
  