<script lang="ts" setup>
import { inject } from 'vue'

import { type WebSocketService, MessageType } from '@/websocket'

const ws = inject<WebSocketService>('ws')
const match = () => {
  ws?.sendMessage({
    type: MessageType.Match,
  })
}
</script>

<template>
  <div>
    <button @click="match">match</button>
  </div>
</template>
