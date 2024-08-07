import Vue from 'vue';
import Router from 'vue-router';
import {default as LoginPage} from './components/LoginPage.vue';
import {default as RegisterPage} from './components/RegisterPage.vue';
import {default as BoardPage} from './components/BoardPage.vue';
import {default as TutorialPage} from './components/TutorialPage.vue';

Vue.use(Router);

export default new Router({
  name: 'router',
  mode: 'history',
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/board', component: BoardPage },
    { path: '/tutorial/:tutorial_id', component: TutorialPage },
  ],
});
