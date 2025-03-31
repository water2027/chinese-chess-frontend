<script setup lang="ts">
import { useWebSocket } from './websocket'
import { showMsg } from './components/MessageBox'
import { ApiBus } from './utils/eventEmitter'
import { onMounted, provide } from 'vue'
import { useUserStore } from './store/useStore'
import { login } from './api/user/login'
useUserStore()
ApiBus.on('API:FAIL', (req) => {
  const { message } = req()
  showMsg(message)
})

const ws = useWebSocket()
provide('ws', ws)

onMounted(async () => {
  const email = localStorage.getItem('email')
  const password = localStorage.getItem('password')
  if (email && password) {
    const resp = await login({ email, password })

    ApiBus.emit('API:LOGIN', () => resp)
  }
})
</script>

<template>
  <RouterView />
</template>
