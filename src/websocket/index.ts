import { ref } from 'vue'

interface WebSocketMessage {
  type: string
  data: any
}

type EventHandler = (message: WebSocketMessage) => void

export const useWebSocket = (url: string, eventHandler: EventHandler) => {
  const socket = ref<WebSocket | null>(null)

  const connect = () => {
    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      console.log('WebSocket connection opened.')
    }

    socket.value.onmessage = (event) => {
      eventHandler(JSON.parse(event.data))
    }

    socket.value.onclose = () => {
      console.log('WebSocket connection closed.')
    }

    socket.value.onerror = (error) => {
      console.error('WebSocket error:', error)
    }
  }

  const sendMessage = (message: WebSocketMessage) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(message))
    } else {
      console.error('WebSocket is not open. Unable to send message.')
    }
  }

  return { connect, sendMessage }
}
