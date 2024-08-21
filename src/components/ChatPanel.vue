<template>
  <div class="chat-panel">
    <div class="title-part">
      <button class="left-button" @click="createNewChat">New Chat</button>
      <div class="title">{{ title }}</div>
      <button class="right-button" @click="checkHistory">Check History</button>
    </div>

    <div v-if="quote && status === 'init'" class="quote-part card">
      <div class="quote-content">{{ quote }}</div>
      <button class="close-button" @click="deleteQuote">✕</button>
    </div>
    <div v-else-if="quote && status === 'normal'" class="quote-part card">
      <div class="quote-content">{{ quote }}</div>
    </div>

    <div class="preset-function-part card">
      <template v-if="status === 'init'">
        <div class="preset-selector">
          <select v-model="selectedPreset" id="preset-select">
            <option value="chat">自由提问</option>
            <option value="explain">解释</option>
            <option value="debug">Debug</option>
            <option value="visualize">可视化</option>
            <option value="practice">出练习题</option>
            <!-- Add more options as needed -->
          </select>
        </div>
      </template>
      <template v-else>
        <div class="preset-display">{{ selectedPreset }}</div>
      </template>
    </div>

    <div class="chat-interface">
      <template v-if="status === 'init'">
        <div class="instruction-text">您有什么需要帮助的？</div>
      </template>
      <template v-else>
        <div class="chat-blocks" ref="chatBlocks">
          <div v-for="(message, index) in chatMessages" :key="index" class="message">
            <div v-if="message.role === 'user'" class="chat-message user-message card line-numbers language-markup">
              {{ renderMarkdown(message.content) }}
            </div>
            <div v-else class="chat-message response-message card">{{ message.content }}</div>
          </div>
        </div>
      </template>
    </div>

    <div class="input-part">
      <input v-model="userInput" type="text" placeholder="Type your message..." />
      <button @click="sendMessage">Send</button>
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


import { ref, nextTick, watch } from 'vue';
import { defineProps, defineEmits } from 'vue';
import chatService from "@/services/chatService";

const emit = defineEmits(['update-quote']);

const props = defineProps({
  tutorialId: {
    type: Number,
    required: true
  },
  maxStepId: {
    type: Number,
    required: true
  },
  maxSubStepId: {
    type: Number,
    required: true
  },
  maxBlockId: {
    type: Number,
    required: true
  },
  quoteBlock: {
    type: Object,
    required: false
  },
  quoteContent: {
    type: String,
    required: false
  }
})

