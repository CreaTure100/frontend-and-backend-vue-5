import { createRouter, createWebHistory } from 'vue-router';
import Generator from '../views/Generator.vue';
import Advanced from '../views/Advanced.vue';

const routes = [
    {
        path: '/',
        name: 'Generator',
        component: Generator,
        meta: { title: 'Генератор цветовых палитр' },
    },
    {
        path: '/advanced',
        name: 'Advanced',
        component: Advanced,
        meta: { title: 'Продвинутые инструменты' },
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || 'Генератор цветовых палитр';
    next();
});

export default router;
