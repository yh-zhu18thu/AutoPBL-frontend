<template>
    <div id="tutorial-page">
      <TutorialMenu :tutorialId="currentTutorialId" :stepId="currentStepId" :subStepId="currentSubStepId" :blockId="currentBlockId" class="menu-container"/>
      <div class="chat-container">
        <TutorialChatInterface :tutorialId="currentTutorialId" :stepId="currentStepId" :subStepId="currentSubStepId" :blockId="currentBlockId" class="chat-container"/>
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialMenu} from './TutorialMenu.vue';
  import {default as TutorialChatInterface} from './TutorialChatInterface.vue';
  
  export default {
    name: 'TutorialPage',
    data() {
      return {
        currentTutorialId: this.$route.query.tutorialId || null,
        currentStepId: null,
        currentSubStepId: null,
        currentBlockId: null
      };
    },
    components: {
      TutorialMenu,
      TutorialChatInterface
    },
    props:{
        tutorialId: {
            type: String,
            required: true
        }
    },
    methods: {
      updateCurrentStepId(stepId) {
        this.currentStepId = stepId;
      },
      updateCurrentSubStepId(subStepId) {
        this.currentSubStepId = subStepId;
      },
      updateCurrentBlockId(blockId) {
        this.currentBlockId = blockId;
      }
    },
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
  
  