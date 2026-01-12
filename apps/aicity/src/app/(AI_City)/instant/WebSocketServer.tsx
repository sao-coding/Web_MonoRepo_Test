/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable node/handle-callback-err */
/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
'use client'
import type { TranscriptionResult } from '@/types'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import AppConfig from '@/config/app'
import { cn } from '@/lib/utils'

const RECONNECT_DELAY = 3000

const WebSocketServer: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false)
  const reconnectTimerRef = useRef<number | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [streamResults, setStreamResults] = useState<TranscriptionResult>({
    status: '',
    source: '',
    translation: '',
    done: false,
  })

  const connectWebSocketServer = useCallback(() => {
    try {
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current)
      }

      const socket = new WebSocket(AppConfig.websocketUrl)

      socket.onopen = () => {
        // console.log('WebSocket 已連線')
        setIsConnected(true)
      }

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.status === 'success') {
            setStreamResults(prev => ({
              status: data.status,
              source: data.source,
              translation: prev.translation + data.translation,
              done: data.done,
            }))
          }
        }
        catch (error) {
          console.error('解析訊息錯誤:', error)
        }
      }

      socket.onclose = () => {
        // console.log('WebSocket 關閉')
        reconnect()
      }

      socket.onerror = (error) => {
        // console.error('WebSocket 錯誤:', error)
        socket.close()
        reconnect()
      }

      wsRef.current = socket
    }
    catch (_error) {
      // console.error('WebSocket 連線錯誤:', error)
      reconnect()
    }
  }, [])

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

  useEffect(() => {
    if (streamResults.done) {
      setStreamResults({
        status: '',
        source: '',
        translation: '',
        done: false,
      })
    }
  }, [streamResults])

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          'rounded-full w-2.5 h-2.5 transition-colors duration-300',
          isConnected ? 'bg-green-500' : 'bg-red-500',
        )}
      />
      <span
        className={cn(
          'text-sm font-medium transition-colors duration-300',
          isConnected ? 'text-green-600' : 'text-red-600',
        )}
      >
        {isConnected ? '已連線' : '未連線'}
      </span>
    </div>
  )
}

export default WebSocketServer
