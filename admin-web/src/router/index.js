import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/',
      component: Layout,
      redirect: '/dashboard',
      children: [
        {
          path: '/dashboard',
          name: 'dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/exhibit',
          name: 'exhibit',
          component: () => import('@/views/Exhibit.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/user',
          name: 'user',
          component: () => import('@/views/User.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/route',
          name: 'route',
          component: () => import('@/views/Route.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: '/statistics',
          name: 'statistics',
          component: () => import('@/views/Statistics.vue'),
          meta: { requiresAuth: true }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router