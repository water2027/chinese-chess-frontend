<script setup lang="ts">
import { useWebSocket } from './websocket'
import { showMsg } from './components/MessageBox'
import { ApiBus } from './utils/eventEmitter'
import { provide } from 'vue'
ApiBus.on('API:FAIL', (req) => {
  const { message } = req()
  showMsg(message)
})

const ws = useWebSocket()
provide('ws', ws)
</script>

<template>
  <RouterView />
</template>
