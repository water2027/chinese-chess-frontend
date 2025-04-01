<script lang="ts" setup>
import { GameBus } from '@/utils/eventEmitter'

const singlePlay = () => {
  GameBus.futureEmit('GAME:START', () => {
    return {
      color: 'red',
      isNet: false,
    }
  })
  GameBus.emit('MATCH:SUCCESS')
}
</script>
<template>
  <main>
    <button @click="singlePlay">single</button>
  </main>
</template>
