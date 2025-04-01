const ApiEvent = ['API:UN_AUTH', 'API:NOT_FOUND', 'API:LOGOUT', 'API:FAIL', 'API:LOGIN'] as const
const ChessEvent = ['MATCH:SUCCESS', 'GAME:START', 'GAME:END', 'CHESS:MOVE:START', 'CHESS:MOVE:END', 'CHESS:CHECK', 'CHESS:QUERY'] as const

type RequestCallback = (...args: any[]) => any
type ResponseCallback = (...args: any[]) => any
type Listener = (req: RequestCallback, resp: ResponseCallback) => void

class EventEmitter<T extends readonly string[]> {
  private eventNames: T
  listeners: Record<T[number], Set<Listener>> = {} as Record<T[number], Set<Listener>>
  futureEvents: Record<T[number], { req: RequestCallback; resp: ResponseCallback }[]> =
    {} as Record<T[number], { req: RequestCallback; resp: ResponseCallback }[]>
  constructor(EventNames: T) {
    this.eventNames = EventNames
    this.eventNames.forEach((eventName) => {
      this.listeners[eventName as T[number]] = new Set<Listener>()
    })
  }

  on(eventName: T[number], listener: Listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = new Set<Listener>()
    }
    this.listeners[eventName].add(listener)
    if (this.futureEvents[eventName]) {
      this.futureEvents[eventName].forEach(({ req, resp }) => {
        listener(req, resp)
      })
      delete this.futureEvents[eventName]
    }
  }

  off(eventName: T[number], listener: Listener) {
    if (!this.listeners[eventName]) return
    this.listeners[eventName].delete(listener)
  }

  emit(eventName: T[number], req: RequestCallback = () => {}, resp: ResponseCallback = () => {}) {
    this.listeners[eventName].forEach((listener) => listener(req, resp))
  }

  futureEmit(
    eventName: T[number],
    req: RequestCallback = () => {},
    resp: ResponseCallback = () => {},
  ) {
    if (!this.futureEvents[eventName]) {
      this.futureEvents[eventName] = []
    }
    this.futureEvents[eventName].push({ req, resp })
  }
}

const ApiBus = new EventEmitter(ApiEvent)
const GameBus = new EventEmitter(ChessEvent)
export { ApiBus, GameBus }
