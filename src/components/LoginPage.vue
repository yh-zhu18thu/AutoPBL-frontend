<template>
    <div class="login-page">
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Login</button>
        <button @click.prevent="goToRegister">Register</button>
      </form>
    </div>
  </template>
  
  <script>
  import accountService from '@/services/accountService';

  export default {
    name: 'LoginPage',
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      login: async function() {
        // Handle login logic here
        const response = await accountService.login(this.username, this.password);
        if (response.status === "success") {
          this.goToBoard();
        }else{
          if (response.status === "fail") {
            alert(response.info);
          }
          else{
            alert('Login failed!');
          } 
        }
      },
      goToRegister() {
        this.$router.push('/register');
      },
      goToBoard() {
        this.$router.push('/board');
      },
    },
  };
  </script>
  
  <style scoped>
  /* 设置背景颜色和字体 */
  body {
    font-family: Arial, sans-serif;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .login-page {
    background-color: #ffffff;
    padding: 30px; /* 内边距 */
    border-radius: 8px; /* 圆角 */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 350px;
    max-width: 90%;
    text-align: center;
    position: absolute; /* 绝对定位 */
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); /* 水平和垂直居中 */
  }

  /* 标题样式 */
  h2 {
    margin-bottom: 20px;
    font-size: 24px;
    color: #333;
  }

  /* 标签样式 */
  label {
    display: block;
    margin-bottom: 5px;
    color: #555;
    text-align: left;
  }
  
  /* 按钮样式 */
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 20px;
    margin-top: 10px;
    margin-left: 5px;
    margin-right: 5px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s;
  }
  
  button[type="submit"] {
    background-color: #1877f2;
    color: #fff;
    margin-bottom: 0.5rem;
  }

  button[type="submit"]:hover {
    background-color: #166fe5;
  }

  button:last-child {
    background-color: #787878;
    color: #fff;
  }

  button:last-child:hover {
    background-color: #656565;
  }
  
  /* 输入框样式 */
  input {
    width: calc(100% - 20px);
    padding: 10px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 5px;
    margin-right: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-sizing: border-box;
  }
  </style>
  
