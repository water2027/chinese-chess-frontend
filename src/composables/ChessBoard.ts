import { showMsg } from '@/components/MessageBox'
import { ChessPiece, ChessFactory, King } from './ChessPiece'
import type { ChessColor, Board, ChessRole, ChessPosition } from './ChessPiece'
import Drawer from './drawer'
import channel from '@/utils/channel'

class ChessBoard {
  private board: Board
  private gridSize: number
  // 棋盘
  private boardElement: HTMLCanvasElement
  private background: CanvasRenderingContext2D
  // 棋子
  private chessesElement: HTMLCanvasElement
  private chesses: CanvasRenderingContext2D
  private selectedPiece: ChessPiece | null = null
  private selfColor: ChessColor
  private currentRole: ChessRole
  private isNetPlay: boolean = false

  constructor(
    boardElement: HTMLCanvasElement,
    chessesElement: HTMLCanvasElement,
    selfColor: ChessColor,
    gridSize: number = 50,
  ) {
    this.boardElement = boardElement
    this.chessesElement = chessesElement
    this.selfColor = selfColor
    this.currentRole = selfColor === 'red' ? 'self' : 'enemy'
    this.gridSize = gridSize
    this.board = new Array(9).fill(null).map(() => {
      return {}
    })
    this.initCanvasElement()
    this.background = this.boardElement.getContext('2d') as CanvasRenderingContext2D
    this.chesses = this.chessesElement.getContext('2d') as CanvasRenderingContext2D
  }

  get width(): number {
    return this.gridSize * 9
  }

  get height(): number {
    return this.gridSize * 10
  }

  private clickHandler(event: MouseEvent) {
    const rect = this.chessesElement.getBoundingClientRect()
    const x = Math.floor((event.clientX - rect.left) / this.gridSize)
    const y = Math.floor((event.clientY - rect.top) / this.gridSize)

    // 自己是什么颜色
    const selfColor = this.selfColor
    // 对方是什么颜色
    const enemyColor = this.selfColor === 'red' ? 'black' : 'red'

    // 棋子点击事件
    const piece = this.board[x][y]
    if (this.selectedPiece) {
      if (!piece || piece.color !== this.selectedPiece.color) {
        const curPiece = this.selectedPiece
        this.move(curPiece.position, { x, y })
        this.selectedPiece.deselect()
        this.selectedPiece = null
        return
      }
    }

    if (piece) {
      // 不是当前角色的棋子不能选中
      if (piece.color !== (this.currentRole === 'self' ? selfColor : enemyColor)) {
        return
      }
      // 不是自己的回合不能选中
      if (this.isNetPlay) {
        if (this.currentRole === 'enemy') {
          return
        }
      }
      this.selectPiece(piece)
    }
  }

  private move(from: ChessPosition, to: ChessPosition) {
    const piece = this.board[from.x][from.y]
    const targetPiece = this.board[to.x][to.y]
    if (!piece) {
      return
    }

    if (!piece.isMoveValid(to, this.board)) {
      return
    }

    piece.move(to)

    // 只有自己走才发送走子事件
    if (this.currentRole === 'self') {
      this.isNetPlay&&channel.emit('NET:CHESS:MOVE:END', { from, to })
    }
    if (targetPiece) {
      if (targetPiece instanceof King) {
        const winner = this.currentRole === 'self' ? this.selfColor : targetPiece.color
        channel.emit('GAME:END', { winner })
        this.end(winner)
      }
    }
    this.currentRole = this.currentRole === 'self' ? 'enemy' : 'self'
    delete this.board[from.x][from.y]
    this.board[to.x][to.y] = piece
  }

  private listenClick() {
    this.chessesElement.addEventListener('click', this.clickHandler.bind(this))
  }

  private end(winner: string) {
    this.chessesElement.removeEventListener('click', this.clickHandler.bind(this))
    showMsg(winner)
  }

  private selectPiece(piece: ChessPiece) {
    if (!this.isNetPlay) {
      // 本地
      if (!piece || piece.role !== this.currentRole) {
        return
      }
    } else {
      // 联网
      if (piece.color !== this.selfColor) {
        return
      }
    }

    this.selectedPiece?.deselect()
    this.selectedPiece = piece
    piece.select()
  }

  public start(color: ChessColor, isNet: boolean) {
    this.isNetPlay = isNet
    this.selfColor = color
    this.currentRole = color === 'red' ? 'self' : 'enemy'
    this.board = new Array(9).fill(null).map(() => {
      return {}
    })
    this.drawBoard()
    this.initChesses()
    this.drawChesses()
    this.listenClick()
    this.listenEvent()
  }

