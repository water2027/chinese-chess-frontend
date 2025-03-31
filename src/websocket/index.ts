import { showMsg } from '@/components/MessageBox'
import { ref } from 'vue'
import { ChessPiece } from '@/composables/ChessPiece'
import { useRouter } from 'vue-router'

export const MessageType = {
  Normal: 1,
  Match: 2,
  Move: 3,
  Start: 4,
  End: 5,
  Error: 10,
} as const

export interface WebSocketMessage {
  type: typeof MessageType[keyof typeof MessageType]
  message?: string
  from?: { x: number; y: number }
  to?: { x: number; y: number }
}

const translateChessPosition = (position: { x: number; y: number }) => {
  const { x, y } = position
  return {
    x: 8-x,
    y: 9-y,
  }
}

export type EventHandler = (data: WebSocketMessage) => void
const eventHandler: EventHandler = (data) => {
  const { type } = data
  switch (type) {
    case MessageType.Normal:
      const { message } = data
      showMsg(message || '')
      break
    case MessageType.Match:
      showMsg('Match started')
      break
    case MessageType.Move:
      let { from, to } = data
      from = translateChessPosition(from!)
      to = translateChessPosition(to!)
      console.log('Move from:', from, 'to:', to)
      if (from && to) {
        ChessPiece.chessEventBus.emit('CHESS:MOVE:START', () => ({ from, to }))
      } else {
        console.error('Invalid move data:', data)
      }
      break
    case MessageType.Start:
      showMsg('Game started')
      break
    case MessageType.End:
      showMsg('Game ended')
      break
    case MessageType.Error:
      const { message: errorMessage } = data
      showMsg(errorMessage || 'Error occurred')
      break
    default:
      console.error('Unknown message type:', type)
      break
  }
}
export interface WebSocketService {
  connect: (url: string) => void;
  sendMessage: (message: WebSocketMessage) => void;
}

export const useWebSocket = () => {
  const socket = ref<WebSocket | null>(null)

  const connect = (url: string) => {
    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      console.log('WebSocket connection opened.')
      ChessPiece.chessEventBus.on('CHESS:MOVE:END', (req) => {
        const { from, to } = req()
        sendMessage({
          type: MessageType.Move,
          from,
          to,
        })
      })
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
      showMsg('WebSocket is not open. Unable to send message.')
    }
  }

  return { connect, sendMessage }
}
