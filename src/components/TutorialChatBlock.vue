<template>
  <div :class="['chat-block', blockClass]">
    <div :class="['chat-block-header', isTutorial ? 'tutorial' : 'user']">
      <img :src="portraitUrl" alt="Portrait" class="portrait" />
      <div v-if="isTutorial" class="chat-block-content">
        <div v-html="renderedMarkdown" class="tutorial-content line-numbers language-markup" ></div>
        <div class="user-question">
          <div class="question-content" v-html="renderedQuestionMarkdown"></div>
          <div v-if="block.data.user_input_content.type === 'multi_choice'">
            <button 
              v-for="choice,index in block.data.user_input_content.choices" 
              :key="choice" 
              class="choice-button" 
              @click="handleUserMultiChoice(index)"
              :class="{ 'selected-choice': selectedChoice === choice.choice_index , 'disabled-button': userAnswered}"
              :disabled="userAnswered"
            >
              {{ choice.choice_content }}
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
        <div v-if="block.data.query_input.preset_function!='null'" class="function-tag">
          {{ block.data.query_input.preset_function }}
        </div>
        <p>{{ block.data.query_input.input_content }}</p>
      </div>
    </div>
  </div>
</template>


<script setup>
import { marked } from "marked";
import prism from "prismjs";

// Add numbering to the Code blocks
import "prismjs/plugins/line-numbers/prism-line-numbers.js";
import "prismjs/plugins/line-numbers/prism-line-numbers.css";

import "prismjs/plugins/toolbar/prism-toolbar.js"; // required for the following plugins
import "prismjs/plugins/toolbar/prism-toolbar.css"; // required for the following plugins
import "prismjs/plugins/copy-to-clipboard/prism-copy-to-clipboard.js"; // show copy button
import "prismjs/plugins/show-language/prism-show-language.js"; // display the language of the code block

// Load the languages you need
import "prismjs/components/prism-python";
import "prismjs/components/prism-bash";

marked.use({
  highlight: (code, lang) => {
    if (prism.languages[lang]) {
      return prism.highlight(code, prism.languages[lang], lang);
    } else {
      return code;
    }
  },
});

prism.highlightAll();
</script>


<script>
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
        if(this.isTutorial){
          const userInputContent = this.block.data.user_input_content.user_input;
          const userInputType = this.block.data.user_input_content.type;
          if (userInputType === "text_input") {
            if (userInputContent !== 'PLACEHOLDER') {
              this.userInput = userInputContent; // Initialize with past input
            }else {
              this.userInput = '';
            }
          }else if (userInputType === "multi_choice") {
            this.selectedChoice = Number(userInputContent);
          }
        }
      },
      deep: true
    }
  },
  mounted() {
    if (this.isTutorial){
      const userInputContent = this.block.data.user_input_content.user_input;
      const userInputType = this.block.data.user_input_content.type;
      if (userInputType === "text_input") {
        if (userInputContent !== 'PLACEHOLDER') {
          this.userInput = userInputContent; // Initialize with past input
        } else {
          this.userInput = '';
        }
      }else if (userInputType === "multi_choice") {
        this.selectedChoice = Number(userInputContent);
      }
    }
    prism.highlightAll();
  },
  updated() {
    prism.highlightAll();
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
      prism.highlightAll();
      //alert('renderedMarkdown: ' + this.block.data.content);
      return marked.parse(this.block.data.content);
    },
    renderedQuestionMarkdown() {
      return marked.parse(this.block.data.user_input_content.desc);
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
      //alert('submitUserAnswer: ' + this.block.block_index.block_id + ', type: ' + type + ', answer: ' + answer);
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

<style>
@import "prismjs/themes/prism-tomorrow.min.css"; 
</style>

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

.tutorial-content {
  margin-bottom: 10px;
  max-width: 90%;
}

.question-content{
  margin-bottom: 10px;
  max-width: 90%;
}
.user-question {
  margin-top: 20px;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  color: #333;
  max-width: 85%;
}

.choice-button {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 25px;
  padding: 10px 20px;
  margin-right: 10px;
  margin-top: 10px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
}

.choice-button:hover {
  background: #0056b3;
  transform: translateY(-2px);
}

.choice-button:active {
  transform: translateY(0);
}

.text-input-section {
  display: flex;
  align-items: center;
  margin-top: 10px;
  max-width: 90%;
}

.text-input-section input {
  flex-grow: 1;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-right: 10px;
  font-size: 16px;
}

.quote-content {
  background: #e0e0e0; /* 灰色背景 */
  border-left: 3px solid #a0a0a0; /* 灰色边框 */
  padding: 5px 10px;
  border-radius: 5px;
  display: inline-block;
  margin-right: 10px; /* 与功能选项之间的间距 */
  margin-bottom: 0; /* 去除底部的间距 */
  vertical-align: middle; /* 垂直对齐 */
}

.function-tag {
  background: #a0a0a0; /* 灰色背景 */
  color: #fff; /* 白色字体 */
  padding: 5px 10px;
  border-radius: 5px;
  display: inline-block;
  font-size: 14px;
  vertical-align: middle; /* 垂直对齐 */
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
  border-width: 2px;
  border-style: solid;
}


</style>
