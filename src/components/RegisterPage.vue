<template>
    <div class="register-page">
      <h2>Register</h2>
      <form @submit.prevent="register">
        <div>
          <label for="username">Username:</label>
          <input type="text" id="username" v-model="username" required>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div>
          <label for="description">Description:</label>
          <textarea id="description" v-model="description" required></textarea>
        </div>
        <button type="submit">Register</button>
        <button @click.prevent="goToLogin">Login</button>
      </form>
    </div>
  </template>
  
  <script>
  import accountService from '@/services/accountService';

  export default {
    name: 'RegisterPage',
    data() {
      return {
        username: '',
        password: '',
        description: '',
      };
    },
    methods: {
      register: async function() {
       try {
        const response = await accountService.register(this.username, this.password, this.description);
        if (response.status === "success") {
          alert('Registration successful!');
          this.goToLogin();
        }else{
          if (response.status === "fail") {
            alert(response.info);
          }
          else{
            alert('Registration failed!');
          } 
        }
       } catch (error) {
        console.error('Failed to register:', error);
       }
      },
      goToLogin() {
        this.$router.push('/login');
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  