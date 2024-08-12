<template>
    <div class="chat-interface">
      <div class="tutorial-title">
        {{tutorial_title}}
      </div>
      <div class="chat-container">
        <TutorialChatBlock v-for="(blk, index) in chatBlocks" :key="index" :block="blk" />
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
  
  export default {
    name: 'TutorialChatInterface',
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
    components: {
      TutorialChatBlock,
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
        tutorial_title: 'Python基础教程'
      };
    },
    methods: {
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

.tutorial-title {
  position:fixed;
  font-size: 24px;
  font-weight: bold;
  margin-left: 130px;
  padding: 10px;
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
  