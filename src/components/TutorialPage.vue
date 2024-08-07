<template>
    <div id="tutorial-page">
      <TutorialMenu class="menu-container"/>
      <div class="chat-container">
        <TutorialChatInterface class="chat-container"/>
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialMenu} from './TutorialMenu.vue';
  import {default as TutorialChatInterface} from './TutorialChatInterface.vue';
  
  export default {
    name: 'TutorialPage',
    components: {
      TutorialMenu,
      TutorialChatInterface
    },
    props:{
        tutorial_id: {
            type: String,
            required: true
        }
    },
    mounted() {
      // Fetch tutorial data
      console.log('Fetching tutorial data for tutorial ID:', this.tutorial_id);
    }
  };
  </script>
  
  <style scoped>
  #tutorial-page {
    display: flex;
    height: 100%;
  }
  
  .menu-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 220px;
    height: 100%;
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }
  
  .content-container {
    flex: 1; /* Remaining space for chat interface */
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  </style>
  
  