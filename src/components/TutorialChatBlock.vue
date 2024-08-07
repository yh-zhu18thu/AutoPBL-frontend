<template>
  <div :class="['chat-block', blockClass]">
    <div class="chat-block-header">
      <img :src="portraitUrl" alt="Portrait" class="portrait" />
      <div class="message-info">
        <div class="block-id">{{ blockIdentifier }}</div>
        <div class="percentage">{{ block.percentage }}%</div>
      </div>
    </div>
    <div v-if="isTutorial" class="chat-block-content">
      <div v-html="renderedMarkdown" class="tutorial-content"></div>
      <div class="user-question">
        <p>{{ block.data.user_input_content.desc }}</p>
        <div v-if="block.data.user_input_content.type === 'multi_choices'">
          <button v-for="choice in block.data.user_input_content.choices" :key="choice.choice_id" class="choice-button">
            {{ choice.choice_content }}
          </button>
        </div>
        <div v-else-if="block.data.user_input_content.type === 'single_choice'">
          <button class="choice-button">
            {{ block.data.user_input_content.choice_content }}
          </button>
        </div>
        <div v-else-if="block.data.user_input_content.type === 'text_input'" class="text-input-section">
          <input type="text" v-model="userInput" placeholder="输入你的答案..." />
          <button class="choice-button" @click="handleGPT">GPT帮我答</button>
          <button class="choice-button" @click="handleSubmit">提交</button>
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
</template>

<script>
import { marked } from 'marked';

export default {
  props: {
    block: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      userInput: ''
    };
  },
  computed: {
    isTutorial() {
      return this.block.block_type === 'tutorial';
    },
    blockClass() {
      return this.isTutorial ? 'tutorial-block' : 'user-block';
    },
    portraitUrl() {
      return this.isTutorial ? 'src/assets/robot.png' : 'src/assets/student.png'; 
    },
    blockIdentifier() {
      const { step_id, sub_step_id, block_id } = this.block.block_index;
      return `${step_id}.${sub_step_id}.${block_id}`;
    },
    renderedMarkdown() {
      return marked(this.block.data.content);
    }
  },
  methods: {
    handleGPT() {
      // Handle GPT response
      console.log('GPT帮我答');
    },
    handleSubmit() {
      // Handle submit
      console.log('提交');
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
  align-items: center;
  margin-bottom: 10px;
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
</style>
