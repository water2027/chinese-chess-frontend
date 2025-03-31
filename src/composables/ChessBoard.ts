import { ChessPiece, ChessFactory, King } from './ChessPiece'
import type { ChessColor, Board, ChessRole } from './ChessPiece'
import Drawer from './drawer'

class ChessBoard {
  private board: Board
  private gridSize: number
  // 棋盘
  private boardElement: HTMLCanvasElement
  private background: CanvasRenderingContext2D
  // 棋子
  private chessesElement: HTMLCanvasElement
  private chesses: CanvasRenderingContext2D
  private width: number
  private height: number
  private selectedPiece: ChessPiece | null = null
  private color: ChessColor
  private currentRole: ChessRole

  constructor(
    boardElement: HTMLCanvasElement,
    chessesElement: HTMLCanvasElement,
    selfColor: ChessColor,
    gridSize: number = 50,
  ) {
    this.boardElement = boardElement
    this.chessesElement = chessesElement
    this.width = gridSize * 9
    this.height = gridSize * 10
    this.boardElement.width = this.width
    this.boardElement.height = this.height
    this.chessesElement.width = this.width
    this.chessesElement.height = this.height
    this.background = this.boardElement.getContext('2d') as CanvasRenderingContext2D
    this.chesses = this.chessesElement.getContext('2d') as CanvasRenderingContext2D
    this.color = selfColor
    this.currentRole = selfColor === 'red' ? 'self' : 'enemy'
    this.gridSize = gridSize
    this.board = new Array(9).fill(null).map(() => {
      return {}
    })

    this.initGame()
  }

  public initGame() {
    this.drawBoard()
    this.initChesses()
    this.drawChesses()

    this.listenClick()
    this.listenEvent()
  }

  private listenClick() {
    this.chessesElement.addEventListener('click', (event) => {
      const rect = this.chessesElement.getBoundingClientRect()
      const x = Math.floor((event.clientX - rect.left) / this.gridSize)
      const y = Math.floor((event.clientY - rect.top) / this.gridSize)

      // 棋子点击事件
      const piece = this.board[x][y]
      if (this.selectedPiece) {
        if (!piece || piece.color !== this.selectedPiece.color) {
          ChessPiece.chessEventBus.emit('CHESS:MOVE', {
            lastPosition: this.selectedPiece.position,
            newPosition: { x, y },
          })
          this.selectedPiece.deselect()
          this.selectedPiece = null
          return
        }
        ChessPiece.chessEventBus.emit('CHESS:SELECT', piece, null)
        return
      }

      if (piece) {
        ChessPiece.chessEventBus.emit('CHESS:SELECT', piece, null)
      }
    })
  }

  private listenEvent() {
    ChessPiece.chessEventBus.on('CHESS:SELECT', (piece, _resp) => {
      if (piece.role !== this.currentRole) {
        return
      }
      this.selectedPiece?.deselect()
      this.selectedPiece = piece
      piece.select()
    })

    ChessPiece.chessEventBus.on('CHESS:MOVE', (req, _resp) => {
      const { lastPosition, newPosition } = req
      const piece = this.board[lastPosition.x][lastPosition.y]
      const targetPiece = this.board[newPosition.x][newPosition.y]
      if (!piece) {
        return
      }
      if (piece.role !== this.currentRole) {
        return
      }
      piece.move(newPosition)
      if (targetPiece) {
        if (targetPiece instanceof King) {
          const winner = this.currentRole
          setTimeout(() => alert(`${winner} win!`))
        }
      }
      delete this.board[lastPosition.x][lastPosition.y]
      this.board[newPosition.x][newPosition.y] = piece

      this.currentRole = this.currentRole === 'self' ? 'enemy' : 'self'
    })

    ChessPiece.chessEventBus.on('CHESS:CHECK', (req, resp) => {
      const { arr } = req
      let nums = 0
      for (const p of arr) {
        const { x, y } = p
        const piece = this.board[x][y]
        if (piece) {
          nums++
        }
      }
      resp.nums = nums
    })

    ChessPiece.chessEventBus.on('CHESS:QUERY', (req, resp) => {
      const { x, y } = req
      const piece = this.board[x][y]
      if (piece) {
        resp.piece = piece
      }
    })
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
        this.color,
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
        this.color,
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
        this.color,
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
        this.color,
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
        this.color,
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
        this.color,
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
        this.color,
        'self',
        x,
        this.gridSize,
      )
      id++
      this.board[x][9] = piece
    }

    // 反方棋子
    const enemyColor = this.color === 'red' ? 'black' : 'red'
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

  private drawChesses() {
    this.chesses.clearRect(0, 0, this.width, this.height)
    this.board.forEach((row, x) => {
      Object.values(row).forEach((piece) => {
        piece.draw()
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
