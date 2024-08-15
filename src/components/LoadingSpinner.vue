<!-- LoadingSpinner.vue -->
<template>
    <div v-if="show" class="loading-overlay">
      <div class="spinner"></div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      show: {
        type: Boolean,
        default: false,
      },
    },
  };
  </script>
  
  <style scoped>
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 6px solid #ccc;
    border-top-color: #1d72b8;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  </style>
  