/* eslint-disable react/no-array-index-key */

/* eslint-disable ts/no-use-before-define */
/* eslint-disable style/multiline-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */

import type { TranscriptionResult } from '@/types'
import {
  DownloadIcon,
  FileTextIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  RefreshCwIcon,
  XIcon,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Button } from '@/components/ui/button'
import ModelSelector from '@/components/ui/Modelselector'
import { AppConfig } from '@/config/instant'
import { audioBufferToWav } from '@/utils/audio-utils'

const RECONNECT_DELAY = 3000

const AudioRecorder: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<string>('openai')
  const [status, setStatus] = useState<string>('準備就緒')
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<number | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<number | null>(null)

  // 顯示控制狀態
  const [showSummary, setShowSummary] = useState(false)
  const [streamResults, setStreamResults] = useState<TranscriptionResult>({
    status: '',
    source: '',
    translation: '',
    done: false,
  })

  const [transcriptionResults, setTranscriptionResults] = useState<TranscriptionResult[]>([])
  const lastSourceRef = useRef<string>('')
  const [showOriginal, setShowOriginal] = useState(true)
  const [summaryResults, setSummaryResults] = useState<string>('')
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  // 自動滾動控制
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const [userHasScrolled, setUserHasScrolled] = useState(false)
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const shouldScrollRef = useRef<boolean>(true)

  // 新增備註相關狀態 (替代對話框的內聯方式)
  const [newNoteContent, setNewNoteContent] = useState<string>('')
  const [userNotes, setUserNotes] = useState<string[]>([])
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null)
  const [editNoteContent, setEditNoteContent] = useState<string>('')
  const [isSummaryNoteVisible, setIsSummaryNoteVisible] = useState(false)
  const [summaryNoteContent, setSummaryNoteContent] = useState('')

  // 滾動到底部函數
  const scrollToBottom = useCallback(() => {
    if (contentContainerRef.current && shouldScrollRef.current) {
      contentContainerRef.current.scrollTop = contentContainerRef.current.scrollHeight
    }
  }, [])

  // 將 webm 音訊轉換為 WAV blob
  const convertToWav = async (blob: Blob): Promise<Blob> => {
    // 創建音訊上下文
    const audioContext = new AudioContext()

    // 讀取音訊數據
    const arrayBuffer = await blob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

    // 創建離線音訊上下文，強制設定為單聲道和 16kHz
    const offlineContext = new OfflineAudioContext({
      numberOfChannels: 1, // 強制單聲道
      length: Math.ceil(audioBuffer.duration * 16000), // 根據新的取樣率計算長度
      sampleRate: 16000, // 強制 16kHz
    })

    // 創建音訊源
    const source = offlineContext.createBufferSource()
    source.buffer = audioBuffer

    // 如果是雙聲道，將其混音為單聲道
    if (audioBuffer.numberOfChannels === 2) {
      const merger = offlineContext.createChannelMerger(1)
      source.connect(merger)
      merger.connect(offlineContext.destination)
    }
    else {
      source.connect(offlineContext.destination)
    }

    source.start()

    // 渲染音訊
    const renderedBuffer = await offlineContext.startRendering()

    // 轉換為 WAV 格式
    const wavBuffer = audioBufferToWav(renderedBuffer)
    return new Blob([wavBuffer], { type: 'audio/wav' })
  }

  // WebSocket 連接
  const connectWebSocketServer = useCallback(() => {
    try {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
      }

      const socket = new WebSocket(AppConfig.websocketUrl)

      socket.onopen = () => {
        setIsConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.status === 'success') {
            setStreamResults((prev: { translation: any }) => ({
              status: data.status,
              source: data.source,
              translation: prev.translation + data.translation,
              done: data.done,
            }))

            // 收到新消息時立即觸發滾動
            if (autoScrollEnabled) {
              setTimeout(scrollToBottom, 50)
            }
          }
        }
        catch (error) {
          console.error('解析訊息錯誤:', error)
        }
      }

      socket.onclose = () => {
        reconnect()
      }

      socket.onerror = (error) => {
        console.error('WebSocket 錯誤:', error)
        socket.close()
        reconnect()
      }

      wsRef.current = socket
    }
    catch (error) {
      console.error('WebSocket 連線錯誤:', error)
      reconnect()
    }
  }, [autoScrollEnabled])

  // 重連機制
  const reconnect = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current)
    }
    setIsConnected(false)
    reconnectTimerRef.current = window.setTimeout(() => {
      connectWebSocketServer()
    }, RECONNECT_DELAY)
  }

  useEffect(() => {
    connectWebSocketServer()
    return () => {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connectWebSocketServer])
  // 開始錄製
  // const startCombinedRecording = async () => {
  //   try {
  //     // 檢查瀏覽器支援
  //     if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
  //       throw new Error("您的瀏覽器不支援音訊錄製功能");
  //     }

  //     // 檢查系統音訊捕獲支援
  //     if (!navigator.mediaDevices.getDisplayMedia) {
  //       setStatus("您的瀏覽器不支援系統音訊捕獲，只能錄製麥克風");
  //       console.log("回退到只使用麥克風錄音...");

  //       // 只使用麥克風錄音
  //       const micStream = await navigator.mediaDevices.getUserMedia({
  //         audio: true,
  //         video: false,
  //       });

  //       startRecording(micStream);
  //       setStatus("正在錄製麥克風音訊");
  //       setIsRecording(true);
  //       return;
  //     }

  //     console.log("開始獲取系統音訊...");

  //     // 獲取系統音訊
  //     const screenStream = await navigator.mediaDevices.getDisplayMedia({
  //       audio: {
  //         echoCancellation: false,
  //         noiseSuppression: false,
  //         autoGainControl: false,
  //         channelCount: 2,
  //       },
  //       video: {
  //         frameRate: 1,
  //       },
  //     });

  //     console.log("系統音訊獲取成功，開始獲取麥克風...");

  //     // 獲取麥克風音訊 - 使用簡化的配置
  //     const micStream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //       video: false,
  //     });

  //     // 創建音訊上下文
  //     const audioContext = new AudioContext({
  //       sampleRate: 48000,
  //       latencyHint: "interactive",
  //     });

  //     // 創建來源節點
  //     const screenSource = audioContext.createMediaStreamSource(screenStream);
  //     const micSource = audioContext.createMediaStreamSource(micStream);

  //     // 創建增益節點來控制音量
  //     const screenGain = audioContext.createGain();
  //     const micGain = audioContext.createGain();

  //     screenGain.gain.value = 1.0;
  //     micGain.gain.value = 1.0;

  //     // 創建混音器
  //     const merger = audioContext.createChannelMerger(2);

  //     // 將兩個音源都連接到兩個聲道
  //     screenGain.connect(merger, 0, 0);
  //     screenGain.connect(merger, 0, 1);
  //     micGain.connect(merger, 0, 0);
  //     micGain.connect(merger, 0, 1);

  //     // 連接音源到增益節點
  //     screenSource.connect(screenGain);
  //     micSource.connect(micGain);

  //     // 創建媒體流目標節點
  //     const destination = audioContext.createMediaStreamDestination();
  //     merger.connect(destination);

  //     // 確保目標節點是雙聲道
  //     console.log(
  //       "輸出聲道數:",
  //       destination.stream.getAudioTracks()[0].getSettings().channelCount
  //     );

  //     // 關閉視訊軌道
  //     screenStream.getVideoTracks().forEach((track) => {
  //       track.enabled = false;
  //       track.stop();
  //     });

  //     // 開始錄製
  //     startRecording(destination.stream);
  //     setStatus("正在錄音中...");
  //     setIsRecording(true);
  //   } catch (error) {
  //     console.error("錄音錯誤:", error);
  //     setStatus(
  //       "錄音失敗: " + (error instanceof Error ? error.message : "未知錯誤")
  //     );
  //     setIsRecording(false);
  //   }
  // };
  const startCombinedRecording = async () => {
    try {
      // 檢查瀏覽器支援
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('您的瀏覽器不支援音訊錄製功能')
      }

      // 檢查系統音訊捕獲支援
      if (!navigator.mediaDevices.getDisplayMedia) {
        setStatus('您的瀏覽器不支援系統音訊捕獲，只能錄製麥克風')

        // 只使用麥克風錄音
        const micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        })

        startRecording(micStream)
        setStatus('正在錄製麥克風音訊')
        setIsRecording(true)

        // 重置滾動控制
        setAutoScrollEnabled(true)
        setUserHasScrolled(false)
        return
      }

      // 獲取系統音訊，設定為單聲道
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1, // 改為單聲道
        },
        video: {
          frameRate: 1,
        },
      })

      // 獲取麥克風音訊，設定為單聲道
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1, // 指定為單聲道
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
        video: false,
      })

      // 創建音訊上下文
      const audioContext = new AudioContext({
        sampleRate: 16000, // 16kHz
        latencyHint: 'interactive',
      })

      // 創建來源節點
      const screenSource = audioContext.createMediaStreamSource(screenStream)
      const micSource = audioContext.createMediaStreamSource(micStream)

      // 創建增益節點來控制音量
      const screenGain = audioContext.createGain()
      const micGain = audioContext.createGain()

      screenGain.gain.value = 0.75 // 降低系統音量以避免失真
      micGain.gain.value = 0.75 // 降低麥克風音量以避免失真

      // 創建單聲道混音器
      const merger = audioContext.createChannelMerger(1) // 單聲道

      // 直接連接到混音器的同一個聲道
      screenGain.connect(merger, 0, 0)
      micGain.connect(merger, 0, 0)

      // 連接音源到增益節點
      screenSource.connect(screenGain)
      micSource.connect(micGain)

      // 創建媒體流目標節點
      const destination = audioContext.createMediaStreamDestination()
      merger.connect(destination)

      // 輸出音訊資訊
      // console.log('輸出聲道數:', destination.stream.getAudioTracks()[0].getSettings().channelCount)

      // 關閉視訊軌道
      screenStream.getVideoTracks().forEach((track) => {
        track.enabled = false
        track.stop()
      })

      // 開始錄製
      startRecording(destination.stream)

      // 更新狀態
      setStatus('正在錄音中')
      setIsRecording(true)

      // 重置滾動控制
      setAutoScrollEnabled(true)
      setUserHasScrolled(false)

      setShowSummary(false)
    }
    catch (error) {
      console.error('錄音錯誤:', error)
      setStatus(`錄音失敗: ${error instanceof Error ? error.message : '未知錯誤'}`)
      setIsRecording(false)
    }
  }

  const uploadAudio = async () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        // 首先合併所有的音訊片段
        const webmBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
        chunksRef.current = [] // 清空暫存

        // 轉換為 WAV

        const wavBlob = await convertToWav(webmBlob)

        // // // 生成檔案名稱（使用時間戳）
        // const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        // const filename = `recording-${timestamp}.wav`;

        // // 創建下載
        // const a = document.createElement("a");
        // a.href = URL.createObjectURL(wavBlob);
        // a.download = filename; // 設定檔案名稱
        // document.body.appendChild(a);
        // a.click();
        // document.body.removeChild(a);
        // URL.revokeObjectURL(a.href);

        // console.log("音訊檔案已保存:", filename);

        // 上傳到 WebSocket
        const command
          = selectedModel === 'openai'
            ? 'upload'
            : selectedModel === 'nim'
              ? 'upload_nim'
              : 'upload_nim_zh'
        wsRef.current.send(command)
        wsRef.current.send(lastSourceRef.current)
        wsRef.current.send(wavBlob)
      }
      catch (error) {
        console.error('處理音訊錯誤:', error)
        setStatus('音訊處理失敗')
      }
    }
  }

  const startRecording = (stream: MediaStream) => {
    try {
      // console.log('開始錄音設置...')
      const options = {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000,
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options)

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
          // console.log('已記錄音訊區塊:', event.data.size, 'bytes')
        }
      }

      mediaRecorderRef.current.onstop = () => {
        // console.log('錄音片段結束')
        uploadAudio()
      }

      // 清空之前的結果
      setTranscriptionResults([])
      setSummaryResults('')

      mediaRecorderRef.current.start()

      intervalRef.current = window.setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop()
          mediaRecorderRef.current.start()
        }
      }, 5000)
    }
    catch (error) {
      console.error('錄音設置錯誤:', error)
      setIsRecording(false)
      setStatus('錄音設置失敗')
      throw error
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setStatus('')
  }

  // 添加備註 - 顯示輸入區域
  const addNote = () => {
    setIsAddingNote(true)
    setNewNoteContent('')
  }

  // 保存備註
  const saveNote = () => {
    if (newNoteContent.trim()) {
      setUserNotes([...userNotes, newNoteContent.trim()])
      setNewNoteContent('')
    }
    setIsAddingNote(false)
  }

  // 取消添加備註
  const cancelAddNote = () => {
    setIsAddingNote(false)
    setNewNoteContent('')
  }

  // 刪除備註
  const deleteNote = (index: number) => {
    const newNotes = [...userNotes]
    newNotes.splice(index, 1)
    setUserNotes(newNotes)
  }

  const startEditingNote = (index: number) => {
    setEditingNoteIndex(index)
    setEditNoteContent(userNotes[index])
    setIsAddingNote(false) // 確保添加備註模式被關閉
  }

  const cancelEditingNote = () => {
    setEditingNoteIndex(null)
    setEditNoteContent('')
  }

  const saveEditedNote = () => {
    if (editingNoteIndex !== null && editNoteContent.trim()) {
      const newNotes = [...userNotes]
      newNotes[editingNoteIndex] = editNoteContent.trim()
      setUserNotes(newNotes)
      cancelEditingNote()
    }
  }

  // 安全操作DOM的函數
  const toggleNotesPanel = () => {
    const panel = document.getElementById('notes-panel')
    if (panel) {
      panel.classList.toggle('hidden')
    }
  }

  const hideNotesPanel = () => {
    const panel = document.getElementById('notes-panel')
    if (panel) {
      panel.classList.add('hidden')
    }
  }

  // 在摘要中添加備註
  const saveSummaryNote = () => {
    if (summaryNoteContent.trim()) {
      setUserNotes([...userNotes, summaryNoteContent.trim()])
      setSummaryNoteContent('')
      setIsSummaryNoteVisible(false)
    }
  }

  // 生成摘要
  const generateSummary = async () => {
    setSummaryResults('')
    setIsGeneratingSummary(true)
    if (transcriptionResults.length === 0) {
      setIsGeneratingSummary(false)
      setSummaryResults('請提供逐字稿文本，以便我進行整理。')
      return
    }

    const summaryPrompts = `**請協助整理會議記錄：**
        1. **角色設定：** 你是一名專業的會議記錄秘書。
        2. **工作說明：**
          - 我將提供一份逐字稿文本，請仔細閱讀並理解內容。
          - 按照「會議重點」、「會議總結」、「下次會議事項」的順序進行整理。
          - 每個部分需以條列式清晰呈現。
        3. **格式要求：**
          - 使用以下格式：
            \`\`\`
            ### 會議重點
            （條列內容）

            ### 會議總結
            （條列內容）

            ### 下次會議事項
            （條列內容）
            \`\`\`
          - 條理分明，每個項目簡潔明瞭。
        4. **補充說明：**
          - 所有輸出內容必須以繁體中文撰寫，無需額外解釋及說明。
          - 輸出無需使用 \`\`\` 進行程式碼區塊標記。`

    try {
      const res = await fetch(`${AppConfig.serviceApiUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: '0',
          chat_id: '0',
          query: `${summaryPrompts}\n**會議紀錄逐字內容如下:**\n${transcriptionResults
            .map(result => result.source)
            .join('')}`,
        }),
      })

      const data = await res.json()
      setSummaryResults(data.output)
    }
    catch (error) {
      console.error('生成摘要錯誤:', error)
      setSummaryResults('生成摘要時發生錯誤，請稍後再試。')
    }
    finally {
      setIsGeneratingSummary(false)
    }
  }

  // 匯出摘要
  const exportSummary = () => {
    // 構建包含所有備註的完整內容
    const fullContent
      = summaryResults
        + (userNotes.length > 0 && !summaryResults.includes('### 個人備註')
          ? `\n\n### 個人備註\n\n${userNotes.map(note => `• ${note}\n\n`).join('')}`
          : '')

    const blob = new Blob([fullContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '摘要.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShowOriginal = () => {
    setShowOriginal(!showOriginal)
    // 切換後延遲滾動，確保內容已更新
    setTimeout(scrollToBottom, 200)
  }

  // 手動滾動到底部並重新啟用自動滾動
  const manualScrollToBottom = () => {
    scrollToBottom()
    setAutoScrollEnabled(true)
    setUserHasScrolled(false)
  }

  // 監聽滾動事件
  useEffect(() => {
    const handleScroll = () => {
      const contentContainer = document.querySelector('.content-container')
      if (contentContainer) {
        const { scrollTop, scrollHeight, clientHeight } = contentContainer
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50

        if (!isAtBottom && isRecording && autoScrollEnabled) {
          setUserHasScrolled(true)
          setAutoScrollEnabled(false)
        }
        else if (isAtBottom && isRecording && !autoScrollEnabled) {
          setUserHasScrolled(false)
          setAutoScrollEnabled(true)
        }
      }
    }

    const contentContainer = document.querySelector('.content-container')
    if (contentContainer) {
      contentContainer.addEventListener('scroll', handleScroll)
      return () => contentContainer.removeEventListener('scroll', handleScroll)
    }
  }, [isRecording, autoScrollEnabled])

  // 處理流式結果完成時添加到結果列表
  useEffect(() => {
    if (streamResults.done) {
      const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
      setTranscriptionResults(prev => [
        ...prev,
        {
          status: streamResults.status,
          source: streamResults.source,
          translation: streamResults.translation,
          done: true,
          timestamp: currentTime,
        },
      ])
      setStreamResults({
        status: '',
        source: '',
        translation: '',
        done: false,
      })

      // 確保結果添加後滾動到底部
      if (autoScrollEnabled) {
        // eslint-disable-next-line react-web-api/no-leaked-timeout
        setTimeout(scrollToBottom, 100)
      }
    }
  }, [streamResults, autoScrollEnabled])

  // 記錄最後的源文本以便續傳
  useEffect(() => {
    if (transcriptionResults.length > 0) {
      lastSourceRef.current = transcriptionResults[transcriptionResults.length - 1].source
    }
  }, [transcriptionResults])

  // 定期自動滾動確保在錄音中顯示最新內容
  useEffect(() => {
    let scrollInterval: number | null = null

    if (isRecording && autoScrollEnabled) {
      scrollInterval = window.setInterval(() => {
        scrollToBottom()
      }, 1000) // 每秒檢查一次
    }

    return () => {
      if (scrollInterval) {
        window.clearInterval(scrollInterval)
      }
    }
  }, [isRecording, autoScrollEnabled, scrollToBottom])

  const displayNoteWithLineBreaks = (note: string) => {
    return note.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < note.split('\n').length - 1 && <br />}
      </React.Fragment>
    ))
  }

  // 左側按鈕處理函數：根據錄音狀態判斷顯示添加備註或生成摘要
  const handleLeftButton = () => {
    if (transcriptionResults.length > 0 && !isRecording && !isGeneratingSummary) {
      setShowSummary(true)
    }
    else {
      // 其他情況都顯示添加備註功能
      addNote()
    }
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 overflow-hidden">
      {/* 主要內容區域 - 左右分欄但對齊設計 */}
      <div className="flex-1 flex flex-col  md:flex-row overflow-hidden m-4 mb-20 rounded-2xl shadow-xl bg-gray-100 min-h-0 ">
        <div className="flex flex-col w-full  min-h-0">
          {/* 標題區 - 包含左右兩部分 */}
          <div className="flex bg-gradient-to-r from-gray-100 to-gray-50 rounded-t-xl border-b border-gray-200 flex-shrink-0">
            {/* 左側標題 */}
            <div className="w-1/2 p-3 px-4 flex justify-between items-center ">
              <h2 className="text-base font-semibold flex items-center text-gray-700">
                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 mr-2 flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs">原</span>
                </span>
                原文內容
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs bg-gray-200/80 hover:bg-gray-200 text-gray-600 rounded-full py-1 h-7 px-3"
                onClick={handleShowOriginal}
              >
                {showOriginal ? '隱藏原文' : '顯示原文'}
              </Button>
            </div>

            {/* 右側標題 */}
            <div className="w-1/2 p-3 px-4 flex justify-between items-center bg-blue-50">
              <h2 className="text-base font-semibold flex items-center text-blue-700">
                <span className="h-6 w-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mr-2 flex items-center justify-center shadow-sm">
                  <span className="text-white text-xs">譯</span>
                </span>
                翻譯內容
              </h2>
            </div>
          </div>

          {/* 單一滾動區域 - 使用嵌套的flex布局 */}
          <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-0" ref={contentContainerRef}>
            {transcriptionResults.length > 0 || streamResults.translation ? (
              <div>
                {/* 已完成的轉錄結果 - 無邊界的流暢左右顯示 */}
                {transcriptionResults.map((result, index) => (
                  <div
                    key={`content-${index}`}
                    className="flex w-full hover:bg-gray-50/80 transition-colors"
                  >
                    {/* 左側 - 原文部分 */}
                    <div className="w-1/2 p-4">
                      {showOriginal
                        ? (
                            <div className="relative pl-7">
                              <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 rounded-full"></div>
                              <p className="text-gray-700 leading-relaxed">{result.source}</p>
                              <div className="mt-2">
                                <span className="text-xs text-gray-400">
                                  {result.timestamp
                                    || new Date().toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                </span>
                              </div>
                            </div>
                          )
                        : (
                            <div className="h-px"></div>
                          )}
                    </div>

                    {/* 右側 - 翻譯部分 */}
                    <div className="w-1/2 p-4">
                      <div className="relative pl-7">
                        <div className="absolute left-0 top-0 w-1 h-full bg-blue-400 rounded-full"></div>
                        <p className="text-gray-700 leading-relaxed">{result.translation}</p>
                        <div className="mt-2">
                          <span className="text-xs text-gray-400">
                            {result.timestamp
                              || new Date().toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 正在處理的流式結果 - 顯示在最後 */}
                {streamResults.translation && (
                  <div className="flex w-full bg-blue-50/30">
                    {/* 左側 - 原文部分 */}
                    <div className="w-1/2 p-4">
                      {showOriginal && streamResults.source && (
                        <div className="relative pl-7">
                          <div className="absolute left-0 top-0 w-1 h-full bg-gray-300 rounded-full"></div>
                          <p className="text-gray-700 leading-relaxed">{streamResults.source}</p>
                        </div>
                      )}
                    </div>

                    {/* 右側 - 翻譯部分，帶有打字指示器 */}
                    <div className="w-1/2 p-4">
                      <div className="relative pl-7">
                        <div className="absolute left-0 top-0 w-1 h-full bg-blue-400 rounded-full"></div>
                        <p className="text-gray-700 leading-relaxed">
                          {streamResults.translation}
                          <span className="inline-block h-4 w-1 bg-blue-500 ml-0.5 animate-pulse"></span>
                        </p>
                        <div className="mt-2">
                          <div className="typing-indicator flex items-center space-x-1">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                            <span
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: '0.2s' }}
                            >
                            </span>
                            <span
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: '0.4s' }}
                            >
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex">
                {/* 左側空狀態 */}
                <div className="w-1/2 bg-gray-100 flex items-center justify-center p-6">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <span className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center mb-3">
                      <FileTextIcon size={24} className="text-gray-300" />
                    </span>
                    <p className="text-center">開始錄音後，原文內容將顯示在這裡</p>
                  </div>
                </div>

                {/* 右側空狀態 */}
                <div className="w-1/2 bg-blue-50 flex items-center justify-center p-6">
                  <div className="flex flex-col items-center justify-center text-blue-300">
                    <span className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                      <FileTextIcon size={24} className="text-blue-200" />
                    </span>
                    <p className="text-center">開始錄音後，翻譯內容將顯示在這裡</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 滾動到底部按鈕 - 只在用戶手動滾動時顯示，改進視覺效果 */}
      <AnimatePresence>
        {isRecording && userHasScrolled && (
          <motion.div
            className="fixed bottom-24 right-1/2 transform translate-x-1/2 z-30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <motion.button
              onClick={manualScrollToBottom}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full px-4 py-2 shadow-lg hover:bg-blue-600 flex items-center"
              whileHover={{ scale: 1.05, boxShadow: '0px 0px 15px rgba(59, 130, 246, 0.5)' }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="mr-2">查看最新內容</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <polyline points="19 12 12 19 5 12"></polyline>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 錄音控制中心 - 固定在底部，改進視覺效果 */}
      <div className="fixed inset-x-0 bottom-8 z-30 flex justify-center">
        <div className="relative flex items-center gap-6 px-6 py-1 bg-white rounded-full shadow-lg border border-gray-200">
          {/* 錄音狀態指示燈 - 改進動畫效果 */}
          {isRecording && (
            <div className="absolute -left-1 -top-4 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-medium rounded-full shadow-lg  flex items-center">
              <span className="inline-block w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
              錄音中
            </div>
          )}

          {/* 左側按鈕 - 根據錄音狀態顯示不同功能 */}
          <Button
            variant="outline"
            className="border-gray-300 bg-white text-gray-600 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow rounded-full px-4"
            onClick={handleLeftButton}
          >
            {transcriptionResults.length > 0 && !isRecording ? (
              // 有轉錄結果且不在錄音時顯示為生成摘要按鈕
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                生成摘要
              </>
            ) : (
              // 其他情況顯示為添加備註按鈕
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-4 w-4"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                添加備註
              </>
            )}
          </Button>

          {/* 中間 - 錄音按鈕，改進視覺和動畫效果 */}
          {isRecording ? (
            <div className="flex flex-col items-center">
              <motion.button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-xl hover:shadow-lg mb-2 border-4 border-white relative"
                animate={{
                  boxShadow: ['0 0 0 0 rgba(239, 68, 68, 0.7)', '0 0 0 15px rgba(239, 68, 68, 0)'],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: 'loop',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <rect x="6" y="6" width="12" height="12"></rect>
                </svg>
                {/* 添加脈衝環 */}
                <span
                  className="absolute inset-0 rounded-full bg-red-500/30 animate-ping"
                  style={{ animationDuration: '1.5s' }}
                >
                </span>
              </motion.button>
              <span className="text-gray-500 text-sm flex items-center gap-1 font-medium">
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block text-red-500"
                >
                  ⦁
                </motion.span>
                <span>正在錄音中</span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="inline-block text-red-500"
                >
                  ⦁
                </motion.span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <motion.button
                onClick={startCombinedRecording}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl mb-2 border-4 border-white"
                whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                disabled={!isConnected}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </motion.button>
              <span className="text-gray-500 text-sm font-medium">點擊開始錄音</span>
            </div>
          )}

          {/* 右側 - 模型選擇器 */}
          <ModelSelector onModelChange={setSelectedModel} disabled={isRecording} />
        </div>
      </div>

      {/* 備註快捷按鈕 - 固定在右下角，改進視覺效果 */}
      {userNotes.length > 0 && (
        <div className="fixed right-6 bottom-24 z-30">
          <motion.button
            onClick={toggleNotesPanel}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl border-2 border-white"
            whileHover={{ scale: 1.1, rotate: -5 }}
            whileTap={{ scale: 0.9 }}
            title="查看備註"
          >
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border border-white">
                {userNotes.length}
              </span>
            </div>
          </motion.button>
        </div>
      )}

      {/* 添加備註面板 (條件性顯示) - 保持原樣但改進視覺樣式 */}
      {isAddingNote && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-gray-200 overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-gray-100 to-blue-50 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-700 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2 h-5 w-5 text-blue-500"
                >
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                添加個人備註
              </h3>
              <motion.button
                onClick={cancelAddNote}
                className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100/50"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>
            </div>

            <div className="p-6">
              <textarea
                className="w-full p-4 min-h-[180px] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 resize-none shadow-inner bg-gray-50 text-gray-700"
                placeholder="在此輸入您的會議備註..."
                value={newNoteContent}
                onChange={e => setNewNoteContent(e.target.value)}
              >
              </textarea>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="border-gray-300 text-gray-500 hover:bg-gray-50 rounded-full px-5"
                  onClick={cancelAddNote}
                >
                  取消
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-5"
                  onClick={saveNote}
                  disabled={!newNoteContent.trim()}
                >
                  儲存備註
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 會議摘要彈窗 (條件性顯示) - 增加備註功能 */}
      {showSummary && (
        <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-200"
          >
            <div className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 border-b border-blue-400 flex justify-between items-center">
              <h3 className="font-medium text-white flex items-center">
                <FileTextIcon className="mr-2 h-5 w-5 text-blue-100" />
                會議摘要
              </h3>
              <div className="flex gap-2">
                {summaryResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-blue-600/30 text-blue-50 hover:bg-blue-600/50 rounded-full"
                    onClick={generateSummary}
                    disabled={isGeneratingSummary || transcriptionResults.length === 0}
                  >
                    <RefreshCwIcon className="mr-1 h-4 w-4" />
                    重新生成
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-blue-400 bg-blue-600/30 text-blue-50 hover:bg-blue-600/50 rounded-full"
                  onClick={exportSummary}
                  disabled={isGeneratingSummary || !summaryResults}
                >
                  <DownloadIcon className="mr-1 h-4 w-4" />
                  匯出摘要
                </Button>
                {/* 新增添加備註按鈕 */}
                {summaryResults && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-400 bg-blue-600/30 text-blue-50 hover:bg-blue-600/50 rounded-full"
                    onClick={() => setIsSummaryNoteVisible(true)}
                  >
                    <PencilIcon className="mr-1 h-4 w-4" />
                    添加備註
                  </Button>
                )}
                <motion.button
                  onClick={() => {
                    setShowSummary(false)
                    setIsSummaryNoteVisible(false)
                  }}
                  className="text-white/70 hover:text-white p-1 rounded-full hover:bg-blue-600/30"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <XIcon size={18} />
                </motion.button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-gradient-to-br from-gray-50 to-blue-50/30">
              {isGeneratingSummary ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="relative"
                  >
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 animate-ping"></div>
                    <Loader2Icon size={60} className="text-blue-500 relative z-10" />
                  </motion.div>
                  <p className="text-gray-600 font-medium mt-6">AI 正在分析會議內容並生成摘要...</p>
                </div>
              ) : summaryResults ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                    <div className="prose prose-gray prose-headings:mt-6 prose-headings:mb-3 prose-h3:text-lg prose-h3:font-bold prose-h3:text-gray-800 max-w-none">
                      <ReactMarkdown children={summaryResults.trim()} />
                    </div>

                    {userNotes.length > 0 && !summaryResults.includes('### 個人備註') && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <span className="inline-block w-1.5 h-5 bg-purple-500 mr-2 rounded-full"></span>
                          個人備註
                        </h3>
                        <div className="pl-6 bg-purple-50 p-4 rounded-xl border border-purple-100">
                          {userNotes.map((note, index) => (
                            <div key={index} className="mb-4 last:mb-0">
                              <div className="flex items-start">
                                <span className="mr-3 font-bold text-purple-500 text-lg leading-tight">
                                  •
                                </span>
                                <div className="whitespace-pre-wrap text-gray-700">
                                  {displayNoteWithLineBreaks(note)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 在摘要中直接添加備註的區域 */}
                    {isSummaryNoteVisible && (
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <span className="inline-block w-1.5 h-5 bg-purple-500 mr-2 rounded-full"></span>
                          添加備註至摘要
                        </h3>
                        <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                          <textarea
                            className="w-full p-4 min-h-[120px] border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4 resize-none shadow-inner bg-white text-gray-700"
                            placeholder="在此輸入您的會議備註..."
                            value={summaryNoteContent}
                            onChange={e => setSummaryNoteContent(e.target.value)}
                          >
                          </textarea>

                          <div className="flex justify-end gap-3">
                            <Button
                              variant="outline"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50 rounded-full px-4"
                              onClick={() => setIsSummaryNoteVisible(false)}
                            >
                              取消
                            </Button>
                            <Button
                              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-full px-4"
                              onClick={saveSummaryNote}
                              disabled={!summaryNoteContent.trim()}
                            >
                              保存備註
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-center bg-white p-10 rounded-2xl shadow-md border border-gray-200 max-w-lg mx-auto">
                  <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-6">
                    <FileTextIcon size={32} className="text-blue-300" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-800 mb-3">生成會議摘要</h3>
                  <p className="text-gray-500 mb-6">
                    {transcriptionResults.length === 0
                      ? '沒有足夠的會議內容來生成摘要，請先進行錄音。'
                      : '您可以根據目前的會議內容生成摘要。'}
                  </p>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full px-8 py-2.5"
                    onClick={generateSummary}
                    disabled={transcriptionResults.length === 0}
                  >
                    <FileTextIcon className="mr-2 h-5 w-5" />
                    {summaryResults ? '重新生成摘要' : '立即生成摘要'}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      {/* 個人備註列表面板 */}
      <div id="notes-panel" className="fixed right-6 bottom-24 z-40 hidden">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-80 max-h-[500px] flex flex-col overflow-hidden">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 border-b border-purple-400 flex justify-between items-center">
            <h3 className="font-medium text-white text-sm flex items-center">
              <FileTextIcon className="mr-2 h-4 w-4" />
              個人備註 (
              {userNotes.length}
              )
            </h3>
            <div className="flex gap-1">
              <motion.button
                onClick={addNote}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="添加備註"
              >
                <PlusIcon size={16} />
              </motion.button>
              <motion.button
                onClick={hideNotesPanel}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="隱藏備註"
              >
                <XIcon size={16} />
              </motion.button>
            </div>
          </div>

          {/* 添加固定高度和overflow-y-auto確保滾動正常工作 */}
          <div
            className="flex-1 overflow-y-auto p-3 notes-list-container bg-gray-50"
            style={{ maxHeight: 'calc(500px - 50px)' }}
          >
            {userNotes.length > 0 ? (
              userNotes.map((note, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white p-3 rounded-xl mb-2 border border-gray-200 text-sm shadow-sm hover:shadow-md transition-all duration-200"
                >
                  {editingNoteIndex === index ? (
                    // 編輯模式
                    <div>
                      <textarea
                        className="w-full p-3 min-h-[100px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3 resize-none text-sm shadow-inner bg-gray-50 text-gray-700"
                        value={editNoteContent}
                        onChange={e => setEditNoteContent(e.target.value)}
                      >
                      </textarea>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="text-xs px-3 py-1 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                          onClick={cancelEditingNote}
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          className="text-xs px-3 py-1 rounded-full bg-purple-500 text-white hover:bg-purple-600"
                          onClick={saveEditedNote}
                          disabled={!editNoteContent.trim()}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    // 顯示模式 - 添加word-break確保長文字不會溢出
                    <div>
                      <p className="text-gray-700 whitespace-pre-wrap mb-2 break-words">
                        {displayNoteWithLineBreaks(note)}
                      </p>
                      <div className="flex justify-end space-x-2">
                        <motion.button
                          onClick={() => startEditingNote(index)}
                          className="text-purple-500 hover:text-purple-600 transition-colors p-1 rounded-full hover:bg-purple-50"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          title="編輯備註"
                        >
                          <PencilIcon size={14} />
                        </motion.button>
                        <motion.button
                          onClick={() => deleteNote(index)}
                          className="text-red-500 hover:text-red-600 transition-colors p-1 rounded-full hover:bg-red-50"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          title="刪除備註"
                        >
                          <XIcon size={14} />
                        </motion.button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center mb-3">
                  <FileTextIcon size={18} className="text-purple-300" />
                </div>
                <p className="text-gray-500 text-sm mb-3">還沒有備註</p>
                <button
                  type="button"
                  onClick={addNote}
                  className="text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 flex items-center"
                >
                  <PlusIcon size={12} className="mr-1" />
                  添加新備註
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 狀態信息 */}
      <div className="fixed bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <div className="pb-24">
          {status && (
            <span className="inline-block px-3 py-1 bg-white text-gray-700 shadow-md rounded-full text-xs mb-1">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioRecorder
