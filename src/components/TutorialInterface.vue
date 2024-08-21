<template>
    <div class="tutorial-interface">
      <LoadingSpinner :show="isLoading" />
      <div class="tutorial-container" @mouseup="handleSelection" ref="tutorialContainer">
        <SelectionMenu :showMenu="showMenu" :menuStyle="menuStyle" @menu-selection="handleMenuSelection" @close="showMenu = false"/>
        <TutorialBlock 
          v-for="(blk, index) in filteredBlocks" 
          :key="index" 
          :block="blk" 
          :is-newest-block="isNewestBlock"
          @update-block-id="towardsNextBlock" 
          @update-block="updateBlock"
          ref="tutorialBlocks"
        />
      </div>
    </div>
  </template>
  
  <script>
  import {default as TutorialBlock} from './TutorialBlock.vue';
  import {debounce} from 'lodash';
  import contentService from '@/services/contentService';
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
        }
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
          //disable the send button
          this.messageOntheWay = true;
          const hasQuote = this.quote?1: 0;
          //alert('quote content'+this.quote+'has quote'+hasQuote+'quote block id'+this.quoteBlockId);
          //console.log('tutorialId', this.tutorialId, 'stepId', this.stepId, 'subStepId', this.subStepId, 'blockId', this.blockId, 'newMessage', this.newMessage, 'selectedFunction', this.selectedFunction, 'hasQuote', hasQuote, 'quote', this.quote, 'quoteBlockId', this.quoteBlockId);
          const selectedFunction = this.selectedFunction ? this.selectedFunction.label : null;
          const response = await contentService.postUserQuery(
            this.tutorialId, this.stepId, this.subStepId, this.blockId, 
            this.newMessage, selectedFunction, hasQuote, this.quote, this.quoteBlockId);
          this.newMessage = '';
          this.quote = '';
          this.selectedFunction = null;
          this.$nextTick(() => {
            const tutorialContainer = this.$el.querySelector('.tutorial-container');
            tutorialContainer.scrollTop = tutorialContainer.scrollHeight;
          });
          if (response.status === "success") {
            const confirmedBlock = response.confirmed_block;
            this.tutorialBlocks.push(confirmedBlock);
            const nextBlockId = response.next_block_id;
            this.updateBlockId(nextBlockId);
            this.messageOntheWay = false;
            this.getNextBlock();
          }else {
            if (response.status === "fail") {
              alert(response.info);
            } else {
              alert('Failed to submit user query');
            }
            this.messageOntheWay = false;
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
        for (let i = 0; i < this.tutorialBlocks.length; i++) {
          if (this.tutorialBlocks[i].block_index.block_id == block.block_index.block_id) {
            this.tutorialBlocks[i] = block;
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
    },
  };
  </script>
  
<style scoped>
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

</style>
  