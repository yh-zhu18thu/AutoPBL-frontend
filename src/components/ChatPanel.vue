<template>
    <div class="chat-panel">
      <p>Chat content goes here...</p>
    </div>
  </template>
  
  <script>
  export default {
    methods: {
      closeChat() {
        this.$emit('toggle-chat');
      }
    }
  }
  </script>
  
  <style scoped>
  .chat-panel {
    height: 100%;
    background-color: #ffffff;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  }
  </style>
  