const ApiEvent = ['API:UN_AUTH', 'API:NOT_FOUND', 'API:LOGOUT', 'API:FAIL', 'TOKEN:GET'] as const

type RequestCallback = (...args: any[]) => any
type ResponseCallback = (...args: any[]) => any
type Listener = (req: RequestCallback, resp: ResponseCallback) => void

class EventEmitter<T extends readonly string[]> {
  private eventNames: T
  listeners: Record<T[number], Set<Listener>> = {} as Record<T[number], Set<Listener>>
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
  }

  off(eventName: T[number], listener: Listener) {
    if (!this.listeners[eventName]) return
    this.listeners[eventName].delete(listener)
  }

  emit(eventName: T[number], req: RequestCallback = () => {}, resp: ResponseCallback = () => {}) {
    this.listeners[eventName].forEach((listener) => listener(req, resp))
  }
}

const ApiBus = new EventEmitter(ApiEvent)
export { ApiBus, EventEmitter }
