import { EventEmitter } from '@/utils/eventEmitter'

// type ChessEvent = ['CHESS:SELECT']
const ChessEvent = ['CHESS:SELECT'] as const
type ChessColor = 'red' | 'black'
type ChessRole = 'self' | 'enemy'

class ChessPiece {
  public id: number
  public name: string
  public color: ChessColor
  public role: ChessRole = 'self' 
  public position: { x: number; y: number }
  private radius: number = 25 // 棋子半径
  private gridSize: number = 50 // 棋盘格子大小
  public isSelected: boolean
  // 浏览器环境
  private flashingInterval: number = 0
  static chessEventBus = new EventEmitter(ChessEvent)
  constructor(
    id: number,
    name: string,
    color: ChessColor,
    role: ChessRole,
    position: { x: number; y: number },
    gridSize: number = 60,
  ) {
    this.id = id
    this.name = name
    this.color = color
    this.role = role
    this.position = position
    this.isSelected = false
    this.gridSize = gridSize
    this.radius = gridSize / 2 // 棋子半径
    ChessPiece.chessEventBus.on('CHESS:SELECT', (req, _resp) => {
      const { id } = req
      if (id !== this.id) {
        this.deselect()
      }
    })
  }

  public select() {
    this.isSelected = true
    // 选中时发出事件，通知其他棋子取消选中状态
    ChessPiece.chessEventBus.emit('CHESS:SELECT', { id: this.id }, null)
    // 闪烁效果
    this.flashingInterval = setInterval(() => {
      // 这里添加闪烁的逻辑
    }, 500) // 每500毫秒闪烁一次
  }

  public deselect() {
    this.isSelected = false
    // 取消闪烁效果
    clearInterval(this.flashingInterval)
    this.flashingInterval = 0
  }

  public draw(ctx: CanvasRenderingContext2D) {
    const x = this.position.x * this.gridSize
    const y = this.position.y * this.gridSize
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

    // 绘制外圆（边框）
    ctx.beginPath()
    ctx.arc(x, y, this.radius, 0, Math.PI * 2)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.fillStyle = this.color === 'red' ? '#ffffff' : '#ffffff'
    ctx.font = 'bold 20px SimHei, Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.name, x, y)
  }

  public clearFromCanvas(ctx: CanvasRenderingContext2D) {
    const x = this.position.x * this.gridSize + this.gridSize / 2
    const y = this.position.y * this.gridSize + this.gridSize / 2

    const clearRadius = this.radius
    ctx.clearRect(x - clearRadius, y - clearRadius, clearRadius * 2, clearRadius * 2)
  }

  // 坐标由棋盘处理，这里接收的是处理好的坐标
  // 这里的坐标是棋盘坐标系，0-8,0-9
  public move(newPosition: { x: number; y: number }, ctx: CanvasRenderingContext2D) {
    if (!this.isMoveValid(newPosition)) {
      return
    }
    // 清除原来位置
    this.clearFromCanvas(ctx)
    // 更新位置
    this.position = newPosition
    // 绘制新位置
    this.draw(ctx)
  }

  public isMoveValid(newPosition: { x: number; y: number }): boolean {
    const { x, y } = this.position
    if (x < 0 || x > 8 || y < 0 || y > 9) {
      return false
    }
    return true
  }
}

class King extends ChessPiece {
  constructor(id: number, color: ChessColor, role: ChessRole, gridSize: number = 50) {
    const name = color === 'red' ? '帅' : '将'
    const position = role === 'self' ? { x: 4, y: 0 } : { x: 4, y: 9 }
    super(id, name, color, role, position, gridSize)
  }

  public isMoveValid(newPosition: { x: number; y: number }): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition
    if (x === this.position.x && y === this.position.y) {
      return false
    }
    if (x < 3 || x > 5) {
      return false
    }
    const { upY, downY } = this.role === 'self' ? { upY: 0, downY: 2 } : { upY: 7, downY: 9 }
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
  constructor(id: number, color: ChessColor, role: ChessRole, gridSize: number = 50) {
    const name = role === 'self' ? '仕' : '士'
    const position = color === 'red' ? { x: 5, y: 0 } : { x: 5, y: 9 }
    super(id, name, color, role, position, gridSize)
  }

  public isMoveValid(newPosition: { x: number; y: number }): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition
    if (x === this.position.x && y === this.position.y) {
      return false
    }

    if (x < 3 || x > 5) {
      return false
    }

    const { upY, downY } = this.role === 'self' ? { upY: 0, downY: 2 } : { upY: 7, downY: 9 }
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
  constructor(id: number, color: ChessColor, role: ChessRole, gridSize: number = 50) {
    const name = color === 'red' ? '相' : '象'
    const position = role === 'self' ? { x: 2, y: 0 } : { x: 2, y: 9 }
    super(id, name, color, role, position, gridSize)
  }

  public isMoveValid(newPosition: { x: number; y: number }): boolean {
    if (!super.isMoveValid(newPosition)) {
      return false
    }
    const { x, y } = newPosition
    if (x === this.position.x && y === this.position.y) {
      return false
    }

    if (Math.abs(x - this.position.x) !== 2 || Math.abs(y - this.position.y) !== 2) {
      return false
    }

    const { upY, downY } = this.role === 'self' ? { upY: 0, downY: 4 } : { upY: 5, downY: 9 }
    if (y < upY || y > downY) {
      return false
    }

    return true
  }
}

export { King, Advisor, Bishop }
