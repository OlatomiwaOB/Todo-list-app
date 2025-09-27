import { createApp } from 'vue';
import App from './App.vue';
import './App.css';

// If you want to use Vue Router, import and set up here
// import { createRouter, createWebHistory } from 'vue-router';
// import routes from './routes';
// const router = createRouter({ history: createWebHistory(), routes });

const app = createApp(App);

// If using router:
// app.use(router);

app.mount('#app');