  public stop() {
    this.chessesElement.removeEventListener('click', this.clickHandler.bind(this))
    this.clear()
    channel.off('NET:CHESS:MOVE')
  }

  private listenMove(req: { from: ChessPosition; to: ChessPosition }) {
    const { from, to } = req
    this.move(from, to)
  }

  private listenEvent() {
    channel.on('NET:CHESS:MOVE', this.listenMove.bind(this))
  }

  private initChesses() {
    let id = 0
    // 車 馬 象 士 炮 兵 將
    for (let i = 0; i < 2; ++i) {
      const x = i * 8 + 0
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Rook',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][9] = piece
    }

    for (let i = 0; i < 2; ++i) {
      const x = i * 6 + 1
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Horse',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][9] = piece
    }

    for (let i = 0; i < 2; ++i) {
      const x = i * 4 + 2
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Bishop',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][9] = piece
    }

    for (let i = 0; i < 2; ++i) {
      const x = i * 2 + 3
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Advisor',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][9] = piece
    }

    for (let i = 0; i < 2; ++i) {
      const x = i * 6 + 1
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Cannon',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][7] = piece
    }

    for (let i = 0; i < 5; ++i) {
      const x = i * 2 + 0
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Pawn',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][6] = piece
    }

    for (let i = 0; i < 1; ++i) {
      const x = 4
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'King',
        this.selfColor,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][9] = piece
    }

