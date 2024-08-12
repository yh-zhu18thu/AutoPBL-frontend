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
          alert('Login successful!');
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
  /* Add your styles here */
  </style>
  