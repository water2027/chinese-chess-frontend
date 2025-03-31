<script setup lang="ts">
import { showMsg } from './components/MessageBox'
import { ApiBus } from './utils/eventEmitter'
ApiBus.on('API:FAIL', (req) => {
  const { message } = req()
  showMsg(message)
})
</script>

<template>
  <RouterView />
</template>
