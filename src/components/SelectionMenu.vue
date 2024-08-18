<template>
  <!-- 动态显示的选项列表 -->
  <div v-if="showMenu" :style="menuStyle" class="selection-menu">
      <button @click="copy">复制</button>
      <button @click="quote">引用</button>
      <button @click="addToCollection">收藏</button>
  </div>
</template>

<script>
export default {
  props:{
      showMenu: {
          type: Boolean,
          required: true
      },
      menuStyle: {
          type: Object,
          required: true
      },
  },
  methods: {
    copy() {
      this.$emit('menu-selection','copy');
      this.$emit('close');
    },
    quote() {
      // 这里可以实现引用的逻辑，比如插入到编辑框
      this.$emit('menu-selection','quote');
      this.$emit('close');
    },
    addToCollection() {
      // 这里可以实现收藏的逻辑，比如保存到收藏列表
      this.$emit('menu-selection','collection');
      this.$emit('close');
    },
  },
};
</script>

<style scoped>
.selection-menu {
  position: absolute;
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selection-menu button {
  background-color: transparent;
  border: none;
  padding: 8px 12px;
  text-align: left;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.selection-menu button:hover {
  background-color: #e0f7fa;
  color: #007BFF;
}

.selection-menu button:focus {
  outline: none;
  background-color: #b3e5fc;
  color: #007BFF;
}
</style>
