<template>
  <div :class="['chat-block', blockClass]">
    <div :class="['chat-block-header', isTutorial ? 'tutorial' : 'user']">
      <img :src="portraitUrl" alt="Portrait" class="portrait" />
      <div v-if="isTutorial" class="chat-block-content">
        <div v-html="renderedMarkdown" class="tutorial-content"></div>
        <div class="user-question">
          <p>{{ block.data.user_input_content.desc }}</p>
          <div v-if="block.data.user_input_content.type === 'multi_choice'">
            <button 
              v-for="choice,index in block.data.user_input_content.choices" 
              :key="choice" 
              class="choice-button" 
              @click="handleUserMultiChoice(index)"
              :class="{ 'selected-choice': selectedChoice === index , 'disabled-button': userAnswered}"
              :disabled="userAnswered"
            >
              {{ choice }}
            </button>
          </div>
          <div v-else-if="block.data.user_input_content.type === 'single_choice'">
            <button 
              class="choice-button" 
              @click="handleUserSingleChoice"
              :disabled="userAnswered"
              :class="{ 'disabled-button': userAnswered}"
            >
              {{ block.data.user_input_content.choice }}
            </button>
          </div>
          <div v-else-if="block.data.user_input_content.type === 'text_input'" class="text-input-section">
            <input 
              type="text"
              v-model="userInput"
              placeholder="输入你的答案..." 
              :disabled="userAnswered"
              :class="{ 'disabled-input': userAnswered}"
            />
            <button 
              class="choice-button" 
              @click="handleGPT"
              :disabled="userAnswered"
              :class="{ 'disabled-button': userAnswered, 'selected-choice': selectedTextInputType === 'gpt'}"
            >
              GPT帮我答
            </button>
            <button 
              class="choice-button" 
              @click="handleUserTextInput"
              :disabled="userAnswered"
              :class="{ 'disabled-button': userAnswered, 'selected-choice': selectedTextInputType === 'submit'}"
            >
              提交
            </button>
          </div>
        </div>
      </div>
      <div v-else class="chat-block-content">
        <div v-if="block.data.query_quote.has_quote" class="quote-content">
          <p>{{ block.data.query_quote.quote_content.content }}</p>
        </div>
        <p>{{ block.data.query_input.input_content }}</p>
        <div v-if="block.data.query_input.preset_function" class="function-tag">
          {{ block.data.query_input.preset_function }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {marked} from 'marked';
import robotLogo from '@/assets/robot.png';
import studentLogo from '@/assets/student.png';
import contentService from '@/services/contentService';

export default {
  name: 'TutorialChatBlock',
  props: {
    block: {
      type: Object,
      required: true
    },
    isNewestBlock: {
      type: Function,
      default: true
    }
  },
  data() {
    return {
      userInput: '',
      selectedChoice: -1,
      selectedTextInputType: '',
    };
  },
  watch: {
    block: {
      handler: function(newBlock) {
        const userInputContent = this.block.data.user_input_content.user_input;
        const userInputType = this.block.data.user_input_content.type;
        if (userInputType === "text_input") {
          if (userInputContent !== 'PLACEHOLDER') {
            this.userInput = userInputContent; // Initialize with past input
          }else {
            this.userInput = '';
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    const userInputContent = this.block.data.user_input_content.user_input;
    const userInputType = this.block.data.user_input_content.type;
    if (userInputType === "text_input") {
      if (userInputContent !== 'PLACEHOLDER') {
        this.userInput = userInputContent; // Initialize with past input
      } else {
        this.userInput = '';
      }
    }
  },
  computed: {
    userAnswered() {
      const isNewest = this.isNewestBlock(this.block.block_index.block_id);
      if (!isNewest) {
        return true;
      }
      const userInputContent = this.block.data.user_input_content.user_input;
      const userInputType = this.block.data.user_input_content.type;
      if (userInputType=="text_input") {
        return userInputContent != 'PLACEHOLDER';
      } else if (userInputType=="single_choice") {
        return userInputContent != false;
      } else if (userInputType=="multi_choice") {
        return userInputContent != -1;
      }
    },
    isTutorial() {
      return this.block.block_type != 'user_query';
    },
    blockClass() {
      return this.isTutorial ? 'tutorial-block' : 'user-block';
    },
    portraitUrl() {
      return this.isTutorial ?  robotLogo : studentLogo;
    },
    blockIdentifier() {
      const { step_id, sub_step_id, block_id } = this.block.block_index;
      return `${step_id}.${sub_step_id}.${block_id}`;
    },
    renderedMarkdown() {
      return marked(this.block.data.content);
    }
  },
  created() {
    console.log('block',this.block);
  },
  methods: {
    handleGPT() {
      // Handle GPT response
      this.selectedTextInputType = 'gpt';
      console.log('GPT帮我答');
    },
    handleUserTextInput() {
      // Handle submit
      this.selectedTextInputType = 'submit';
      this.submitUserAnswer('text_input', this.userInput);
    },
    handleUserSingleChoice() {
      // Handle user single choice
      this.submitUserAnswer('single_choice', '');
      
    },
    handleUserMultiChoice(choiceIndex) {
      // Handle user multi choice
      this.selectedChoice = choiceIndex;
      this.submitUserAnswer('multi_choice', choiceIndex);
    },
    submitUserAnswer: async function(type, answer){
      alert('submitUserAnswer: ' + this.block.block_index.block_id + ', type: ' + type + ', answer: ' + answer);
      const response = await contentService.postUserAnswer(type, answer, this.block.block_index.tutorial_id, this.block.block_index.block_id);
      if (response.status === "success") {
        this.updateBlock(response.confirmed_block);
        this.updateBlockId(response.next_block_id);
      } else {
        if (response.status === "fail") {
          alert(response.info);
        } else {
          alert('Failed to submit user answer');
        }
      }
    },
    updateBlock(block){
      //alert('updateBlock: ' + JSON.stringify(block));
      this.$emit('update-block', block);
    },
    updateBlockId(newBlockId){
      //alert('updateBlockId: ' + newBlockId);
      this.$emit('update-block-id', newBlockId);
    }
  }
};
</script>

<style scoped>
.chat-block {
  display: flex;
  flex-direction: column;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 60%; /* Adjust this to control the width */
}

.chat-block.tutorial-block {
  align-self: flex-start; /* Align tutorial blocks to the left */
}

.chat-block.user-block {
  align-self: flex-end; /* Align user blocks to the right */
}

.chat-block.p {
  margin: 0;
  word-wrap: break-word;
}

.chat-block-header {
  display: flex;
  align-items: flex-start;
}

.chat-block-header.tutorial {
  flex-direction: row;
}

.chat-block-header.user {
  flex-direction: row-reverse;
}

.portrait {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.message-info {
  display: flex;
  flex-direction: column;
}

.block-id {
  font-weight: bold;
}

.percentage {
  color: #888;
}

.tutorial-content {
  margin-bottom: 10px;
}

.user-question {
  margin-top: 10px;
}

.choice-button {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
}

.choice-button:hover {
  background: #0056b3;
}

.text-input-section {
  display: flex;
  align-items: center;
}

.text-input-section input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
  margin-right: 5px;
}

.quote-content {
  background: #f1f1f1;
  border-left: 3px solid #007bff;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}

.function-tag {
  background: #007bff;
  color: #fff;
  padding: 3px 8px;
  border-radius: 5px;
  display: inline-block;
}

.disabled-button {
  background-color: grey;
  color: white;
  cursor: not-allowed;
}

.disabled-input {
  background-color: lightgrey;
  color: darkgrey;
  cursor: not-allowed;
}

.selected-choice {
  border-color: blue; /* Change to your desired edge color */
}

</style>
