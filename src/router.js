import {createWebHistory, createRouter} from 'vue-router';
import LoginPage from './components/LoginPage.vue';
import RegisterPage from './components/RegisterPage.vue';
import BoardPage from './components/BoardPage.vue';
import TutorialPage from './components/TutorialPage.vue';

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/board', component: BoardPage },
    { path: '/tutorial/:tutorial_id', component: TutorialPage }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;