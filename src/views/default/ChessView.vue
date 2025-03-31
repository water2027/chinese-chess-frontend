<script lang="ts" setup>
import { inject, onMounted, useTemplateRef } from 'vue'

import type { WebSocketService, EventHandler } from '@/websocket'
import ChessBoard from '@/composables/ChessBoard'
import { ChessPiece } from '@/composables/ChessPiece'
import { ApiBus } from '@/utils/eventEmitter'
import { useUserStore } from '@/store/useStore'

const { token } = useUserStore()

const background = useTemplateRef('background')
const chesses = useTemplateRef('chesses')

const ws = inject<WebSocketService>('ws')

const eventHandler: EventHandler = (message) => {
  const data = JSON.parse(message.data)
  if (data.type === 'CHESS:MOVE:END') {
    const { from, to } = data.payload
    ChessPiece.chessEventBus.emit('CHESS:MOVE:END', from, to)
  }
}

onMounted(() => {
  const gridSize = 60
  const canvasBackground = background.value as HTMLCanvasElement
  const canvasChesses = chesses.value as HTMLCanvasElement
  const ctxBackground = canvasBackground.getContext('2d')
  const ctxChesses = canvasChesses.getContext('2d')

  if (!ctxBackground || !ctxChesses) {
    throw new Error('Failed to get canvas context')
  }

  const chessBoard = new ChessBoard(canvasBackground, canvasChesses, 'red', gridSize)
  ChessPiece.chessEventBus.on('CHESS:MOVE:END', (req, resp) => {})
  ws?.connect(`ws://localhost:8080/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NDQwMzUzNjUsImlhdCI6MTc0MzQzMDU2NSwidXNlcklkIjoxfQ.zPihmY66MwM-VOdR1uaUPa3CDx3loOTyM6dtooqLiOM`, console.log)
  ws?.sendMessage({type: 0})
})
</script>

<template>
  <div class="relative w-full h-full">
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="background" />
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="chesses" />
  </div>
</template>
