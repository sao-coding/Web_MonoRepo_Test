// src/utils/audio-utils.ts

function writeUTFBytes(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

export function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = 1 // 強制單聲道
  const sampleRate = 16000 // 強制 16kHz
  const format = 1 // PCM
  const bitDepth = 16

  const bytesPerSample = bitDepth / 8
  const blockAlign = numChannels * bytesPerSample

  const newLength = Math.ceil(buffer.length * (16000 / buffer.sampleRate))
  const dataLength = newLength * blockAlign
  const bufferLength = 44 + dataLength

  const arrayBuffer = new ArrayBuffer(bufferLength)
  const view = new DataView(arrayBuffer)

  // RIFF 標頭 (使用 little-endian)
  writeUTFBytes(view, 0, 'RIFF')
  view.setUint32(4, bufferLength - 8, true) // 使用 little-endian
  writeUTFBytes(view, 8, 'WAVE')

  // fmt 子區塊
  writeUTFBytes(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // 子區塊大小
  view.setUint16(20, format, true) // 音訊格式 (PCM)
  view.setUint16(22, numChannels, true) // 聲道數
  view.setUint32(24, sampleRate, true) // 取樣率
  view.setUint32(28, sampleRate * blockAlign, true) // 位元率
  view.setUint16(32, blockAlign, true) // 區塊對齊
  view.setUint16(34, bitDepth, true) // 位元深度

  // data 子區塊
  writeUTFBytes(view, 36, 'data')
  view.setUint32(40, dataLength, true)

  // 處理音訊數據
  const offset = 44
  const inputData = buffer.getChannelData(0)

  // 如果是雙聲道，混合為單聲道
  if (buffer.numberOfChannels === 2) {
    const inputData2 = buffer.getChannelData(1)
    for (let i = 0; i < inputData.length; i++) {
      inputData[i] = (inputData[i] + inputData2[i]) / 2
    }
  }

  // 重新取樣到 16kHz
  const stepSize = buffer.sampleRate / 16000
  for (let i = 0; i < newLength; i++) {
    const position = Math.floor(i * stepSize)
    let sample = inputData[position]

    // 限制範圍
    sample = Math.max(-1, Math.min(1, sample))
    // 轉換到 16 位元整數
    sample = Math.floor(sample < 0 ? sample * 0x8000 : sample * 0x7FFF)

    view.setInt16(offset + i * bytesPerSample, sample, true) // 使用 little-endian
  }

  return arrayBuffer
}