    // 反方棋子
    const enemyColor = this.selfColor === 'red' ? 'black' : 'red'
    for (let i = 0; i < 2; ++i) {
      const x = i * 8 + 0
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Rook',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][0] = piece
    }
    for (let i = 0; i < 2; ++i) {
      const x = i * 6 + 1
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Horse',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][0] = piece
    }
    for (let i = 0; i < 2; ++i) {
      const x = i * 4 + 2
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Bishop',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][0] = piece
    }
    for (let i = 0; i < 2; ++i) {
      const x = i * 2 + 3
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Advisor',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][0] = piece
    }
    for (let i = 0; i < 2; ++i) {
      const x = i * 6 + 1
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Cannon',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][2] = piece
    }
    for (let i = 0; i < 5; ++i) {
      const x = i * 2 + 0
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'Pawn',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][3] = piece
    }
    for (let i = 0; i < 1; ++i) {
      const x = 4
      const piece = ChessFactory.createChessPiece(
        this.chesses,
        id,
        'King',
        enemyColor,
        'enemy',
        x,
        this.gridSize,
      )
      id++
      this.board[x][0] = piece
    }
  }

  private initCanvasElement() {
    this.boardElement.width = this.width
    this.boardElement.height = this.height
    this.chessesElement.width = this.width
    this.chessesElement.height = this.height
  }

  public redraw(newSize: number = this.gridSize) {
    this.clear()
    this.gridSize = newSize
    this.initCanvasElement()
    this.drawBoard()
    this.drawChesses()
  }

  private clear() {
    this.background.clearRect(0, 0, this.width, this.height)
    this.chesses.clearRect(0, 0, this.width, this.height)
  }

  private drawChesses() {
    this.chesses.clearRect(0, 0, this.width, this.height)
    this.board.forEach((row, x) => {
      Object.values(row).forEach((piece) => {
        piece.draw(this.gridSize)
      })
    })
  }

  private drawBoard() {
    this.background.clearRect(0, 0, this.width, this.height)
    this.background.strokeStyle = '#000'
    this.background.lineWidth = 2

    // Set background color
    this.background.fillStyle = '#f4d1a4'
    this.background.fillRect(0, 0, this.width, this.height)

    const offsetX = this.gridSize / 2
    const offsetY = this.gridSize / 2

    const lineDrawer = Drawer.drawLine.bind(null, this.background)

    // Draw horizontal lines
    for (let i = 0; i < 10; i++) {
      lineDrawer(
        offsetX,
        offsetY + i * this.gridSize,
        offsetX + 8 * this.gridSize,
        offsetY + i * this.gridSize,
      )
    }

    // Draw vertical lines - but not across the river
    for (let i = 0; i < 9; i++) {
      lineDrawer(
        offsetX + i * this.gridSize,
        offsetY,
        offsetX + i * this.gridSize,
        offsetY + 4 * this.gridSize,
      )

      lineDrawer(
        offsetX + i * this.gridSize,
        offsetY + 5 * this.gridSize,
        offsetX + i * this.gridSize,
        offsetY + 9 * this.gridSize,
      )
    }

    this.background.font = '20px Arial'
    this.background.fillStyle = '#000'
    this.background.textAlign = 'center'
    this.background.fillText('楚 河', offsetX + 2 * this.gridSize, offsetY + 4.5 * this.gridSize)
    this.background.fillText('汉 界', offsetX + 6 * this.gridSize, offsetY + 4.5 * this.gridSize)

    // Draw the palaces (九宫)
    // Top palace
    lineDrawer(
      offsetX + 3 * this.gridSize,
      offsetY,
      offsetX + 5 * this.gridSize,
      offsetY + 2 * this.gridSize,
    )

    lineDrawer(
      offsetX + 5 * this.gridSize,
      offsetY,
      offsetX + 3 * this.gridSize,
      offsetY + 2 * this.gridSize,
    )

    lineDrawer(
      offsetX + 3 * this.gridSize,
      offsetY + 7 * this.gridSize,
      offsetX + 5 * this.gridSize,
      offsetY + 9 * this.gridSize,
    )

    lineDrawer(
      offsetX + 5 * this.gridSize,
      offsetY + 7 * this.gridSize,
      offsetX + 3 * this.gridSize,
      offsetY + 9 * this.gridSize,
    )

    lineDrawer(
      offsetX + 0 * this.gridSize,
      offsetY + 4 * this.gridSize,
      offsetX + 0 * this.gridSize,
      offsetY + 5 * this.gridSize,
    )

    lineDrawer(
      offsetX + 8 * this.gridSize,
      offsetY + 4 * this.gridSize,
      offsetX + 8 * this.gridSize,
      offsetY + 5 * this.gridSize,
    )

    // Draw the position markers for soldiers/pawns
    this.drawPositionMarker(0, 3, offsetX, offsetY)
    this.drawPositionMarker(2, 3, offsetX, offsetY)
    this.drawPositionMarker(4, 3, offsetX, offsetY)
    this.drawPositionMarker(6, 3, offsetX, offsetY)
    this.drawPositionMarker(8, 3, offsetX, offsetY)

    this.drawPositionMarker(0, 6, offsetX, offsetY)
    this.drawPositionMarker(2, 6, offsetX, offsetY)
    this.drawPositionMarker(4, 6, offsetX, offsetY)
    this.drawPositionMarker(6, 6, offsetX, offsetY)
    this.drawPositionMarker(8, 6, offsetX, offsetY)

    // Draw the position markers for cannons
    this.drawPositionMarker(1, 2, offsetX, offsetY)
    this.drawPositionMarker(7, 2, offsetX, offsetY)
    this.drawPositionMarker(1, 7, offsetX, offsetY)
    this.drawPositionMarker(7, 7, offsetX, offsetY)
  }

  private drawPositionMarker(x: number, y: number, offsetX: number, offsetY: number) {
    const markerSize = 5

    const targetX = offsetX + x * this.gridSize
    const targetY = offsetY + y * this.gridSize

    const lineDrawer = Drawer.drawLine.bind(null, this.background)

    // Draw the position markers (small lines at corners)
    // Top-left
    if (x > 0) {
      lineDrawer(
        targetX - markerSize,
        targetY - markerSize,
        targetX - markerSize * 2,
        targetY - markerSize,
      )

      lineDrawer(
        targetX - markerSize,
        targetY - markerSize,
        targetX - markerSize,
        targetY - markerSize * 2,
      )
    }

    // Top-right
    if (x < 8) {
      lineDrawer(
        targetX + markerSize,
        targetY - markerSize,
        targetX + markerSize * 2,
        targetY - markerSize,
      )

      lineDrawer(
        targetX + markerSize,
        targetY - markerSize,
        targetX + markerSize,
        targetY - markerSize * 2,
      )
    }

    // Bottom-left
    if (x > 0) {
      lineDrawer(
        targetX - markerSize,
        targetY + markerSize,
        targetX - markerSize * 2,
        targetY + markerSize,
      )

      lineDrawer(
        targetX - markerSize,
        targetY + markerSize,
        targetX - markerSize,
        targetY + markerSize * 2,
      )
    }

    // Bottom-right
    if (x < 8) {
      lineDrawer(
        targetX + markerSize,
        targetY + markerSize,
        targetX + markerSize * 2,
        targetY + markerSize,
      )

      lineDrawer(
        targetX + markerSize,
        targetY + markerSize,
        targetX + markerSize,
        targetY + markerSize * 2,
      )
    }
  }
}

export default ChessBoard
