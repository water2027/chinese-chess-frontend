import { createRouter, createWebHistory } from 'vue-router'

import { ApiBus, GameBus } from '@/utils/eventEmitter'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layout/DefaultLayout.vue'),
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('../views/default/HomeView.vue'),
        },
        {
          path: 'about',
          name: 'about',
          component: () => import('../views/default/AboutView.vue'),
        },
        {
          path: 'chess',
          name: 'chess',
          component: () => import('../views/default/ChessView.vue'),
        },
        {
          path: 'room',
          name: 'room',
          component: () => import('../views/default/RoomView.vue'),
        },
      ],
    },
    {
      path: '/auth/',
      name: 'auth',
      component: () => import('../layout/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/auth/LoginView.vue'),
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('../views/auth/RegisterView.vue'),
        },
      ],
    },
  ],
})

const logout = () => {
  router.push('/auth/login')
}

ApiBus.on('API:UN_AUTH', () => {
  logout()
})

ApiBus.on('API:LOGOUT', () => {
  logout()
})

ApiBus.on('API:LOGIN', () => {
  router.push('/')
})

GameBus.on('MATCH:SUCCESS', () => {
  router.push('/chess')
})

export default router
