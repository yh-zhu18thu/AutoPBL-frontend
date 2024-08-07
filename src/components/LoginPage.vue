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
  export default {
    name: 'LoginPage',
    data() {
      return {
        username: '',
        password: '',
      };
    },
    methods: {
      login() {
        // Handle login logic here
        // Example: this.$router.push('/board');
        this.$router.push('/board');
      },
      goToRegister() {
        this.$router.push('/register');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  