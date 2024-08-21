<template>
  <div :class="['tutorial-block', blockClass]">
    <div :class="['tutorial-block-header','tutorial']">
      <img :src="portraitUrl" alt="Portrait" class="portrait" />
      <div class="tutorial-block-content">
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
    </div>
  </div>
</template>

<script setup>
import { marked } from "marked";
import markedKatex from "marked-katex-extension";
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

 // This is needed if you have a conflict with other loaded CSS imports (i.e. Bulma).
import "prismjs/plugins/custom-class/prism-custom-class";
prism.plugins.customClass.map({ number: "prism-number", tag: "prism-tag" });

//alert('marked');

const options = {
  throwOnError: true,
  output: 'mathml',
  delimiters: [
    {left: "$$", right: "$$", display: true},
    {left: "\\(", right: "\\)", display: true},
    {left: "\\begin{equation}", right: "\\end{equation}", display: true},
    {left: "\\begin{align}", right: "\\end{align}", display: true},
    {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
    {left: "\\begin{gather}", right: "\\end{gather}", display: true},
    {left: "\\begin{CD}", right: "\\end{CD}", display: true},
    {left: "\\[", right: "\\]", display: true},
    {left: "$", right: "$", display: true},
    {left: "\\(", right: "\\)", display: true},
    {left: "\\[", right: "\\]", display: true}
  ]
};

marked.use(markedKatex(options));


import { ref, watch, computed, onMounted } from 'vue';
import robotLogo from '@/assets/robot.png';
import contentService from '@/services/contentService';

// Props
const props = defineProps({
  block: {
    type: Object,
    required: true
  },
  isNewestBlock: {
    type: Function,
    default: () => true
  }
});

// Data (using ref and reactive for reactivity)
const userInput = ref('');
const selectedChoice = ref(-1);
const selectedTextInputType = ref('');

// Computed properties
const isTutorial = computed(() => props.block.block_type != 'user_query');

const blockClass = computed(() => 'tutorial-block');

const portraitUrl = computed(() => robotLogo);

const blockIdentifier = computed(() => {
  const { step_id, sub_step_id, block_id } = props.block.block_index;
  return `${step_id}.${sub_step_id}.${block_id}`;
});

const userAnswered = computed(() => {
  const isNewest = props.isNewestBlock(props.block.block_index.block_id);
  if (!isNewest) return true;

  const userInputContent = props.block.data.user_input_content.user_input;
  const userInputType = props.block.data.user_input_content.type;

  if (userInputType === 'text_input') {
    return userInputContent !== 'PLACEHOLDER';
  } else if (userInputType === 'single_choice') {
    return userInputContent !== false;
  } else if (userInputType === 'multi_choice') {
    return userInputContent !== -1;
  }
  return false;
});

const renderedMarkdown = computed(() => {
  //alert('renderedMarkdown: ' + props.block.data.content);
  const html =  marked.parse(props.block.data.content);
  //const html = props.block.data.content;
  //postpone prism.highlightAll();
  setTimeout(() => {
    prism.highlightAll();
  }, 50);
  return html;
});


const renderedQuestionMarkdown = computed(() => {
  //alert('renderedQuestionMarkdown: ' + props.block.data.user_input_content.desc);
  const html =  marked.parse(props.block.data.user_input_content.desc);
  //const html = props.block.data.user_input_content.desc;
  setTimeout(() => {
    prism.highlightAll();
  }, 50);
  return html;
});

// Watcher
watch(
  () => props.block,
  (newBlock) => {
    if (isTutorial.value) {
      const userInputContent = newBlock.data.user_input_content.user_input;
      const userInputType = newBlock.data.user_input_content.type;

      if (userInputType === 'text_input') {
        userInput.value = userInputContent !== 'PLACEHOLDER' ? userInputContent : '';
      } else if (userInputType === 'multi_choice') {
        selectedChoice.value = Number(userInputContent);
      }
    }
  },
  { deep: true }
);

// Lifecycle hooks
onMounted(() => {
  if (isTutorial.value) {
    const userInputContent = props.block.data.user_input_content.user_input;
    const userInputType = props.block.data.user_input_content.type;
    if (userInputType === 'text_input') {
      userInput.value = userInputContent !== 'PLACEHOLDER' ? userInputContent : '';
    } else if (userInputType === 'multi_choice') {
      selectedChoice.value = Number(userInputContent);
    }
  }
});

// Methods
const handleGPT = () => {
  selectedTextInputType.value = 'gpt';
  console.log('GPT帮我答');
};

const handleUserTextInput = () => {
  selectedTextInputType.value = 'submit';
  submitUserAnswer('text_input', userInput.value);
};

const handleUserSingleChoice = () => {
  submitUserAnswer('single_choice', '');
};

const handleUserMultiChoice = (choiceIndex) => {
  selectedChoice.value = choiceIndex;
  submitUserAnswer('multi_choice', choiceIndex);
};

const submitUserAnswer = async (type, answer) => {
  const response = await contentService.postUserAnswer(
    type,
    answer,
    props.block.block_index.tutorial_id,
    props.block.block_index.block_id
  );
  if (response.status === 'success') {
    updateBlock(response.confirmed_block);
    updateBlockId(response.next_block_id);
  } else {
    alert(response.info || 'Failed to submit user answer');
  }
};

const emit = defineEmits(['update-block','update-block-id']);

const updateBlock = (block) => {
  //alert('updateBlock: ' + JSON.stringify(block));
  emit('update-block', block);
};

const updateBlockId = (newBlockId) => {
  //alert('updateBlockId: ' + newBlockId);
  emit('update-block-id', newBlockId);
};

</script>


<style>
@import "prismjs/themes/prism-tomorrow.min.css"; 

</style>

<style scoped>

.tutorial-block {
  display: flex;
  flex-direction: column;
  margin: 10px;
  padding: 10px;
  border-radius: 10px;
  background-color: #f9f9f9;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 95%; /* Adjust this to control the width */
}

.tutorial-block.tutorial-block {
  align-self: flex-start; /* Align tutorial blocks to the left */
}

.tutorial-block.user-block {
  align-self: flex-end; /* Align user blocks to the right */
}

.tutorial-block.p {
  margin: 0;
  word-wrap: break-word;
}

.tutorial-block-header {
  display: flex;
  align-items: flex-start;
}

.tutorial-block-content {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  max-width: 100%;
}

.tutorial-block-header.tutorial {
  flex-direction: row;
}

.tutorial-block-header.user {
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
  max-width: 85%;
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
