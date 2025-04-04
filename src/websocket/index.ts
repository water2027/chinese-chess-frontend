import { showMsg } from '@/components/MessageBox'
import { ref } from 'vue'
import type { ChessPosition } from '@/composables/ChessPiece'
import channel from '@/utils/channel'

export const MessageType = {
  Normal: 1,
  Match: 2,
  Move: 3,
  Start: 4,
  End: 5,
  Error: 10,
} as const

export interface WebSocketMessage {
  type: (typeof MessageType)[keyof typeof MessageType]
  message?: string
  from?: ChessPosition
  to?: ChessPosition
  role?: string
  timestamp?: number
  winner?: string
}

const translateChessPosition = (position: ChessPosition): ChessPosition => {
  const { x, y } = position
  return {
    x: 8 - x,
    y: 9 - y,
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
      if (from && to) {
        channel.emit('NET:CHESS:MOVE', { from, to })
      } else {
        console.error('Invalid move data:', data)
      }
      break
    case MessageType.Start:
      showMsg('Game started')
      const { role } = data as { role: 'red' | 'black' }
      channel.emit('MATCH:SUCCESS', null)
      channel.emit('NET:GAME:START', { color: role })
      break
    case MessageType.End:
      showMsg('Game ended')
      break
    case MessageType.Error:
      const { message: errorMessage } = data
      showMsg(errorMessage || 'Error occurred')
      break
    default:
      type
      break
  }
}
export interface WebSocketService {
  connect: (url: string) => void

  end: (winner: string) => void
  move: (from: ChessPosition, to: ChessPosition) => void
  match: () => void
}

export const useWebSocket = (): WebSocketService => {
  const socket = ref<WebSocket | null>(null)

  const connect = (url: string) => {
    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      console.log('WebSocket connection opened.')
      channel.on('NET:CHESS:MOVE:END', ({ from, to }) => {
        move(from, to)
      })
      channel.on('GAME:END', ({ winner }) => {
        end(winner)
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
      console.log(socket.value, socket.value?.readyState)
      showMsg('WebSocket is not open. Unable to send message.')
    }
  }

  const match = () => {
    sendMessage({
      type: MessageType.Match,
    })
  }

  const move = (from: ChessPosition, to: ChessPosition) => {
    sendMessage({
      type: MessageType.Move,
      from,
      to,
    })
  }

  const end = (winner: string) => {
    sendMessage({
      type: MessageType.End,
      winner,
    })
  }

  return { connect, end, match, move }
}
