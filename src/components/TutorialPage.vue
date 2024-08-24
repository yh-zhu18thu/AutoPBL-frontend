<template>
  <div id="tutorial-page">
    <TutorialMenu 
      :tutorialId="currentTutorialId" 
      :stepId="currentStepId" 
      :subStepId="currentSubStepId" 
      :maxStepId="maxStepId"
      :maxSubStepId="maxSubStepId"
      @update-step-id="updateCurrentStepId" 
      @update-sub-step-id="updateCurrentSubStepId" 
      class="menu-container"/>
    <div class="main-content">
      <div 
        ref="contentContainer" 
        class="content-container" 
        :style="{ width: tutorialWidth + '%' }"
      >
        <TutorialInterface 
          :tutorialId="currentTutorialId" 
          :stepId="currentStepId" 
          :subStepId="currentSubStepId" 
          :blockId="currentBlockId"  
          :maxBlockId="maxBlockId"
          :quoteBlock="quoteBlock"
          :quoteContent="quoteContent"
          @update-step-id="updateCurrentStepId" 
          @update-sub-step-id="updateCurrentSubStepId" 
          @update-block-id="updateCurrentBlockId"
          @force-update="forceUpdate"
          @update-quote="updateQuote"
        />
      </div>
      <div 
        class="drag-bar" 
        @mousedown="startDragging"
      >
        <div class="chat-toggle" @click="toggleChat">
          {{ isChatExpanded ? '>>' : '<<' }}
        </div>
      </div>
      <div 
        ref="chatContainer"
        class="chat-container" 
        :style="{ width: chatWidth + '%' }"
      >
        <ChatPanel 
          v-if="isChatExpanded"
          @toggle-chat="toggleChat"
          :tutorialId="currentTutorialId"
          :maxStepId="maxStepId"
          :maxSubStepId="maxSubStepId"
          :maxBlockId="maxBlockId"
          :quoteBlock="quoteBlock"
          :quoteContent="quoteContent"
          @update-quote="updateQuote"
        />
      </div>
    </div>
  </div>