const title = ref("问问AI");
const status = ref('normal'); // 'init' or 'normal'
const selectedPreset = ref('chat');
const chatMessages = ref([
        {
            "chat_message_id": 1,
            "role": "assistant",
            "content": "Hello, how can I assist you today?"
        },
        {
            "chat_message_id": 2,
            "role": "user",
            "content": "I need some help with my account."
        },
        {
            "chat_message_id": 3,
            "role": "assistant",
            "content": "Sure, I can help with that. Can you please provide more details?"
        },
        {
            "chat_message_id": 4,
            "role": "user",
            "content": "I forgot my password and I can\u2019t log in."
        },
        {
            "chat_message_id": 5,
            "role": "assistant",
            "content": "No worries, I will guide you through the password reset process."
        },
        {
            "chat_message_id": 6,
            "role": "user",
            "content": "Thank you!"
        },
        {
            "chat_message_id": 7,
            "role": "assistant",
            "content": "You\u2019re welcome! Anything else you need help with?"
        },
        {
            "chat_message_id": 8,
            "role": "user",
            "content": "No, that\u2019s all. Thanks!"
        },
        {
            "chat_message_id": 1,
            "role": "assistant",
            "content": "Hello, how can I assist you today?"
        },
        {
            "chat_message_id": 2,
            "role": "user",
            "content": "I need some help with my account."
        },
        {
            "chat_message_id": 3,
            "role": "assistant",
            "content": "Sure, I can help with that. Can you please provide more details?"
        },
        {
            "chat_message_id": 4,
            "role": "user",
            "content": "I forgot my password and I can\u2019t log in."
        },
        {
            "chat_message_id": 5,
            "role": "assistant",
            "content": "No worries, I will guide you through the password reset process."
        },
        {
            "chat_message_id": 6,
            "role": "user",
            "content": "Thank you!"
        },
        {
            "chat_message_id": 7,
            "role": "assistant",
            "content": "You\u2019re welcome! Anything else you need help with?"
        },
        {
            "chat_message_id": 8,
            "role": "user",
            "content": "No, that\u2019s all. Thanks!"
        },
        {
            "chat_message_id": 1,
            "role": "assistant",
            "content": "Hello, how can I assist you today?"
        },
        {
            "chat_message_id": 2,
            "role": "user",
            "content": "I need some help with my account."
        },
        {
            "chat_message_id": 3,
            "role": "assistant",
            "content": "Sure, I can help with that. Can you please provide more details?"
        },
        {
            "chat_message_id": 4,
            "role": "user",
            "content": "I forgot my password and I can\u2019t log in."
        },
        {
            "chat_message_id": 5,
            "role": "assistant",
            "content": "No worries, I will guide you through the password reset process."
        },
        {
            "chat_message_id": 6,
            "role": "user",
            "content": "Thank you!"
        },
        {
            "chat_message_id": 7,
            "role": "assistant",
            "content": "You\u2019re welcome! Anything else you need help with?"
        },
        {
            "chat_message_id": 8,
            "role": "user",
            "content": "No, that\u2019s all. Thanks!"
        },
    ]);
const userInput = ref('');

const createNewChat = () => {
  // Logic for creating a new chat
};

const checkHistory = () => {
  // Logic for checking chat history
};

const deleteQuote = () => {
  emit('update-quote', '', null);
};

const hasQuote = () => {
  return quoteContent !== '';
};

const sendMessage = () => {
  if (userInput.value.trim()) {
    chatMessages.value.push({ type: 'user', content: userInput.value });
    userInput.value = '';
    scrollToBottom();
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const chatBlocks = document.querySelector('.chat-blocks');
    if (chatBlocks) {
      chatBlocks.scrollTop = chatBlocks.scrollHeight;
    }
  });
};

watch(chatMessages, () => {
  scrollToBottom();
});

const renderMarkdown = (content) => {
  const html = marked.parse(content);
  setTimeout(() => {
    prism.highlightAll();
  }, 20);
  return html;
};
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  border: 1px solid #ccc;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
}

.title-part {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.left-button, .right-button, .close-button, button {
  cursor: pointer;
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 20px;
}

.left-button:hover, .right-button:hover, .close-button:hover, button:hover {
  background-color: #0056b3;
}

.title {
  flex-grow: 1;
  text-align: center;
  font-weight: bold;
}

.quote-part {
  position: relative;
  padding: 15px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #f9f9f9;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.preset-function-part {
  padding: 10px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #f9f9f9;
}

.preset-selector {
  margin-top: 5px;
}

.preset-selector select {
  width: 100%;
  padding: 8px;
  border-radius: 12px;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

.chat-interface {
  flex-grow: 1;
  padding: 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.instruction-text {
  text-align: center;
  color: #888;
}

.chat-blocks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message {
  display: flex;
  flex-direction: column;
}

.chat-message {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
}

.user-message {
  align-self: flex-end; /* Aligns the entire message block to the right */
  background-color: #e1f3fb;
  text-align: right; /* Keeps text left-aligned within the message */
}

.response-message {
  align-self: flex-start; /* Aligns the entire message block to the left */
  background-color: #f1f1f1;
  text-align: left; /* Keeps text left-aligned within the message */
}

.input-part {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
}

input[type="text"] {
  flex-grow: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 12px;
  box-sizing: border-box;
}

button {
  margin-left: 10px;
}


</style>