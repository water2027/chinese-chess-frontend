import { EventEmitter } from '@/utils/eventEmitter'

// 車 馬 象 士 炮 兵 將
type ChessNames = ['Rook', 'Horse', 'Bishop', 'Advisor', 'Cannon', 'Pawn', 'King']
export type ChessColor = 'red' | 'black'
export type ChessRole = 'self' | 'enemy'
export type Board = Array<{ [key: string]: ChessPiece }>
const ChessEvent = ['CHESS:SELECT', 'CHESS:MOVE', 'CHESS:CHECK'] as const
type ChessPosition = { x: number; y: number }

class ChessPiece {
  public id: number
  public name: string
  public color: ChessColor
  public role: ChessRole = 'enemy'
  public position: ChessPosition
  private radius: number = 25 // 棋子半径
  private gridSize: number = 50 // 棋盘格子大小
  public isSelected: boolean
  private ctx: CanvasRenderingContext2D
  private flashingInterval: number = 0
  static chessEventBus = new EventEmitter(ChessEvent)
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    name: string,
    color: ChessColor,
    role: ChessRole,
    position: ChessPosition,
    gridSize: number = 60,
  ) {
    this.ctx = ctx
    this.id = id
    this.name = name
    this.color = color
    this.role = role
    this.position = position
    this.isSelected = false
    this.gridSize = gridSize
    this.radius = gridSize / 2 // 棋子半径
  }

  public select() {
    this.isSelected = true
    // 选中时发出事件，通知其他棋子取消选中状态
    ChessPiece.chessEventBus.emit('CHESS:SELECT', this, null)
    // 闪烁效果
    let count = 0
    this.flashingInterval = setInterval(() => {
      count++
      count & 1 ? this.clearFromCanvas() : this.draw()
    }, 250)
  }

  public deselect() {
    this.isSelected = false
    // 取消闪烁效果
    clearInterval(this.flashingInterval)
    this.flashingInterval = 0
    this.clearFromCanvas()
    this.draw()
  }

  public draw() {
    const ctx = this.ctx
    const x = this.position.x * this.gridSize + this.gridSize / 2
    const y = this.position.y * this.gridSize + this.gridSize / 2
    ctx.beginPath()
    ctx.arc(x, y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = this.color === 'red' ? '#f44336' : '#212121'
    ctx.fill()

    // 绘制内圆
    ctx.beginPath()
    ctx.arc(x, y, this.radius - 3, 0, Math.PI * 2)
    ctx.strokeStyle = this.color === 'red' ? '#ffcccc' : '#666666'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = this.color === 'red' ? '#ffffff' : '#ffffff'
    ctx.font = 'bold 20px SimHei, Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.name, x, y)
  }

  private clearFromCanvas() {
    const ctx = this.ctx
    const x = this.position.x * this.gridSize + this.gridSize / 2
    const y = this.position.y * this.gridSize + this.gridSize / 2

    const clearRadius = this.radius
    ctx.clearRect(x - clearRadius, y - clearRadius, clearRadius * 2, clearRadius * 2)
  }

  // 坐标由棋盘处理，这里接收的是处理好的坐标
  // 这里的坐标是棋盘坐标系，0-8,0-9
  public move(newPosition: ChessPosition) {
    if (!this.isMoveValid(newPosition)) {
      return
    }
    ChessPiece.chessEventBus.emit(
      'CHESS:MOVE',
      {
        lastPosition: this.position, // 上一个位置
        newPosition: newPosition, // 新位置
        piece: this, // 棋子对象
      },
      null,
    )
    // 清除原来位置
    this.clearFromCanvas()
    // 更新位置
    this.position = newPosition
    // 绘制新位置
    this.draw()
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    const { x, y } = newPosition
    if (x < 0 || x > 8 || y < 0 || y > 9) {
      return false
    }
    if (x === this.position.x && y === this.position.y) {
      return false
    }
    return true
  }
}

class King extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    gridSize: number = 50,
  ) {
    const name = color === 'red' ? '帥' : '將'
    const position = role === 'enemy' ? { x: 4, y: 0 } : { x: 4, y: 9 }
    super(ctx, id, name, color, role, position, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition
    if (x < 3 || x > 5) {
      return false
    }
    const { upY, downY } = this.role === 'enemy' ? { upY: 0, downY: 2 } : { upY: 7, downY: 9 }
    if (y < upY || y > downY) {
      return false
    }

    if (Math.pow(x - this.position.x, 2) + Math.pow(y - this.position.y, 2) > 2) {
      return false
    }

    return true
  }
}

class Advisor extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ) {
    const name = role === 'enemy' ? '仕' : '士'
    const y = role === 'enemy' ? 0 : 9
    super(ctx, id, name, color, role, { x, y }, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition

    if (x < 3 || x > 5) {
      return false
    }

    const { upY, downY } = this.role === 'enemy' ? { upY: 0, downY: 2 } : { upY: 7, downY: 9 }
    if (y < upY || y > downY) {
      return false
    }

    if (Math.abs(x - this.position.x) + Math.abs(y - this.position.y) !== 2) {
      return false
    }

    return true
  }
}

class Bishop extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ) {
    const name = color === 'red' ? '相' : '象'
    const y = role === 'enemy' ? 0 : 9
    super(ctx, id, name, color, role, { x, y }, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition

    if (Math.abs(x - this.position.x) !== 2 || Math.abs(y - this.position.y) !== 2) {
      return false
    }

    const { upY, downY } = this.role === 'enemy' ? { upY: 0, downY: 4 } : { upY: 5, downY: 9 }
    if (y < upY || y > downY) {
      return false
    }

    const midX = (this.position.x + x) / 2
    const midY = (this.position.y + y) / 2
    const resp = {}
    ChessPiece.chessEventBus.emit('CHESS:CHECK', { arr: [{ x: midX, y: midY }] }, resp)
    const { nums } = resp as any
    if (nums > 0) {
      return false
    }
    return true
  }
}

