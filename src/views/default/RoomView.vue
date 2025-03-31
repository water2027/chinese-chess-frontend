<script lang="ts" setup>
import { inject, onMounted } from 'vue'

import { useUserStore } from '@/store/useStore'
import { type WebSocketService, MessageType } from '@/websocket'

const { token } = useUserStore()

const ws = inject<WebSocketService>('ws')
const match = () => {
  ws?.sendMessage({
    type: MessageType.Match,
  })
}
onMounted(() => {
  ws?.connect(`ws://localhost:8080/ws?token=${token}`)
})
</script>

<template>
  <div>
    <RouterLink to="/chess">chess</RouterLink>
    <button @click="match">match</button>
  </div>
</template>
