<template>
    <div class="menu">
      <div class="menu-title">{{ tutorialTitle }}</div>
      <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
        <div class="menu-item-title">
          {{ item.name }}
        </div>
        <div v-if="item.sub_step_cnt>0" class="submenu">
          <div v-for="(subItem, subIndex) in item.sub_steps" :key="subIndex" @click="selectSubItem(subItem)" class="submenu-item">
            {{ subItem.name }}
          </div>
        </div>
      </div>
      <button class="return-button" @click="goBack">
        <i class="fas fa-arrow-left"></i> 返回
      </button>
    </div>
  </template>
  
  <script>
  import contentService from '@/services/contentService';

  export default {
    name: 'TutorialMenu',
    props:{
        tutorialId: {
            type: String,
            required: true
        },
        stepId: {
            type: String,
            required: false
        },
        subStepId: {
            type: String,
            required: false
        }
    },
    data() {
      return {
        tutorialTitle: '',
        menuItems: [],
      };
    },
    created() {
      this.getMenuFramework();
    },
    watch: {
      stepId(newVal, oldVal) {
        //TODO: change the highlight of the menu item
      },
      subStepId(newVal, oldVal) {
        //TODO: change the highlight of the sub-menu item
      },
    },
    methods: {
      goBack() {
        // Handle the go back action
        this.$router.push('/board');
      },
      getMenuFramework: async function(){
        const response = await contentService.getTutorialFramework(this.tutorialId);
        if (response.status === success) {
          this.tutorialTitle = response.title
          this.menuItems = response.menuItems;
        } else {
          if (response.status === fail) {
            alert(response.info);
          } else {
            alert('Failed to fetch tutorial framework');
          }
          this.$router.push('/board');
        }
      },
      selectSubItem(subItem) {
        // Handle sub-item selection
        this.$emit('update-step-id', subItem.step_id);
        this.$emit('update-sub-step-id', subItem.sub_step_id);
      },
    },
  };
  </script>
  
  <style scoped>
  .menu-title {
    margin-top: 10px;
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 100px;
    color: #8b8b8b;
  }
  .menu {
    overflow-y: auto;
    width: 200px;
    background-color: #f8f9fa;
    padding: 10px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .return-button {
    display: flex;
    align-items: center;
    background: none;
    border: none;
    color: #007bff;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 20px;
  }
  
  .return-button i {
    margin-right: 5px;
  }
  
  .menu-item {
    margin-bottom: 10px;
  }
  
  .menu-item-title {
    font-weight: bold;
    cursor: pointer;
    padding: 5px;
    transition: background-color 0.2s;
  }
  
  .menu-item-title:hover {
    background-color: #e9ecef;
  }
  
  .submenu {
    margin-left: 20px;
    margin-top: 5px;
  }
  
  .submenu-item {
    cursor: pointer;
    padding: 3px;
    transition: background-color 0.2s;
  }
  
  .submenu-item:hover {
    background-color: #e9ecef;
  }
  </style>
  