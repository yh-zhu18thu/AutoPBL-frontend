<template>
    <div id="tutorial-page">
      <TutorialMenu :tutorialId="currentTutorialId" :stepId="currentStepId" :subStepId="currentSubStepId" @update-step-id="updateCurrentStepId" @update-sub-step-id="updateCurrentSubStepId" class="menu-container"/>
      <div class="content-container">
        <TutorialChatInterface :tutorialId="currentTutorialId" :stepId="currentStepId" :subStepId="currentSubStepId" :blockId="currentBlockId"  @update-step-id="updateCurrentStepId" @update-sub-step-id="updateCurrentSubStepId" @update-block-id="updateCurrentBlockId" class="chat-container"/>
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialMenu} from './TutorialMenu.vue';
  import {default as TutorialChatInterface} from './TutorialChatInterface.vue';
  import contentService from '@/services/contentService';
  
  export default {
    name: 'TutorialPage',
    data() {
      return {
        currentTutorialId: Number(this.$route.params.tutorial_id) || null,
        currentStepId: null,
        currentSubStepId: null,
        currentBlockId: null,
      };
    },
    components: {
      TutorialMenu,
      TutorialChatInterface
    },
    // when init, fetch the tutorial status
    created() {
      this.initCurrentProgress();
    },
    //fetch the tutorial id from router: this.$router.push({ path: '/tutorial/' + tutorialId });

    methods: {
      initCurrentProgress: async function() {
        const response = await contentService.showBlocks(this.currentTutorialId);
        if (response.status === "fail") {
          alert('Failed to fetch tutorial progress');
          this.$router.push('/board');
        }
        let blockLength = Number(response.length);
        //console.log('block', response);
        if (blockLength == 0) {
          this.currentStepId = 0;
          this.currentSubStepId = 0;
          this.currentBlockId = null;
        } else {
          // get the last block in response.blocks
          let lastBlock = response.blocks[blockLength - 1];
          this.currentStepId = Number(lastBlock.block_index.step_id);
          this.currentSubStepId = Number(lastBlock.block_index.sub_step_id);
          this.currentBlockId = Number(lastBlock.block_index.block_id);
        }
      },
      updateCurrentStepId(stepId) {
        this.currentStepId = stepId;
      },
      updateCurrentSubStepId(subStepId) {
        //alert('updateCurrentSubStepId: ' + subStepId);
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
    height: 100vh; /* Full browser height */
    width: 100vw; /* Full browser width */
  }

  .menu-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px; /* Fixed width for the menu */
    height: 100vh; /* Full height for the menu */
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .content-container {
    position: fixed;
    top: 0;
    left: 250px; /* Start after the menu */
    width: calc(100vw - 250px); /* Take up the remaining width */
    height: 100vh; /* Full height for the content */
    background-color: #ffffff; /* Optional: background color for content */
    overflow: auto; /* Enable scrolling within the content container if needed */
  }

  </style>
  
  