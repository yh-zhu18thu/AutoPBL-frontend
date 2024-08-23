<template>
  <div class="chat-panel">
    <LoadingSpinner :show="isLoading" />
    <div class="title-part">
      <button class="left-button" @click="createNewChat">新聊天</button>
      <div class="title">{{ truncateTitle }}</div>
      <div class="history-dropdown">
        <button class="right-button" @click="checkHistory">历史记录</button>
        <div v-if="historyDropdown" class="dropdown-list">
          <ul >
            <li v-for="item in historyChats" :key="item.chat_id" @click="handleChatHistoryClick(item.chat_id)">
              {{ item.title }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div v-if="props.quoteContent && status === 'init'" class="quote-part card">
      <div class="quote-content">{{ truncatePropQuote }}</div>
      <button class="close-button" @click="deleteQuote">✕</button>
    </div>
    <div v-else-if="loadedQuoteContent && status === 'normal'" class="quote-part card">
      <div class="quote-content" :title="loadedQuoteContent">{{ truncateQuote }}</div>
    </div>
    <div class="preset-function-part card">
      <template v-if="status === 'init'">
        <div class="preset-selector">
          <select v-model="selectedPreset" id="preset-select">
            <option value="自由提问">自由提问</option>
            <option value="解释">解释</option>
            <option value="Debug">Debug</option>
            <option value="可视化">可视化</option>
            <option value="出练习题">出练习题</option>
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
            <div v-if="message.role === 'user'" class="chat-message user-message card line-numbers language-markup" v-html="renderMarkdown(message.content)">
            </div>
            <div v-else class="chat-message response-message card" v-html="renderMarkdown(message.content)"></div>
          </div>
        </div>
      </template>
    </div>

    <div class="input-part">
      <input v-model="userInput" type="text" placeholder="请输入你的问题..." />
      <button @click="sendMessage">发送</button>
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


import { ref, nextTick, watch, computed } from 'vue';
import { defineComponent } from 'vue';
import chatService from "@/services/chatService";
import LoadingSpinner from "@/components/LoadingSpinner.vue";

defineComponent({
  components: {
    LoadingSpinner
  }
});

const isLoading = ref(false);

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
const status = ref('init'); // 'init' or 'normal'
const chatId = ref(null);
const selectedPreset = ref('自由提问');
const loadedQuoteContent  = ref('');
const chatMessages = ref([]);
const userInput = ref('');
const getMessageIntervalId = ref(null); 
const getTitleIntervalId = ref(null);
const historyChats = ref([]);
const historyDropdown = ref(false);

const createNewChat = () => {
  chatId.value = null;
  status.value = 'init';
  chatMessages.value = [];
};

const checkHistory = (chatId) => {
  chatService.getChatHistory(props.tutorialId).then((response) => {
    if (response.status === 'success') {
      //reverse it to show the latest chat first
      response.chats.reverse();
      historyChats.value = response.chats;
    }else if (response.status === 'fail') {
      alert(response.message);
    }else{
      alert('Something went wrong');
    }
  });
  historyDropdown.value = !historyDropdown.value;
};

const handleChatHistoryClick = (_chatId) => {
  chatService.getChatMessages(_chatId).then((response) => {
    if (response.status === 'success') {
      // get the first chatmessage and get the selected function which is before the first :
      const firstMessage = response.chat_messages[0].content;
      const firstMessageIndex = firstMessage.indexOf(':');
      const selectedFunction = firstMessage.substring(0, firstMessageIndex);
      selectedPreset.value = selectedFunction;
      chatMessages.value = response.chat_messages;
      chatMessages.value[0].content = chatMessages.value[0].content.substring(firstMessageIndex+1);
      status.value = 'normal';
      chatId.value = _chatId;
      if (response.quote) {
        loadedQuoteContent.value = response.quote;
      }
      title.value = response.title;
      scrollToBottom();
    }else if (response.status === 'fail') {
      alert(response.message);
    }else{
      alert('Something went wrong');
    }
  });
  historyDropdown.value = false;
};

const deleteQuote = () => {
  emit('update-quote', '', null);
};

const hasQuote = () => {
  if (props.quoteContent !== '' && props.quoteContent !== null) {
    return '1';
  }else {
    return '0';
  }
};

const truncateTitle = computed(() => {
  if (title.value.length > 15) {
    return title.value.substring(0, 15) + '...';
  }
  return title.value;
});

const truncateQuote = computed(() => {
  //alert('loadedQuoteContent'+loadedQuoteContent.value+'length'+loadedQuoteContent.value.length);
  if (loadedQuoteContent.value.length > 80) {
    return loadedQuoteContent.value.substring(0, 80) + '...';
  }
  return loadedQuoteContent.value;
});

const truncatePropQuote = computed(() => {
  if (props.quoteContent.length > 80) {
    return props.quoteContent.substring(0, 80) + '...';
  }
  return props.quoteContent;
});

const sendMessage = () => {
  if (userInput.value.trim()) {
    chatMessages.value.push({ role: 'user', content: userInput.value });
    scrollToBottom();
    isLoading.value = true;
    if (status.value === 'init') {
      status.value = 'normal';
      var chatStepId = props.maxStepId;
      var chatSubStepId = props.maxSubStepId;
      var chatBlockId = props.maxBlockId;
      if (props.quoteContent !== '') {
        chatStepId = props.quoteBlock.block_index.step_id;
        chatSubStepId = props.quoteBlock.block_index.sub_step_id;
        chatBlockId = props.quoteBlock.block_index.block_id;
      }
      var quoteContent = '';
      if (hasQuote()=='1') {
        quoteContent = props.quoteContent;
      }
      loadedQuoteContent.value = quoteContent;
      deleteQuote();
      chatService.initiateChat(props.tutorialId,chatStepId,chatSubStepId, chatBlockId,userInput.value,selectedPreset.value, hasQuote(), quoteContent, chatBlockId).then((response) => {
        if (response.status === "success") {
          chatId.value = response.chat_id;
          const nextMessageId = response.next_chat_message_id;
          //alert('next msg id'+nextMessageId);
          getNextMessage(nextMessageId);
        }else if (response.status === "fail") {
          alert(response.message);     
        }else{
          alert('Something went wrong');
        }
        
      });
    }else{
      chatService.sendMessage(chatId.value, userInput.value).then((response) => {
        if (response.status === "success") {
          const nextMessageId = response.next_chat_message_id;
          //alert('next msg id'+nextMessageId);
          getNextMessage(nextMessageId);
          scrollToBottom();
        }else if (response.status === "fail") {
          alert(response.message);
        }else{
          alert('Something went wrong');
        }
      });
    }
    userInput.value = '';
  }
};

const getNextMessage = (nextMessageId) => {
  getMessageIntervalId.value = setInterval(() => {
    chatService.getNextMessage(nextMessageId).then((response) => {
      if (response.status==='success'){
        //alert('response'+JSON.stringify(response));
        if (response.chat_message.status === 2) {
          chatMessages.value.push({ role: response.chat_message.role, content: response.chat_message.content });
          scrollToBottom();
          clearInterval(getMessageIntervalId.value);
          isLoading.value = false;
          if (title.value === '问问AI') {
            getChatTitle();
          }
        }else if (response.chat_message.status === 1) {
            //failed
          alert(response.message);
        }
      }else if (response.status === 'fail') {
        alert(response.message);
      }else{
        alert('Something went wrong');
      }     
    });
  }, 1000);
}

const getChatTitle = () => {
  getTitleIntervalId.value = setInterval(() => {
    chatService.getChat(chatId.value).then((response) => {
      if (response.status === 'success') {
        if (response.chat.title==="讨论") {
          return;
        }
        title.value = response.chat.title
        clearInterval(getTitleIntervalId.value);
      }else{
        if (response.status === 'fail') {
          alert(response.message);
        }else{
          alert('Something went wrong');
        }
      }
    });
  }, 1000);
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

watch(() => props.quoteContent, () => {
  if (props.quoteContent !== '' && props.quoteContent !== null) {
    createNewChat();
  }
});

const renderMarkdown = (content) => {
  //remove the \n before and after the $
  content = content.replace(/\n\$/g, '$');
  content = content.replace(/\$\n/g, '$');
  content = content.replace(/\$\$/g, ' $$ ');
  content = content.replace(/(?<!\$)\$(?!\$)/g, ' $$ ');
  content = content.replace(/[\x00\x08]/g, '');
  const html = marked.parse(content);
  //alert(html);
  setTimeout(() => {
    prism.highlightAll();
  }, 50);
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
  font-size: 14px;
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

.quote-content {
  font-style: italic;
  max-width: 90%;
  cursor: default;
}

.close-button {
  position: absolute;
  top: 5px;
  right: 5px;
  background:#007bff;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.preset-function-part {
  padding: 10px;
  margin: 10px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #b3e0fa;
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

.preset-display {
  text-align: center;
  font-weight: bold;
  margin-top: 5px;
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
  background-color: #ffffff;
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

.history-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-list {
  position: absolute;
  left: -120px;
  top: 115%;
  margin-top: 8px;
  width: 220px; /* Slightly wider for better usability */
  max-height: 320px; /* Slightly taller for more items */
  overflow-y: auto;
  background-color: #ffffff; /* White background for consistency */
  border: 1px solid #d1e3f8; /* Softer blue border */
  border-radius: 8px; /* More pronounced rounding for modern look */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* More subtle shadow for depth */
  z-index: 1010;
  transition: opacity 0.3s ease, transform 0.3s ease; /* Smooth transition */
  opacity: 100;
  transform: translateY(-10px);
}

.history-dropdown .dropdown-list-enter-active,
.history-dropdown .dropdown-list-leave-active {
  opacity: 1;
  transform: translateY(0);
}

.dropdown-list ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.dropdown-list li {
  padding: 10px 16px; /* More padding for easier clicking */
  cursor: pointer;
  border-radius: 6px; /* Rounded corners for items */
  transition: background-color 0.2s ease;
}

.dropdown-list li:hover {
  background-color: #e3f2fd; /* Light blue hover effect */
}

.right-button {
  background-color: #007bff; /* Blue */
  color: white;
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 20px; /* Fully rounded button */
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.3s ease;
}

.right-button:hover {
  background-color: #0056b3; /* Darker blue on hover */
  transform: translateY(-2px); /* Slight lift on hover */
}



</style>