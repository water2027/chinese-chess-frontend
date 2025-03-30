import { EventEmitter } from '@/utils/eventEmitter'

// type ChessEvent = ['CHESS:SELECT']
const ChessEvent = ['CHESS:SELECT'] as const

class ChessPiece {
  public id: number
  public name: string
  public color: string
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
    color: string,
    position: { x: number; y: number },
    gridSize: number = 60,
  ) {
    this.id = id
    this.name = name
    this.color = color
    this.position = position
    this.isSelected = false
    this.radius = gridSize / 2 // 棋子半径
    this.gridSize = gridSize
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
    const x = this.position.x * this.gridSize
    const y = this.position.y * this.gridSize

    const clearRadius = this.radius
    ctx.clearRect(x - clearRadius, y - clearRadius, clearRadius * 2, clearRadius * 2)
  }

  public move(newPosition: { x: number; y: number }, ctx: CanvasRenderingContext2D) {
    // 清除原来位置
    this.clearFromCanvas(ctx)
    // 更新位置
    this.position = newPosition
    // 绘制新位置
    this.draw(ctx)
  }
}

export default ChessPiece
