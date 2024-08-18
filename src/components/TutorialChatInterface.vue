<template>
    <div class="chat-interface">
       <!-- Radio Button Group -->
        <div class="content-filter">
          <label>
            <!--set this one to default-->
            <input type="radio" value="all" v-model="contentFilter" />
            全部显示
          </label>
          <label>
            <input type="radio" value="tutorial" v-model="contentFilter" />
            仅教程
          </label>
          <label>
            <input type="radio" value="query" v-model="contentFilter" />
            仅问答
          </label>
        </div>

      <LoadingSpinner :show="isLoading" />
      <div class="chat-container" @mouseup="handleSelection" ref="chatContainer">
        <SelectionMenu :showMenu="showMenu" :menuStyle="menuStyle" @menu-selection="handleMenuSelection" @close="showMenu = false"/>
        <TutorialChatBlock 
          v-for="(blk, index) in filteredChatBlocks" 
          :key="index" 
          :block="blk" 
          :is-newest-block="isNewestBlock"
          @update-block-id="towardsNextBlock" 
          @update-block="updateBlock"
          ref="chatBlocks"
        />
      </div>
      <div class="function-entry-container">
        <div class="function-buttons">
          <button v-for="(button, index) in functionButtons" :key="index" @click="selectFunction(button)">
            {{ button.label }}
          </button>
          <button class="add-button" @click="addFunction">+</button>
        </div>
        <div class="input-container">
          <div v-if="quote" class="quote-section">
            {{ quote }}
            <span @click="removeQuote">x</span>
          </div>
          <div class="input-row">
            <div v-if="selectedFunction" class="function-tag">
              {{ selectedFunction.label }}
              <span @click="removeFunction">x</span>
            </div>
            <textarea v-model="newMessage" placeholder="输入……" @keydown.enter="sendMessage"></textarea>
            <button @click="sendMessage" class="send-button">
              <i class="fas fa-paper-plane">发送</i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialChatBlock} from './TutorialChatBlock.vue';
  import {debounce} from 'lodash';
  import contentService from '@/services/contentService';
  import LoadingSpinner from './LoadingSpinner.vue';
  import SelectionMenu from './SelectionMenu.vue';
  
  export default {
    name: 'TutorialChatInterface',
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
        }
    },
    components: {
      TutorialChatBlock,
      LoadingSpinner,
      SelectionMenu,
    },
    computed: {
      filteredChatBlocks() {
        if (this.contentFilter === 'all') {
          return this.chatBlocks;
        } else if (this.contentFilter === 'tutorial') {
          return this.chatBlocks.filter(block => block.block_type === 'tutorial');
        } else if (this.contentFilter === 'query') {
          return this.chatBlocks.filter(block => block.block_type != 'tutorial');
        }
      },
      
    },
    data() {
      return {
        chatBlocks: [],
        newMessage: '',
        quote: '',
        selectedFunction: null,
        functionButtons: [
            { label: '解释' },
            { label: 'Debug' },
            { label: '可视化' },
            { label: '练习' },
        ],
        getBlockIntervalId: null,
        isLoading: false, //control the occurence of loading spinner
        showMenu: false,
        selectedText: '',
        menuStyle: {
          top: '0px',
          left: '0px',
        },
        selectedBlockId: null,
        quoteBlockId: null,
        contentFilter: 'all',
        total_steps: 0,
      };
    },
    created() {
      if (this.subStepId) {
        this.initChatBlocks();
      }
    },
    mounted() {
      this.scrollToBottom();
    },
    watch: {
      subStepId: function(newVal, oldVal) {
        this.debounceInitChatblocks();
      },
      stepId : function(newVal, oldVal) {
        this.debounceInitChatblocks();
      },
      filteredChatBlocks: function(newVal, oldVal) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
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
          const blockId = this.chatBlocks[blockIndex].block_index.block_id;
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
        const blocks = this.$refs.chatBlocks;
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
            this.quoteText();
            this.quoteBlockId = this.selectedBlockId;
            break;
          case 'collection':
            this.addToCollection();
            break;
          default:
            break;
        }
        this.showMenu = false;
      },
      quoteText() {
        this.quote = this.selectedText;
      },
      addToCollection() {
        // Logic to add selected text to collection
      },
      debounceInitChatblocks: debounce(function() {
        this.initChatBlocks();
      }, 300),
      initChatBlocks: async function() {
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
              this.chatBlocks = response.blocks;
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
              this.chatBlocks = [];
            }
            this.chatBlocks.push(newBlock);
            this.updateBlockId(newBlock.block_index.block_id);
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
      },
      towardsNextBlock(blockId) {
        //call get next block, until really get the next block
        //alert('towardsNextBlock, blockId: ' + blockId);
        this.updateBlockId(blockId);
        this.getNextBlock();
      },
      sendMessage: async function() {
        if (this.newMessage.trim()) {
          const hasQuote = this.quote.length > 0;
          //console.log('tutorialId', this.tutorialId, 'stepId', this.stepId, 'subStepId', this.subStepId, 'blockId', this.blockId, 'newMessage', this.newMessage, 'selectedFunction', this.selectedFunction, 'hasQuote', hasQuote, 'quote', this.quote, 'quoteBlockId', this.quoteBlockId);
          const response = await contentService.postUserQuery(
            this.tutorialId, this.stepId, this.subStepId, this.blockId, 
            this.newMessage,this.selectedFunction.label, hasQuote, this.quote, this.quoteBlockId);
          this.newMessage = '';
          this.quote = '';
          this.selectedFunction = null;
          this.$nextTick(() => {
            const chatContainer = this.$el.querySelector('.chat-container');
            chatContainer.scrollTop = chatContainer.scrollHeight;
          });
          if (response.status === "success") {
            const nextBlockId = response.next_block_id;
            this.updateBlockId(nextBlockId);
            this.getNextBlock();
          }else {
            if (response.status === "fail") {
              alert(response.info);
            } else {
              alert('Failed to submit user query');
            }
          }
        }
      },
      selectFunction(button) {
        this.selectedFunction = button;
      },
      removeFunction() {
        this.selectedFunction = null;
      },
      addFunction() {
        // Logic to add new function buttons if needed
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
        for (let i = 0; i < this.chatBlocks.length; i++) {
          if (this.chatBlocks[i].block_index.block_id == block.block_index.block_id) {
            this.chatBlocks[i] = block;
            break;
          }
        }
      },
      isNewestBlock(blockId) {
        return this.maxBlockId <= blockId;
      },
      scrollToBottom() {
        this.$nextTick(() => {
          const chatContainer = this.$refs.chatContainer;
          chatContainer.scrollTop = chatContainer.scrollHeight;
        });
      },
    },
  };
  </script>
  
