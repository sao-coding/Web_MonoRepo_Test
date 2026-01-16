import type { AuthStatus, UseAuthReturn } from './use-auth'

import Cookies from 'js-cookie'
import { ClipboardIcon, CopyIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

const InfoRow = ({
  label,
  value,
  isToken
}: {
  label: string;
  value: string;
  isToken?: boolean;
}) => {
  const [showClipboard, setShowClipboard] = useState(false)

  const handleCopy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setShowClipboard(true)
    setTimeout(() => { setShowClipboard(false) }, 500) // 0.5 秒
  }

  return (
    <div style={{ marginBottom: '8px' }}>
      <div
        style={{
          fontSize: '9px',
          color: '#9ca3af',
          marginBottom: '2px',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>{label}</span>

        {value && (
          <button
            type='button'
            onClick={handleCopy}
            title='複製'
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: showClipboard ? '#10b981' : '#9ca3af',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {showClipboard ? (
              <ClipboardIcon size={12} />
            ) : (
              <CopyIcon size={12} />
            )}
          </button>
        )}
      </div>

      <pre
        style={{
          fontSize: '11px',
          color: '#e5e7eb',
          fontFamily: isToken ? 'monospace' : 'inherit',
          wordBreak: 'break-all',
          maxWidth: '280px',
          whiteSpace: 'pre-wrap',
          margin: 0
        }}
      >
        {value || (
          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>無</span>
        )}
      </pre>
    </div>
  )
}

const AuthMonitor = ({ auth }: {
  auth: UseAuthReturn;

}) => {
  const [accessToken, setAccessToken] = useState<string>('')

  useEffect(() => {
    // read cookies only on client after mount to avoid hydration mismatch
    setAccessToken(Cookies.get('accessToken') || '')
  }, [])

  const getStatusColor = (status: AuthStatus): string => {
    switch (status) {
      case 'success':
        return '#10b981'
      case 'error':
        return '#ef4444'
      case 'loading':
      case 'initializing':
        return '#f59e0b'
      case 'idle':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: AuthStatus): string => {
    switch (status) {
      case 'success':
        return '✓'
      case 'error':
        return '✗'
      case 'loading':
      case 'initializing':
        return '⟳'
      case 'idle':
        return '○'
      default:
        return '?'
    }
  }

  const getStatusLabel = (status: AuthStatus): string => {
    switch (status) {
      case 'initializing':
        return '初始化中'
      case 'loading':
        return '載入中'
      case 'success':
        return '成功'
      case 'error':
        return '錯誤'
      case 'idle':
        return '閒置'
      default:
        return status
    }
  }
  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '16px',
        right: '16px',
        zIndex: 9999,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '16px',
          minWidth: '320px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '16px',
            paddingBottom: '12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${getStatusColor(auth.status)} 0%, ${getStatusColor(auth.status)}dd 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 'bold',
              color: 'white',
              marginRight: '12px',
              boxShadow: `0 4px 12px ${getStatusColor(auth.status)}40`
            }}>
              {getStatusIcon(auth.status)}
            </div>
            <div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#f3f4f6',
                marginBottom: '2px'
              }}>
                認證狀態
              </div>
              <div style={{
                fontSize: '11px',
                color: getStatusColor(auth.status),
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {getStatusLabel(auth.status)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ fontSize: '12px' }}>
            <InfoRow
              label='已認證'
              value={auth.isAuthenticated ? '是' : '否'}
            />

            {auth.user && (
              <InfoRow
                label='使用者'
                value={JSON.stringify(auth.user, null, 2)}
              />
            )}

            <InfoRow
              label='存取權杖'
              value={accessToken}
              isToken
            />
          </div>

          {/* Footer indicator */}
          <div style={{
            marginTop: '12px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(auth.status),
              marginRight: '8px',
              animation: (auth.status === 'loading' || auth.status === 'initializing') ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none'
            }} />
            <div style={{
              fontSize: '9px',
              color: '#9ca3af',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Auth Monitor
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  )
}

export default AuthMonitor
