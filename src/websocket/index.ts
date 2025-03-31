import { ref } from 'vue'

export interface WebSocketMessage {
  type: number
  data?: any
}

export type EventHandler = (message: WebSocketMessage) => void

export interface WebSocketService {
  connect: (url: string, eventHandler: EventHandler) => void;
  sendMessage: (message: WebSocketMessage) => void;
}

export const useWebSocket = () => {
  const socket = ref<WebSocket | null>(null)

  const connect = (url: string, eventHandler: EventHandler) => {
    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      console.log('WebSocket connection opened.')
      socket.value?.send(JSON.stringify({ type: 0 }))
    }

    socket.value.onmessage = (event) => {
      eventHandler(JSON.parse(event.data))
    }

    socket.value.onclose = () => {
      console.log('WebSocket connection closed.')
    }

    socket.value.onerror = (error) => {
      console.log('WebSocket error:', error)
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
