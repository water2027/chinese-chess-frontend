<script setup lang="ts">
import { useWebSocket } from './websocket'
import { showMsg } from './components/MessageBox'
import apiBus from './utils/apiBus'
import { onMounted, onUnmounted, provide, ref } from 'vue'
import { useUserStore } from './store/useStore'
import { login } from './api/user/login'
useUserStore()
apiBus.on('API:FAIL', (req) => {
  const { message } = req
  showMsg(message)
})

const ws = useWebSocket()
provide('ws', ws)

const WebsocketURL = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8080/ws'

apiBus.on('API:LOGIN', (req) => {
  const { token } = req
  ws.connect(`${WebsocketURL}?token=${token}`)
})

const isPC = ref(false)
provide('isPC', isPC)

const handleResize = () => {
  isPC.value = window.innerWidth > 640
}

onMounted(async () => {
  const email = localStorage.getItem('email')
  const password = localStorage.getItem('password')
  if (email && password) {
    const resp = await login({ email, password })
    apiBus.emit('API:LOGIN', { ...resp, stop: true })
  }
  handleResize()
  window.addEventListener('resize', handleResize)
})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <RouterView />
</template>