class Pawn extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ) {
    const name = color === 'red' ? '兵' : '卒'
    const y = role === 'enemy' ? 3 : 6
    super(ctx, id, name, color, role, { x, y }, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition

    const river = this.role === 'enemy' ? 4 : 5
    console.log(this.role, river, y, this.position.y)
    if (this.role === 'enemy') {
      if (y - this.position.y < 0) {
        console.log(false)

        return false
      }
      if (this.position.y <= river) {
        if (x !== this.position.x) {
          return false
        }
        return true
      }

      // 过河了
      if (Math.abs(x - this.position.x) + Math.abs(y - this.position.y) !== 1) {
        return false
      }
      return true
    } else {
      if (this.position.y - y < 0) {
        return false
      }
      if (this.position.y >= river) {
        if (x !== this.position.x) {
          return false
        }
        return true
      }

      // 过河了
      if (Math.abs(x - this.position.x) + Math.abs(this.position.y - y) !== 1) {
        return false
      }
      return true
    }
  }
}

class Rook extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ) {
    const name = color === 'red' ? '俥' : '車'
    const y = role === 'enemy' ? 0 : 9
    super(ctx, id, name, color, role, { x, y }, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }

    const arr: ChessPosition[] = []
    const { x, y } = newPosition
    if (x !== this.position.x && y !== this.position.y) {
      return false
    }
    // 检查路径上是否有棋子
    if (x === this.position.x) {
      for (let i = Math.min(this.position.y, y) + 1; i < Math.max(this.position.y, y); i++) {
        arr.push({ x: this.position.x, y: i })
      }
    } else {
      for (let i = Math.min(this.position.x, x) + 1; i < Math.max(this.position.x, x); i++) {
        arr.push({ x: i, y: this.position.y })
      }
    }
    const resp = {}
    ChessPiece.chessEventBus.emit('CHESS:CHECK', { arr }, resp)
    const { nums } = resp as any
    if (nums > 0) {
      return false
    }

    return true
  }
}

class Horse extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ) {
    const name = color === 'red' ? '傌' : '馬'
    const y = role === 'enemy' ? 0 : 9
    super(ctx, id, name, color, role, { x, y }, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }

    const { x, y } = newPosition
    const dx = Math.abs(x - this.position.x)
    const dy = Math.abs(y - this.position.y)
    if (dx + dy !== 3 || dx === 0 || dy === 0) {
      return false
    }

    // 检查是否有障碍物
    const direction = dx > dy
    let checkPosition
    if (direction) {
      const directionX = x - this.position.x > 0 ? 1 : -1
      checkPosition = { x: this.position.x + directionX, y: this.position.y }
    } else {
      const directionY = y - this.position.y > 0 ? 1 : -1
      checkPosition = { x: this.position.x, y: this.position.y + directionY }
    }
    const resp = {}
    ChessPiece.chessEventBus.emit('CHESS:CHECK', { arr: [checkPosition] }, resp)
    const { nums } = resp as any
    if (nums > 0) {
      return false
    }

    return true
  }
}

// 炮
class Cannon extends ChessPiece {
  constructor(
    ctx: CanvasRenderingContext2D,
    id: number,
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ) {
    const name = color === 'red' ? '炮' : '砲'
    const y = role === 'enemy' ? 2 : 7
    super(ctx, id, name, color, role, { x, y }, gridSize)
  }

  public isMoveValid(newPosition: ChessPosition): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }

    const arr: ChessPosition[] = []
    const { x, y } = newPosition

    if (x !== this.position.x && y !== this.position.y) {
      return false
    }

    // 检查路径上是否有棋子
    if (x === this.position.x) {
      for (let i = Math.min(this.position.y, y) + 1; i < Math.max(this.position.y, y); i++) {
        arr.push({ x: this.position.x, y: i })
      }
    } else {
      for (let i = Math.min(this.position.x, x) + 1; i < Math.max(this.position.x, x); i++) {
        arr.push({ x: i, y: this.position.y })
      }
    }
    arr.push(newPosition)
    const resp = {}
    ChessPiece.chessEventBus.emit('CHESS:CHECK', { arr }, resp)
    const { nums } = resp as any
    console.log(nums)
    if (nums !== 2 && nums !== 0) {
      return false
    }

    return true
  }
}

class ChessFactory {
  public static createChessPiece(
    ctx: CanvasRenderingContext2D,
    id: number,
    name: ChessNames[number],
    color: ChessColor,
    role: ChessRole,
    x: number,
    gridSize: number = 50,
  ): ChessPiece {
    switch (name) {
      case 'King':
        return new King(ctx, id, color, role, gridSize)
      case 'Advisor':
        return new Advisor(ctx, id, color, role, x, gridSize)
      case 'Bishop':
        return new Bishop(ctx, id, color, role, x, gridSize)
      case 'Pawn':
        return new Pawn(ctx, id, color, role, x, gridSize)
      case 'Rook':
        return new Rook(ctx, id, color, role, x, gridSize)
      case 'Horse':
        return new Horse(ctx, id, color, role, x, gridSize)
      case 'Cannon':
        return new Cannon(ctx, id, color, role, x, gridSize)
      default:
        console.log(name)
        throw new Error('Invalid chess piece name')
    }
  }
}

export { ChessFactory, ChessPiece }
