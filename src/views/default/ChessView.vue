<script lang="ts" setup>
import { onMounted, useTemplateRef } from 'vue'

import ChessBoard from '@/composables/ChessBoard'

const background = useTemplateRef('background')
const chesses = useTemplateRef('chesses')


onMounted(() => {
    const gridSize = 50
    // const gridSize = 40
    const canvasBackground = background.value as HTMLCanvasElement
    const canvasChesses = chesses.value as HTMLCanvasElement
    canvasBackground.width = gridSize * 9
    canvasBackground.height = gridSize * 10
    canvasChesses.width = gridSize * 9
    canvasChesses.height = gridSize * 10
    const ctxBackground = canvasBackground.getContext('2d')
    const ctxChesses = canvasChesses.getContext('2d')

    if (!ctxBackground || !ctxChesses) {
        throw new Error('Failed to get canvas context')
    }

    const chessBoard = new ChessBoard(ctxBackground, ctxChesses, gridSize)
})
</script>

<template>
  <div class="relative w-full h-full">
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="background" />
    <canvas class="absolute left-1/2 top-1/4 -translate-x-1/2 -translate-y-1/4" ref="chesses" />
  </div>
</template>
