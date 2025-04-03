<script lang="ts" setup>
import type { Ref } from 'vue'
import { inject, onMounted, useTemplateRef, watch } from 'vue'

import ChessBoard from '@/composables/ChessBoard'
import { GameBus } from '@/utils/eventEmitter'

const background = useTemplateRef('background')
const chesses = useTemplateRef('chesses')

const isPC = inject('isPC') as Ref<boolean>

let chessBoard: ChessBoard

const decideSize = (isPCBool: boolean) => {
  return isPCBool ? 70 : 40
}

watch(isPC, (newIsPC) => {
  const gridSize = decideSize(newIsPC)
  chessBoard?.redraw(gridSize)
})

onMounted(() => {
  const gridSize = decideSize(isPC.value)
  const canvasBackground = background.value as HTMLCanvasElement
  const canvasChesses = chesses.value as HTMLCanvasElement
  const ctxBackground = canvasBackground.getContext('2d')
  const ctxChesses = canvasChesses.getContext('2d')

  if (!ctxBackground || !ctxChesses) {
    throw new Error('Failed to get canvas context')
  }

  chessBoard = new ChessBoard(canvasBackground, canvasChesses, 'red', gridSize)
  chessBoard.start('red', false)
  GameBus.on('GAME:START', (req) => {
    chessBoard.stop()
    const { color, isNet } = req()
    chessBoard.start(color, isNet)
  })
})
</script>

<template>
  <div class="relative w-full h-full">
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="background" />
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="chesses" />
  </div>
</template>
