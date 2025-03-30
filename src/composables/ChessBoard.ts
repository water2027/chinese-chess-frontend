import ChessPiece from './ChessPiece'

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

  public drawBoard() {
    this.background.clearRect(0, 0, this.width, this.height)
    this.background.strokeStyle = '#000'
    this.background.lineWidth = 2

    // Set background color
    this.background.fillStyle = '#f4d1a4'
    this.background.fillRect(0, 0, this.width, this.height)

    const offsetX = this.gridSize / 2
    const offsetY = this.gridSize / 2

    // Draw horizontal lines
    for (let i = 0; i < 10; i++) {
      this.background.beginPath()
      this.background.moveTo(offsetX, offsetY + i * this.gridSize)
      this.background.lineTo(offsetX + 8 * this.gridSize, offsetY + i * this.gridSize)
      this.background.stroke()
    }

    // Draw vertical lines - but not across the river
    for (let i = 0; i < 9; i++) {
      // Top half vertical lines (0-4)
      this.background.beginPath()
      this.background.moveTo(offsetX + i * this.gridSize, offsetY)
      this.background.lineTo(offsetX + i * this.gridSize, offsetY + 4 * this.gridSize)
      this.background.stroke()

      // Bottom half vertical lines (5-9)
      this.background.beginPath()
      this.background.moveTo(offsetX + i * this.gridSize, offsetY + 5 * this.gridSize)
      this.background.lineTo(offsetX + i * this.gridSize, offsetY + 9 * this.gridSize)
      this.background.stroke()
    }

    // Draw the river text
    this.background.font = '20px Arial'
    this.background.fillStyle = '#000'
    this.background.textAlign = 'center'
    this.background.fillText('楚 河', offsetX + 2 * this.gridSize, offsetY + 4.5 * this.gridSize)
    this.background.fillText('汉 界', offsetX + 6 * this.gridSize, offsetY + 4.5 * this.gridSize)

    // Draw the palaces (九宫)
    // Top palace
    this.background.beginPath()
    this.background.moveTo(offsetX + 3 * this.gridSize, offsetY)
    this.background.lineTo(offsetX + 5 * this.gridSize, offsetY + 2 * this.gridSize)
    this.background.stroke()

    this.background.beginPath()
    this.background.moveTo(offsetX + 5 * this.gridSize, offsetY)
    this.background.lineTo(offsetX + 3 * this.gridSize, offsetY + 2 * this.gridSize)
    this.background.stroke()

    // Bottom palace
    this.background.beginPath()
    this.background.moveTo(offsetX + 3 * this.gridSize, offsetY + 7 * this.gridSize)
    this.background.lineTo(offsetX + 5 * this.gridSize, offsetY + 9 * this.gridSize)
    this.background.stroke()

    this.background.beginPath()
    this.background.moveTo(offsetX + 5 * this.gridSize, offsetY + 7 * this.gridSize)
    this.background.lineTo(offsetX + 3 * this.gridSize, offsetY + 9 * this.gridSize)
    this.background.stroke()

    this.background.beginPath()
    this.background.moveTo(offsetX + 0 * this.gridSize, offsetY + 4 * this.gridSize)
    this.background.lineTo(offsetX + 0 * this.gridSize, offsetY + 5 * this.gridSize)
    this.background.stroke()

    this.background.beginPath()
    this.background.moveTo(offsetX + 8 * this.gridSize, offsetY + 4 * this.gridSize)
    this.background.lineTo(offsetX + 8 * this.gridSize, offsetY + 5 * this.gridSize)
    this.background.stroke()

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

    // Draw the position markers (small lines at corners)
    // Top-left
    if (x > 0) {
      this.background.beginPath()
      this.background.moveTo(targetX - markerSize, targetY - markerSize)
      this.background.lineTo(targetX - markerSize * 2, targetY - markerSize)
      this.background.stroke()

      this.background.beginPath()
      this.background.moveTo(targetX - markerSize, targetY - markerSize)
      this.background.lineTo(targetX - markerSize, targetY - markerSize * 2)
      this.background.stroke()
    }

    // Top-right
    if (x < 8) {
      this.background.beginPath()
      this.background.moveTo(targetX + markerSize, targetY - markerSize)
      this.background.lineTo(targetX + markerSize * 2, targetY - markerSize)
      this.background.stroke()

      this.background.beginPath()
      this.background.moveTo(targetX + markerSize, targetY - markerSize)
      this.background.lineTo(targetX + markerSize, targetY - markerSize * 2)
      this.background.stroke()
    }

    // Bottom-left
    if (x > 0) {
      this.background.beginPath()
      this.background.moveTo(targetX - markerSize, targetY + markerSize)
      this.background.lineTo(targetX - markerSize * 2, targetY + markerSize)
      this.background.stroke()

      this.background.beginPath()
      this.background.moveTo(targetX - markerSize, targetY + markerSize)
      this.background.lineTo(targetX - markerSize, targetY + markerSize * 2)
      this.background.stroke()
    }

    // Bottom-right
    if (x < 8) {
      this.background.beginPath()
      this.background.moveTo(targetX + markerSize, targetY + markerSize)
      this.background.lineTo(targetX + markerSize * 2, targetY + markerSize)
      this.background.stroke()

      this.background.beginPath()
      this.background.moveTo(targetX + markerSize, targetY + markerSize)
      this.background.lineTo(targetX + markerSize, targetY + markerSize * 2)
      this.background.stroke()
    }
  }

}

export default ChessBoard
