'use client'

import type { Patent } from '../_types/patent'
import {
  BotIcon,
  Telescope,
} from 'lucide-react'
import React, { useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const PatentsChat = ({
  item,
}: {
  item: Patent
}) => {
  const answerRef = useRef<HTMLDivElement>(null)

  return (
    <>
      {item.role === 'user'
        ? (
            <div className="flex justify-end">
              <div className="bg-secondary p-3 rounded-xl inline-block whitespace-pre-wrap break-words">
                {item.type === 'compare'
                  ? (
                      <div className="grid gap-1">
                        <p className="font-bold flex items-center gap-1 text-blue-500">
                          <Telescope size={16} />
                          加入對比
                        </p>
                        <span className="block font-bold">
                          詢問筆數：
                          {item.compare?.length}
                        </span>
                        <span className="block font-bold">專利編號：</span>
                        <div className="grid gap-1">
                          {item.compare && item.compare.length > 0
                            && (item.compare.map((comp: { FPn: string, FPnLink: string }, i: number) => (
                              <a
                                target="_blank"
                                href={item.patentNumber ? `https://tiponet.tipo.gov.tw/gpss2/gpsskmc/gpssbkm?!!FRURL${comp.FPn}` : '#'}
                                className="text-blue-600 underline"
                                rel="noreferrer"
                                key={i}
                              >
                                {comp.FPn}
                              </a>
                            )))}
                        </div>
                      </div>
                    )
                  : (
                      item.rawContent
                    )}
              </div>
            </div>
          )
        : (
            <>

              <div className="flex gap-2">
                <div className="rounded-full bg-gray-300 w-8 h-8 flex items-center justify-center">
                  <BotIcon className="h-4 w-4" />
                </div>
                <div className="flex-1 flex-col flex gap-3">
                  <div
                    className="bg-gray-300 p-3 rounded-xl break-words relative group"
                    ref={answerRef}
                  >
                    <ReactMarkdown
                      className="prose max-w-none dark:prose-invert prose-sm grid"
                      remarkPlugins={[remarkGfm]}
                      skipHtml={false}
                      components={{
                        table: ({ node, ...props }) => (
                          <div className="overflow-x-auto my-4 border rounded-lg max-w-full" style={{ maxWidth: '100%' }}>
                            <div className="max-w-screen-lg overflow-x-auto">
                              <table className="border-collapse table-auto w-full" {...props} style={{ minWidth: '600px', tableLayout: 'auto', margin: '0' }} />
                            </div>
                          </div>
                        ),
                        th: ({ node, ...props }) => (
                          <th className="border bg-gray-100 p-2 text-left font-bold whitespace-nowrap" {...props} style={{ minWidth: '80px', verticalAlign: 'middle' }} />
                        ),
                        td: ({ node, ...props }) => (
                          <td className="border p-2" {...props} style={{ minWidth: '60px', maxWidth: '200px', wordWrap: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis' }} />
                        ),
                        a: ({ node, ...props }) => (
                          <a className="text-blue-600" {...props} />
                        ),
                        p: ({ node, ...props }) => (
                          <p className="mb-2 last:mb-0" {...props} />
                        ),
                        ul: ({ node, ...props }) => (
                          <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />
                        ),
                        ol: ({ node, ...props }) => (
                          <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />
                        ),
                        li: ({ node, ...props }) => (
                          <li className="mb-1" {...props} />
                        ),
                        h1: ({ node, ...props }) => (
                          <h1 className="text-lg font-bold mb-2 mt-4 first:mt-0" {...props} />
                        ),
                        h2: ({ node, ...props }) => (
                          <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props} />
                        ),
                        h3: ({ node, ...props }) => (
                          <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0" {...props} />
                        ),
                        h4: ({ node, ...props }) => (
                          <h4 className="text-sm font-semibold mb-1 mt-2 first:mt-0" {...props} />
                        ),
                        strong: ({ node, ...props }) => (
                          <strong className="font-bold" {...props} />
                        ),
                        em: ({ node, ...props }) => (
                          <em className="italic" {...props} />
                        ),
                        code: ({ node, ...props }) => (
                          <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-gray-300 pl-4 italic my-2" {...props} />
                        ),
                      }}
                    >
                      {item.rawContent}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </>
          )}
    </>
  )
}

export default PatentsChat
