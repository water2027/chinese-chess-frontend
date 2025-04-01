<script lang="ts" setup>
import { inject } from 'vue'

import { type WebSocketService, MessageType } from '@/websocket'

const ws = inject<WebSocketService>('ws')
</script>

<template>
  <div>
    <button @click="ws?.match">match</button>
  </div>
</template>
