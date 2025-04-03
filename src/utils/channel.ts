export interface GameEvents {
    'MATCH:SUCCESS': null;
    'GAME:START': {
        color: 'red' | 'black';
    };
    'GAME:END': {
        winner: 'red' | 'black';
    };
    'NET:GAME:START': {
        color: 'red' | 'black';
    },
    'NET:GAME:END':{
        winner: 'self' | 'enemy';
    },
    'NET:CHESS:MOVE': {
        from: {x: number; y: number};
        to: {x: number; y: number};
    };
    'NET:CHESS:MOVE:END': {
        from: {x: number; y: number};
        to: {x: number; y: number};
    };
}

type Listener<T> = (req: T) => void

class Channel {
    private eventsQueue: {
        [K in keyof GameEvents]: Array<GameEvents[K]>;
    }
    private listeners: {
        [K in keyof GameEvents]?: Listener<GameEvents[K]>;
    } = {}

    constructor() {
        this.eventsQueue = {
            'MATCH:SUCCESS': [],
            'GAME:START': [],
            'GAME:END': [],
            'NET:GAME:START': [],
            'NET:GAME:END': [],
            'NET:CHESS:MOVE': [],
            'NET:CHESS:MOVE:END': []
        } as {
            [K in keyof GameEvents]: Array<GameEvents[K]>;
        };
    }

    on<K extends keyof GameEvents>(eventName: K, listener: Listener<GameEvents[K]>) {
        this.listeners[eventName] = listener as any
        if (this.eventsQueue[eventName]) {
            while(this.eventsQueue[eventName].length) {
                const req = this.eventsQueue[eventName].shift()
                if(req === undefined) {
                    return
                }
                listener(req)
            }
        }
    }

    off(eventName: keyof GameEvents) {
        if (!this.listeners[eventName]) return
        delete this.listeners[eventName]
    }

    emit<K extends keyof GameEvents>(eventName: K, req: GameEvents[K]) {
        if (!this.listeners[eventName]) {
            this.eventsQueue[eventName].push(req)
            return
        }
        this.listeners[eventName](req)
    }
}

export default new Channel()