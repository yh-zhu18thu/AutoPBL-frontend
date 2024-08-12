<template>
    <div class="menu">
      <div class="menu-title">教程目录</div>
      <div v-for="(item, index) in menuItems" :key="index" class="menu-item">
        <div @click="selectItem(item)" class="menu-item-title">
          {{ item.name }}
        </div>
        <div v-if="item.subItems" class="submenu">
          <div v-for="(subItem, subIndex) in item.subItems" :key="subIndex" @click="selectSubItem(subItem)" class="submenu-item">
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
        },
        blockId: {
            type: String,
            required: false
        }
    },
    data() {
      return {
        menuItems: [],
      };
    },
    methods: {
      goBack() {
        // Handle the go back action
      },
      selectItem(item) {
        // Handle item selection
      },
      selectSubItem(subItem) {
        // Handle sub-item selection
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
  