<style scoped>
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%; /* Full height within the content container */
  padding: 20px;
  box-sizing: border-box;
  position: relative; /* Ensure child elements can be positioned relative to this container */
  width: 100%; /* Ensure the chat interface takes full width of the content container */
}

.content-filter {
  position: fixed;
  top: 0;
  left: 250px; /* Align with the start of the content-container */
  width: calc(100% - 250px); /* Take up the remaining width within the content container */
  max-width: 80%; /* Limit width to 80% of the viewport width for centering */
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  padding: 10px;
  border-radius: 10px;
  z-index: 1000; /* Ensure it stays on top */
  margin-left: auto;
  margin-right: auto;
  right: 0;
}

.chat-container {
  flex-grow: 1;
  overflow-y:scroll;
  display: flex;
  flex-direction: column;
  padding: 20px;
  top: 10px; /* Space for the fixed content filter */
  width: 100%; /* Centered container takes up 80% width */
  max-width: calc(100vw - 350px); /* Ensure it doesn't exceed the remaining content width */
  bottom: 200px;
  margin-left: auto;
  margin-right: auto;
  margin-top:20px;
  margin-bottom:200px;
}

.function-entry-container {
  position: fixed;
  bottom: 0;
  left: 250px; /* Align with the start of the content-container */
  width: calc(100% - 250px); /* Take up the remaining width within the content container */
  max-width: 80%; /* Limit width to 80% of the viewport width for centering */
  padding: 10px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
  box-sizing: border-box; /* Ensure padding is included in width */
  z-index: 1000; /* Ensure it stays on top */
  margin-left: auto;
  margin-right: auto;
  max-height: 200px;
  right: 0;
}

.function-buttons {
  display: flex;
  margin-bottom: 10px;
}

.function-buttons button {
  background: #f1f1f1;
  border: none;
  border-radius: 20px;
  margin-right: 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.add-button {
  background: none;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 10px;
  cursor: pointer;
}
.input-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 10px 15px;
  width: 100%;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.input-row {
  display: flex;
  align-items: center;
  margin-top: 10px; /* Space between quote and input row */
}

.function-tag {
  background: #f1f1f1;
  border-radius: 10px;
  margin-right: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}

.function-tag span {
  margin-left: 5px;
  cursor: pointer;
  color: #007bff;
}

.quote-section {
  background: #f1f1f1;
  border-radius: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
  margin-bottom: 10px; /* Space between quote and input row */
}

.quote-section span {
  margin-left: 5px;
  cursor: pointer;
  color: #007bff;
}

textarea {
  flex-grow: 1;
  border: none;
  outline: none;
  resize: none;
  padding: 10px;
  font-size: 16px;
  min-height: 50px;
  border-radius: 10px;
  margin-right: 10px;
}

.send-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px;
  cursor: pointer;
}

.send-button i {
  font-size: 18px;
}


</style>
  