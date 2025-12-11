'use client'

import React from 'react'
// import { useNavigate } from 'react-router-dom'
// import { Button } from '../../../components/ui/button'
import AudioRecorder from './AudioRecorder'
import WebSocketServer from './WebSocketServer'

const HomePage = () => {
  // const navigate = useNavigate()

  return (
    <div className="flex flex-col pb-2">

      <AudioRecorder />
      <footer className="p-2 border-t text-sm flex justify-between items-center">
        <div className="px-3">
          <WebSocketServer />
        </div>
        <div className="text-sm text-gray-500"></div>
        <div className="flex space-x-2 text-sm text-gray-500">
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          MSI 即時行動meet
        </div>
      </footer>
    </div>
  )
}

export default HomePage
