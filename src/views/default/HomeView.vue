<script lang="ts" setup>
import { GameBus } from '@/utils/eventEmitter'
import type { WebSocketService } from '@/websocket'
import { inject } from 'vue'

const ws = inject('ws') as WebSocketService

const singlePlay = () => {
  GameBus.futureEmit('GAME:START', () => {
    return {
      color: 'red',
      isNet: false,
    }
  })
  GameBus.emit('MATCH:SUCCESS')
}

const onlinePlay = () => {
  ws?.match()
}

</script>
<template>
  <main class="h-full sm:w-3/5 mx-a p-1 bg-gray-4 w-9/10">
    <h2 class="w-fit block mx-a">普普通通的首页</h2>
    <article class="text-xl line-height-9">
      <p>
        象棋与国际象棋及围棋并列世界三大棋类之一。象棋主要流行于全球华人、越南人及琉球人社区，是首届世界智力运动会的正式比赛项目之一。
      </p>
      <p>
        本网站是一个简易的象棋对战平台，支持本地对战和在线对战。在线对战需要注册账号，或者以游客登录。
      </p>
      <p>更多功能待开发...也可能不会</p>
      <p>点击左边的按钮本地对战，点击右边的按钮进行随机匹配。</p>
    </article>
    <div class="flex flex-row mt-4">
      <button class="mx-a p-4 border-0 rounded-2xl bg-gray-2 transition-all duration-200" text="black xl" hover="bg-gray-9 text-gray-2" @click="singlePlay">本地对战</button>
      <button class="mx-a p-4 border-0 rounded-2xl bg-gray-2 transition-all duration-200" text="black xl" hover="bg-gray-9 text-gray-2" @click="onlinePlay">随机匹配</button>
    </div>
  </main>
</template>
