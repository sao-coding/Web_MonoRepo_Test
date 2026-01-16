'use client'

import { useEffect } from 'react'

const TestPage = () => {
  useEffect(() => {
    const fetchData = async () => {
      await fetch('/aiforce/api/ai-force/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: 'jeterluan',
          password: 'Stu911209',
        }),
      })
    }
    fetchData()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">測試頁面</h1>
      <p className="mt-4 text-gray-600">這是一個測試頁面。</p>

    </div>
  )
}

export default TestPage
