<template>
    <div class="chat-interface">
      <LoadingSpinner :show="isLoading" />
      <div class="chat-container">
        <TutorialChatBlock v-for="(blk, index) in chatBlocks" :key="index" :block="blk" :update-block-id="towardsNextBlock" :update-block="updateBlock"/>
      </div>
      <div class="function-entry-container">
        <div class="function-buttons">
          <button v-for="(button, index) in functionButtons" :key="index" @click="selectFunction(button)">
            {{ button.label }}
          </button>
          <button class="add-button" @click="addFunction">+</button>
        </div>
        <div class="input-container">
          <div v-if="selectedFunction" class="function-tag">
            {{ selectedFunction.label }}
            <span @click="removeFunction">x</span>
          </div>
          <div v-if="quote" class="quote-section">
            {{ quote }}
            <span @click="removeQuote">x</span>
          </div>
          <textarea v-model="newMessage" placeholder="输入……"></textarea>
          <button @click="sendMessage" class="send-button">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialChatBlock} from './TutorialChatBlock.vue';
  import contentService from '@/services/contentService';
  import LoadingSpinner from './LoadingSpinner.vue';
  
  export default {
    name: 'TutorialChatInterface',
    props:{
        tutorialId: {
            type: Number,
            required: true
        },
        stepId: {
            type: Number,
            required: false
        },
        subStepId: {
            type: Number,
            required: false
        },
        blockId: {
            type: Number,
            required: false
        }
    },
    components: {
      TutorialChatBlock,
      LoadingSpinner
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
        isLoading: false //control the occurence of loading spinner
      };
    },
    created() {
      if (this.subStepId) {
        this.initChatBlocks();
      }
    },
    watch: {
      subStepId: function(newVal, oldVal) {
        this.initChatBlocks();
      }
    },
    methods: {
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
        this.isLoading = true;
        this.getBlockIntervalId = setInterval(async () => {
          const response = await contentService.getNextBlock(this.blockId);
          if (response.status === "ready") {
            this.isLoading = false;
            const newBlock = response.block;
            if (newBlock.block_index.sub_step_id != this.subStepId || newBlock.block_index.step_id != this.stepId) {
              this.$emit('update-step-id', newBlock.block_index.step_id);
              this.$emit('update-sub-step-id', newBlock.subStepId);
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
      sendMessage() {
        if (this.newMessage.trim()) {
          this.messages.push(this.newMessage);
          this.newMessage = '';
          this.$nextTick(() => {
            const chatContainer = this.$el.querySelector('.chat-container');
            chatContainer.scrollTop = chatContainer.scrollHeight;
          });
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
      }
    },
  };
  </script>
  
<style scoped>
.chat-interface {
  margin-left: 130px;
  display: flex;
  overflow-y: hidden;
  flex-direction: column;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.chat-container {
  position: absolute;
  flex-grow: 1;
  /* limit the height of the chat container */
  max-height: calc(100% - 100px);
  overflow-y: auto;
  display: flex;
  padding: 10px;
  margin-top: 50px;
  margin-left: 130px;
  flex-direction: column;
  padding-bottom: 150px;
  width: calc(100% - 300px); /* Adjust for menu width */
}

.function-entry-container {
  position: fixed;
  bottom: 5px;
  width: calc(100% - 520px); /* Adjust for menu width */
  margin-left: 130px;
  padding: 10px;
  background: #fff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-radius: 20px;
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
  align-items: center;
  border: 1px solid #ccc;
  border-radius: 20px;
  padding: 5px 10px;
  position: relative;
}

.function-tag,
.quote-section {
  background: #f1f1f1;
  border-radius: 10px;
  margin-right: 10px;
  padding: 5px 10px;
  display: flex;
  align-items: center;
}

.function-tag span,
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
  margin-right: 10px;
}

.send-button {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
}

.send-button i {
  font-size: 20px;
}

</style>
  