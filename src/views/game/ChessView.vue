<script lang="ts" setup>
import type { Ref } from 'vue'
import { inject, onMounted, useTemplateRef } from 'vue'

import ChessBoard from '@/composables/ChessBoard'
import { GameBus } from '@/utils/eventEmitter'

const background = useTemplateRef('background')
const chesses = useTemplateRef('chesses')

const isPC = inject('isPC') as Ref<boolean>

onMounted(() => {
  console.log(isPC.value)
  const gridSize = isPC.value ? 70 : 40
  const canvasBackground = background.value as HTMLCanvasElement
  const canvasChesses = chesses.value as HTMLCanvasElement
  const ctxBackground = canvasBackground.getContext('2d')
  const ctxChesses = canvasChesses.getContext('2d')

  if (!ctxBackground || !ctxChesses) {
    throw new Error('Failed to get canvas context')
  }

  const chessBoard = new ChessBoard(canvasBackground, canvasChesses, 'red', gridSize)
  GameBus.on('GAME:START', (req) => {
    chessBoard.stop()
    const { color, isNet } = req()
    chessBoard.start(color, isNet)
  })
  chessBoard.start('red', false)
})
</script>

<template>
  <div class="relative w-full h-full">
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="background" />
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="chesses" />
  </div>
</template>
