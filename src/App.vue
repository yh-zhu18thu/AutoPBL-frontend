<template>
  <div id="app">
    <TutorialMenu class="menu-container"/>
    <div class="chat-container">
      <TutorialChatInterface class="chat-container"/>
    </div>
  </div>
</template>

<script>
import TutorialMenu from './components/TutorialMenu.vue';
import TutorialChatInterface from './components/TutorialChatInterface.vue';
import '@fortawesome/fontawesome-free/css/all.css';

export default {
  components: {
    TutorialMenu,
    TutorialChatInterface
  },
};
</script>

<style scoped>
#app {
  display: flex;
  height: 100%;
}

.menu-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 220px;
  height: 100%;
  background-color: #f8f9fa;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.content-container {
  flex: 1; /* Remaining space for chat interface */
  display: flex;
  flex-direction: column;
  height: 100%;
}
</style>

