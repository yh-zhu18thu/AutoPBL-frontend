<template>
    <div class="tutorial-interface">
      <LoadingSpinner :show="isLoading" />
      <div class="tutorial-container" @mouseup="handleSelection" ref="tutorialContainer">
        <SelectionMenu :showMenu="showMenu" :menuStyle="menuStyle" @menu-selection="handleMenuSelection" @close="showMenu = false"/>
        <div v-if="showCollectionPopup" class="overlay" @click="closeCollectionPopup"></div>
        <div
          v-if="showCollectionPopup"
          :style="collectionPopupPosition"
          class="popup-ui"
        >
          <div class="popup-content">
            <div class="selected-text">{{ selectedText }}</div>
            <div class="selector-input">
              <select v-model="selectedType">
                <option value="type1">重点</option>
                <option value="type2">疑惑</option>
                <option value="type3">想法</option>
              </select>
              <input type="text" v-model="note" placeholder="添加笔记..." />
            </div>
            <button @click="addToCollection" class="submit-button">提交</button>
          </div>
        </div>
        <TutorialBlock 
          v-for="(blk, index) in filteredBlocks" 
          :key="index" 
          :block="blk" 
          :is-newest-block="isNewestBlock"
          @update-block-id="towardsNextBlock" 
          @update-block="updateBlock"
          @refresh-block="refreshBlock"
          ref="tutorialBlocks"
        />
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialBlock} from './TutorialBlock.vue';
  import {debounce} from 'lodash';
  import contentService from '@/services/contentService';
  import collectionService from '@/services/collectionService';
  import LoadingSpinner from './LoadingSpinner.vue';
  import SelectionMenu from './SelectionMenu.vue';
  
  export default {
    name: 'TutorialInterface',
    props:{
        tutorialId: {
            type: Number,
            required: true
        },
        stepId: {
            type: Number,
            required: true
        },
        subStepId: {
            type: Number,
            required: true
        },
        blockId: {
            type: Number,
            required: true 
        },
        maxBlockId: {
            type: Number,
            required: true
        },
        quoteBlock: {
            type: Object,
            required: true
        },
        quoteContent: {
            type: String,
            required: true
        },
    },
    components: {
      TutorialBlock,
      LoadingSpinner,
      SelectionMenu,
    },
    computed: {
      filteredBlocks() {
        return this.tutorialBlocks.filter(block => block.block_type === 'tutorial');
      },
    },
    data() {
      return {
        tutorialBlocks: [],
        newMessage: '',
        getBlockIntervalId: null,
        timeoutId: null,
        isLoading: false, //control the occurence of loading spinner
        showMenu: false,
        menuStyle: {
          top: '0px',
          left: '0px',
        },
        selectedText: '',
        showCollectionPopup: false,
        collectionPopupPosition: {
          top: '0px',
          left: '0px',
        },
        selectedType: '',
        note: '',
        selectedBlockId: null,
        contentFilter: 'all',
        total_steps: 0,
        messageOntheWay: false,
      };
    },
    created() {
      if (this.subStepId) {
        this.initBlocks();
      }
    },
    mounted() {
      this.scrollToBottom();
    },
    watch: {
      subStepId: function(newVal, oldVal) {
        this.debounceInitblocks();
      },
      stepId : function(newVal, oldVal) {
        this.debounceInitblocks();
      },
      filteredBlocks: function(newVal, oldVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      },
      showCollectionPopup: function(newVal, oldVal) {
        if (newVal) {
          this.collectionPopupPosition = { ...this.menuStyle };
        }
      },
    },
    methods: {
      handleSelection() {
        const selection = window.getSelection();
        //alert('selection: ' + selection.toString());
        if (selection.toString().length > 0) {
          this.selectedText = selection.toString();
          const rect = selection.getRangeAt(0).getBoundingClientRect();
          const offsetX = -300;
          const offsetY = -20;
          const blockIndex = this.findBlockIdForSelection(selection.getRangeAt(0));
          //alert('blockIndex: ' + blockIndex);
          const blockId = this.tutorialBlocks[blockIndex].block_index.block_id;
          if (blockId) {
            this.selectedBlockId = blockId;
            this.menuStyle.top = `${rect.bottom + window.scrollY+offsetY}px`;
            this.menuStyle.left = `${rect.right + window.scrollX+offsetX}px`;
            this.showMenu = true;
          }
        } else {
          this.showMenu = false;
        }
      },
      findBlockIdForSelection(range) {
        const rangeRect = range.getBoundingClientRect();
        //alert('rangeRect: ' + rangeRect.top + ', ' + rangeRect.bottom + ', ' + rangeRect.left + ', ' + rangeRect.right);
        const blocks = this.$refs.tutorialBlocks;
        console.log('*blocks', blocks.map(block => block.$el));
        for (let i = 0; i < blocks.length; i++) {
          const blockElement = blocks[i].$el;
          const blockRange = document.createRange();
          blockRange.selectNodeContents(blockElement);
          // Check if the selection range intersects with the block range
          const bounding_rect = blockRange.getBoundingClientRect();
          //alert('bounding_rect: ' + bounding_rect.top + ', ' + bounding_rect.bottom + ', ' + bounding_rect.left + ', ' + bounding_rect.right);
          if (
            rangeRect.top <= bounding_rect.bottom &&
            rangeRect.bottom >= bounding_rect.top &&
            rangeRect.left <= bounding_rect.right &&
            rangeRect.right >= bounding_rect.left
          ) {
            return i;
          }
        }
        return null;  // No matching block found
      },
      handleMenuSelection(choice) {
        switch (choice) {
          case 'copy':
            navigator.clipboard.writeText(this.selectedText);
            break;
          case 'quote':
            const quoteContent = this.selectedText;
            const quoteBlockId = this.selectedBlockId;
            const quoteBlock = this.tutorialBlocks.find(block => block.block_index.block_id === quoteBlockId);
            alert('quoteContent: ' + quoteContent + ', quoteBlockId: ' + quoteBlockId);
            this.$emit('update-quote', quoteContent, quoteBlock);
          case 'collection':
            this.showCollectionPopup = true;
            break;
          default:
            break;
        }
        this.showMenu = false;
      },
      addToCollection: async function() {
        const collectionContent = {
          type: this.selectedType,
          note: this.note,
          content: this.selectedText,
        };
        const response = await collectionService.addNewCollection(this.tutorialId,this.stepId,this.subStepId,this.selectedBlockId,0,JSON.stringify(collectionContent));
        if (response.status === "success") {
          alert('成功添加到收藏夹');
          this.showCollectionPopup = false;
        }else{
          if (response.status === "fail") {
            alert(response.info);
          }else{
            alert('Failed to fetch tutorial progress');
          }
        }
      },
      closeCollectionPopup() {
        this.showCollectionPopup = false;
        this.note = '';
        this.selectedType = '';
      },
      debounceInitblocks: debounce(function() {
        this.initBlocks();
      }, 300),
      initBlocks: async function() {
        //call get substep chat blocks
        //alert('initChatBlocks, subStepId: ' + this.subStepId + ', stepId: ' + this.stepId + ', blockId: ' + this.blockId);
        if (this.subStepId!=null){
          if (this.stepId==0 && this.subStepId==0 && (this.blockId==null || this.blockId==NaN)){
            //generate the first block of the tutorial
            const response = await contentService.generateFirstBlock(this.tutorialId);
            if (response.status === "success") {
              const newBlockId = response.next_block_id;
              //alert('new block id: ' + newBlockId);
              this.updateBlockId(newBlockId);
              this.getNextBlock();
            }else{
              if (response.status === "fail") {
                alert(response.info);
                this.$router.push('/board');
              }else{
                alert('Failed to fetch tutorial progress');
                this.$router.push('/board');
              }
            }
          } else {
            //get all the chat blocks of the substep
            const response = await contentService.getSubStepBlocks(this.tutorialId, this.stepId, this.subStepId);
            if (response.status === "success") {
              this.tutorialBlocks = response.blocks;
              const blockId = response.blocks[response.blocks.length - 1].block_index.block_id;
              this.updateBlockId(blockId);
            }else {
              if (response.status === "fail") {
                alert(response.info);
                this.$router.push('/board');
              }else{
                alert('Failed to fetch tutorial progress');
                this.$router.push('/board');
              }
            }
          }
        }
      },
      getNextBlock() {
        //call get next block, until really get the next block
        this.getBlockIntervalId = setInterval(async () => {
          this.isLoading = true;
          const response = await contentService.getNextBlock(this.blockId);
          console.log('get block response', response);
          if (response.status === "ready") {
            this.isLoading = false;
            const newBlock = response.block;
            //alert('new block step_id: ' + newBlock.block_index.step_id + ', sub_step_id: ' + newBlock.block_index.sub_step_id + ', block_id: ' + newBlock.block_index.block_id);
            //alert('current step_id: ' + this.stepId + ', sub_step_id: ' + this.subStepId);
            if (newBlock.block_index.sub_step_id != this.subStepId || newBlock.block_index.step_id != this.stepId) {
              this.$emit('update-step-id', newBlock.block_index.step_id);
              this.$emit('update-sub-step-id', newBlock.block_index.sub_step_id);
              //clear the chat blocks
              this.tutorialBlocks = [];
            }
            this.tutorialBlocks.push(newBlock);
            this.updateBlockId(newBlock.block_index.block_id);
            clearTimeout(this.timeoutId);
            clearInterval(this.getBlockIntervalId);
          }else{
            if (response.status == 'generating'){
              this.isLoading = true;
            } else if (response.status === "fault") {
              alert("generation failed");
            } else {
              if (response.status === "fail") {
                alert(response.info);
                this.$router.push('/board');
              } else {
                alert('Failed to fetch tutorial progress');
                this.$router.push('/board');
              }
            }
          }
        }, 1000);
        //set timeout to clear the interval if no response in 120 seconds and refresh the block
        this.timeoutId = setTimeout(() => {
          alert("抱歉，生成时间过长，系统将自动重新生成");
          clearInterval(this.getBlockIntervalId);
          this.refreshBlock(this.blockId);
        }, 120000);
      },
      towardsNextBlock(blockId) {
        //call get next block, until really get the next block
        //alert('towardsNextBlock, blockId: ' + blockId);
        this.updateBlockId(blockId);
        this.getNextBlock();
      },
      removeQuote() {
        this.quote = '';
      },
      updateStepId(stepId) {
        this.$emit('update-step-id', stepId);
      },
      updateSubStepId(subStepId) {
        this.$emit('update-sub-step-id', subStepId);
      },
      updateBlockId(blockId) {
        //alert('updateBlockId: ' + blockId);
        this.$emit('update-block-id', blockId);
      },
      updateBlock(block){
        //iterate through the chatblocks and find the block with the same block_id, then update it
        for (let i = 0; i < this.tutorialBlocks.length; i++) {
          if (this.tutorialBlocks[i].block_index.block_id == block.block_index.block_id) {
            this.tutorialBlocks[i] = block;
            break;
          }
        }
      },
      forceUpdate(stepId, subStepId, blockId) {
        this.$emit('force-update', stepId, subStepId, blockId);
      },
      removeBlockAfter(blockId){
        for (let i = 0; i < this.tutorialBlocks.length; i++) {
          if (this.tutorialBlocks[i].block_index.block_id == blockId) {
            this.tutorialBlocks = this.tutorialBlocks.slice(0, i);
            break;
          }
        }
      },
      isNewestBlock(blockId) {
        return this.maxBlockId <= blockId;
      },
      scrollToBottom() {
        this.$nextTick(() => {
          const tutorialContainer = this.$refs.tutorialContainer;
          tutorialContainer.scrollTop = tutorialContainer.scrollHeight;
        });
      },
      //目前只支持refresh最新的block（在没有回答时，或者生成不成功时）
      refreshBlock: async function(stepId,subStepId,blockId) {
        this.removeBlockAfter(blockId);
        const response = await contentService.refreshBlock(this.tutorialId, blockId);
        if (response.status === "success") {
          const nextBlockId = response.regenerated_block_id;
          this.forceUpdate(stepId, subStepId, nextBlockId);
          this.getNextBlock();
          this.deleteBlock(blockId);
        }else{
          if (response.status === "fail") {
            alert(response.info);
            this.$router.push('/board');
          }else{
            alert('Failed to fetch tutorial progress');
            this.$router.push('/board');
          }
        }
      }
    },
  };
  </script>
  