</template>

  
  <script>
  import {default as TutorialMenu} from './TutorialMenu.vue';
  import {default as TutorialInterface} from './TutorialInterface.vue';
  import contentService from '@/services/contentService';
  import {default as ChatPanel} from './ChatPanel.vue';
  
  export default {
    name: 'TutorialPage',
    data() {
      return {
        currentTutorialId: Number(this.$route.params.tutorial_id),
        currentStepId: null,
        currentSubStepId: null,
        currentBlockId: null,
        maxBlockId: -1,
        maxStepId: -1,
        maxSubStepId: -1,
        isChatExpanded: true,
        quoteBlock: null,
        quoteContent: '',
        tutorialWidth: 70, // 初始宽度比例
        chatWidth: 30,     // 初始宽度比例
        isDragging: false, // 是否正在拖拽
        startX: 0,         // 拖拽起始位置
        containerWidth: 0, // 整个页面宽度
      };
    },
    components: {
      TutorialMenu,
      TutorialInterface,
      ChatPanel
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
          //alert('No block found');
          this.currentStepId = 0;
          this.currentSubStepId = 0;
          this.currentBlockId = null;
          this.maxStepId = 0;
          this.maxSubStepId = 0;
        } else {
          // get the last block in response.blocks
          //alert('blockLength: ' + blockLength);
          let lastBlock = response.blocks[blockLength - 1];
          this.currentStepId = Number(lastBlock.block_index.step_id);
          this.currentSubStepId = Number(lastBlock.block_index.sub_step_id);
          this.currentBlockId = Number(lastBlock.block_index.block_id);
          this.maxBlockId = this.currentBlockId;
          this.maxStepId = this.currentStepId;
          this.maxSubStepId = this.currentSubStepId;
        }
      },
      updateCurrentStepId(stepId, subStepId) {
        //alert('updateCurrentStepId: ' + stepId);
        this.currentStepId = stepId;
        this.currentSubStepId = subStepId;
        if (stepId > this.maxStepId) {
          this.maxStepId = stepId;
          this.maxSubStepId = subStepId;
        } else if (stepId == this.maxStepId && subStepId > this.maxSubStepId) {
          this.maxSubStepId = subStepId;
        }
        //alert('maxStepId: ' + this.maxStepId);
      },
      forceUpdate(stepId, subStepId, blockId) {
        this.stepId = stepId;
        this.subStepId = subStepId;
        this.currentBlockId = blockId;

        this.maxStepId = stepId;
        this.maxSubStepId = subStepId;
        this.maxBlockId = blockId;
      },
      updateCurrentBlockId(blockId) {
        this.currentBlockId = blockId
        if (blockId > this.maxBlockId) {
          this.maxBlockId = blockId;
        }
        //alert('updateCurrentBlockId: ' + blockId+ ', maxBlockId: ' + this.maxBlockId);
      },
      updateQuote(quoteContent,quoteBlock) {
        //alert('updateQuote: ' + quoteContent + ', ' + quoteBlock);
        this.quoteBlock = quoteBlock;
        this.quoteContent = quoteContent;
      },
      toggleChat() {
        if (this.isChatExpanded) {
          this.chatWidth = 0;
          this.tutorialWidth = 100;
        } else {
          this.chatWidth = 30;
          this.tutorialWidth = 70;
        }
        this.isChatExpanded = !this.isChatExpanded;
      },
      startDragging(event) {
        this.isDragging = true;
        this.startX = event.clientX;
        document.addEventListener('mousemove', this.onDragging);
        document.addEventListener('mouseup', this.stopDragging);

        // 禁用 transition
        this.$refs.contentContainer.style.transition = 'none';
        this.$refs.chatContainer.style.transition = 'none';
        this.containerWidth = this.$refs.contentContainer.parentNode.offsetWidth;
      },
      onDragging(event) {
        if (!this.isDragging) return;
        requestAnimationFrame(() => {
          const deltaX = event.clientX - this.startX;
          let newTutorialWidth = ((this.$refs.contentContainer.offsetWidth + deltaX) / this.containerWidth) * 100;
          let newChatWidth = 100 - newTutorialWidth;

          if (newTutorialWidth < 50) {
            newTutorialWidth = 50;
            newChatWidth = 50;
          } else if (newChatWidth < 15) {
            newChatWidth = 15;
            newTutorialWidth = 85;
          }

          this.tutorialWidth = newTutorialWidth;
          this.chatWidth = newChatWidth;
          this.startX = event.clientX;
        });
      },
      stopDragging() {
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onDrag);
        document.removeEventListener('mouseup', this.stopDragging);
        // 恢复 transition
        this.$refs.contentContainer.style.transition = '';
        this.$refs.chatContainer.style.transition = '';
      },
    },
  };
  </script>
  
<style scoped>
  #tutorial-page {
    display: flex;
    height: 100vh;
    width: 100vw;
  }

  .menu-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 250px;
    height: 100vh;
    background-color: #f8f9fa;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  .main-content {
    display: flex;
    flex-direction: row;
    position: fixed;
    top: 0;
    left: 250px;
    height: 100vh;
    width: calc(100vw - 250px);
    overflow: hidden;
  }

  .content-container {
    flex-grow: 1;
    height: 100vh;
    background-color: #ffffff;
  }

  .chat-container {
    height: 100vh;
    background-color: #f0f0f0;
  }

  .chat-container.expanded {
    display: block;
  }


  .drag-bar {
    width: 5px; /* 分割线宽度 */
    background-color: #cccccc;
    cursor: ew-resize; /* 鼠标在分割线上时显示拖拽样式 */
    position: relative;
    z-index: 10; /* 确保分割线在其他元素之上 */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .chat-toggle {
    width: 20px;
    height: 40px;
    background-color: #bbbbbb;
    color: white;
    cursor: pointer;
    text-align: center;
    line-height: 40px;
    font-size: 14px;
    border-radius: 4px;
    z-index: 20; /* 保证toggle按钮在最上层 */
    user-select: none; /* 防止用户选择到文本 */
  }




  </style>
  
  