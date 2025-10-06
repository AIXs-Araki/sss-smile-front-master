export function calculateFontSizes(cardWidth: number, cardHeight: number) {
  const vitalFontSize = Math.min(cardWidth * 0.6 / 5, cardHeight / 4)
  const aishFontSize = Math.min(cardWidth * 0.47 / 7, cardHeight / 6)
  const nameFontSize = Math.min(cardWidth / 10, cardHeight / 5)
  const iconSize = Math.min(cardHeight * 0.2)
  const roomFontSize = Math.min(cardWidth * 0.6 / 7.0, cardHeight * 0.2)
  return {
    vitalFontSize, aishFontSize, nameFontSize, iconSize, roomFontSize
  }
}
