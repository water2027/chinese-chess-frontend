import ChessPiece from './ChessPiece'
import Drawer from './drawer'

class ChessBoard {
  private board: number[][]
  private gridSize: number
  // 棋盘
  private background: CanvasRenderingContext2D
  // 棋子
  private chesses: CanvasRenderingContext2D
  private pieces: ChessPiece[]
  private width: number
  private height: number

  constructor(
    background: CanvasRenderingContext2D,
    chesses: CanvasRenderingContext2D,
    gridSize: number = 50,
  ) {
    this.background = background
    this.chesses = chesses
    this.width = gridSize * 9
    this.height = gridSize * 10
    this.gridSize = gridSize
    this.board = Array.from({ length: 10 }, () => Array(9).fill(0)) // 初始化棋盘
    this.pieces = [] // 棋子数组
    this.initBoard()
  }

  public initBoard() {
    this.drawBoard()
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