<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}
.tutorial-interface {
  display: flex;
  flex-direction: column;
  height: 100%; /* Full height within the content container */
  padding: 20px;
  box-sizing: border-box;
  position: relative; /* Ensure child elements can be positioned relative to this container */
  width: 100%; /* Ensure the chat interface takes full width of the content container */
}

.tutorial-container {
  flex-grow: 1;
  overflow-y:scroll;
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%; /* Centered container takes up 80% width */
  max-width: calc(100vw - 350px); /* Ensure it doesn't exceed the remaining content width */
  margin-left: auto;
  margin-right: auto;
}

.selection-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #ccc;
  padding: 5px;
  z-index: 1000;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.popup-ui {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  border: 1px solid #ccc;
  width: 350px;
  padding: 20px;
  z-index: 1001;
  border-radius: 15px; /* 更圆角的设计 */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.popup-content {
  display: flex;
  flex-direction: column;
}

.selected-text {
  font-style: italic; /* 斜体 */
  color: #555; /* 浅色字体 */
  background-color: #f0f0f0; /* 灰色背景 */
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
}

.selector-input {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.selector-input select {
  width: 100%; /* 缩短 selector */
  margin-bottom: 10px;
  padding: 5px;
  border-radius: 5px; /* 圆角 selector */
  border: 1px solid #ccc;
}

.selector-input textarea {
  width: 100%;
  height: 100px; /* 增大笔记输入框 */
  padding: 10px;
  border-radius: 5px; /* 圆角输入框 */
  border: 1px solid #ccc;
  resize: none; /* 禁止调整大小 */
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 20px; /* 更圆角的按钮 */
  font-size: 16px;
  text-align: center;
}


</style>
  