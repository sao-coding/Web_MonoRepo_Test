'use client'

import type Handsontable from 'handsontable'
import { HotTable } from '@handsontable/react'
import { registerAllModules } from 'handsontable/registry'
import { HyperFormula } from 'hyperformula'
import { Download } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

import XLSX_CALC from 'xlsx-calc'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'

import 'handsontable/dist/handsontable.min.css'

registerAllModules()

const EDITABLE_START_ROW_INDEX = 12
const EDITABLE_END_ROW_INDEX = 41
const READ_ONLY_COLUMNS = [0]

// 新增：定義 ReadOnly 列的 A 欄關鍵字範圍
const READ_ONLY_ROW_MARKERS = {
  start: ['MSI 料號:', 'MSI Part Number:', 'Material:', 'Structure:', 'Layer:', 'Spec.:', 'No'],
  end: ['Maximum', 'Minimum', 'Average', 'Range', 'Std. Dev', 'CP', 'CPK', 'ACC/REJ'],
}

const sheetjsAarrggbbToArgb = (aarrggbb?: string): string | undefined => {
  if (!aarrggbb)
    return undefined
  const v = aarrggbb.toString().toUpperCase()
  if (v.length === 8)
    return v
  if (v.length === 6)
    return `FF${v}`
  return undefined
}

const mapAlignment = (sheetjsAlign: any): any | undefined => {
  if (!sheetjsAlign)
    return undefined
  const align: any = {}
  if (sheetjsAlign.horizontal)
    align.horizontal = sheetjsAlign.horizontal
  if (sheetjsAlign.vertical)
    align.vertical = sheetjsAlign.vertical
  if (sheetjsAlign.wrapText)
    align.wrapText = true
  return align
}

const rgbToHex = (rgb: string): string => {
  if (!rgb || rgb.length !== 8)
    return ''
  return `#${rgb.substring(2, 8)}`
}

const processParsedData = (workbook: XLSX.WorkBook, sheetName: string) => {
  const worksheet = workbook.Sheets[sheetName]
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1')
  const data: any[][] = []
  const cellStyles = new Map<string, any>()
  const cellFormulas = new Map<string, string>()
  const readOnlyRows = new Set<number>()
  const grayBackgroundRows = new Set<number>()
  const emptyRowHeights = new Map<number, number>()

  for (let R = range.s.r; R <= range.e.r; ++R) {
    const row: any[] = []
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const addr = XLSX.utils.encode_cell({ r: R, c: C })
      const cell = worksheet[addr]

      if (cell) {
        if (cell.f) {
          const formulaText = cell.f.startsWith('=') ? cell.f : `=${cell.f}`
          row.push(formulaText)
          cellFormulas.set(`${R},${C}`, formulaText)
        }
        else {
          const cellValue = cell.w ?? (cell.v !== undefined ? cell.v : '')
          row.push(cellValue)
        }
        if (cell.s)
          cellStyles.set(`${R},${C}`, cell.s)
      }
      else {
        row.push('')
      }
    }

    const colAValue = String(row[0] || '').trim()

    const isRowCompletelyEmpty = row.every((cell) => {
      const cellValue = String(cell || '').trim()
      return cellValue === ''
    })

    if (isRowCompletelyEmpty) {
      emptyRowHeights.set(R, 4.5)
    }

    const isReadOnlyRow
      = isRowCompletelyEmpty
        || READ_ONLY_ROW_MARKERS.start.some(marker => marker && colAValue.includes(marker))
        || READ_ONLY_ROW_MARKERS.end.some(marker => marker && colAValue.includes(marker))

    if (isReadOnlyRow) {
      readOnlyRows.add(R)
    }

    if (colAValue === 'No') {
      grayBackgroundRows.add(R)
    }

    data.push(row)
  }

  return {
    data,
    editableStart: EDITABLE_START_ROW_INDEX,
    editableEnd: EDITABLE_END_ROW_INDEX,
    readOnlyCols: READ_ONLY_COLUMNS,
    readOnlyRows,
    grayBackgroundRows,
    emptyRowHeights,
    cellStyles,
    cellFormulas,
    worksheet,
    workbook,
  }
}

const PatentsIdPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const jobId = params?.id as string | undefined

  const hotRef = useRef<any>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [tableData, setTableData] = useState<any[][]>([])
  const [dataRanges, setDataRanges] = useState<any | null>(null)
  // 新增：儲存最終匯出的檔案名稱 (已包含時間戳記和 .xlsx)
  const [originalFileName, setOriginalFileName] = useState<string>('')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const cellTypesMod = await import('handsontable/cellTypes')
        const registerCellType
          = (cellTypesMod && (cellTypesMod as any).registerCellType)
            || (cellTypesMod && (cellTypesMod as any).default && (cellTypesMod as any).default.registerCellType)
        const NumericCellType
          = (cellTypesMod && (cellTypesMod as any).NumericCellType)
            || (cellTypesMod && (cellTypesMod as any).default && (cellTypesMod as any).default.NumericCellType)
        if (mounted && registerCellType && NumericCellType) {
          try {
            registerCellType(NumericCellType)
          }
          catch {
            /* ignore */
          }
          return
        }
        const globalHT = (window as any).Handsontable
        if (mounted && globalHT && globalHT.cellTypes && typeof globalHT.cellTypes.registerCellType === 'function') {
          const fallbackNumeric = NumericCellType || globalHT.cellTypes?.NumericCellType
          if (fallbackNumeric) {
            try {
              globalHT.cellTypes.registerCellType(fallbackNumeric)
            }
            catch {
              /* ignore */
            }
          }
        }
      }
      catch {
        // ignore
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const adjustColWidths = useCallback(() => {
    const hot = hotRef.current?.hotInstance
    if (!hot)
      return
    const rows = hot.countRows()
    const cols = hot.countCols()

    if (rows === 0 || cols === 0)
      return

    const pxPerChar = 8
    const minWidth = 80
    const maxWidth = 700
    const widths: number[] = []
    for (let c = 0; c < cols; c++) {
      let maxLen = 0
      for (let r = 0; r < rows; r++) {
        const v = hot.getDataAtCell(r, c)
        const s = v === null || v === undefined ? '' : String(v)
        const len = [...s].reduce((acc, ch) => acc + (/[\u4E00-\u9FFF]/.test(ch) ? 1.6 : 1), 0)
        if (len > maxLen)
          maxLen = len
      }
      const w = Math.min(maxWidth, Math.max(minWidth, Math.round(maxLen * pxPerChar)))
      widths.push(w)
    }
    try {
      hot.updateSettings({ colWidths: widths })
    }
    catch {
      /* ignore */
    }
  }, [hotRef])

  const fetchExcelData = useCallback(async () => {
    if (!jobId)
      return
    setIsLoading(true)
    try {
      // 1. 執行檔案下載 API
      const downloadUrlApi = `${process.env.NEXT_PUBLIC_PATENT_SERVICE_API_URL}/api/pcb/files/download/${jobId}`
      const resFile = await fetch(downloadUrlApi)
      if (!resFile.ok)
        throw new Error(`檔案下載失敗，錯誤碼: ${resFile.status}`)

      let baseFileName = '' // 用於儲存從 Header 取得的基礎檔名

      // 2. 嚴格執行 Content-Disposition 的 UTF-8 編碼檔名解析
      const contentDisposition = resFile.headers.get('content-disposition')
      console.warn('=== content-disposition header ===')
      console.warn(contentDisposition)

      if (contentDisposition) {
        let match: RegExpMatchArray | null = null

        // 🎯 嘗試匹配 UTF-8 編碼格式: filename*=UTF-8''<encoded_filename>
        match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i)
        if (match && match[1]) {
          try {
            // 抓取 UTF-8'' 後方的內容並進行解碼
            baseFileName = decodeURIComponent(match[1])
          }
          catch {
            // 解碼失敗時使用原始編碼內容
            baseFileName = match[1]
          }
        }

        // 🚨 依使用者要求，這裡不再 fallback 到 filename="..." 或 filename=...
      }

      console.warn('baseFileName from Content-Disposition (decoded):', baseFileName)

      // 3. 處理最終的匯出檔名：移除副檔名，加上時間戳記，再加回 .xlsx
      let finalExportFileName = ''

      if (baseFileName) {
        // 移除副檔名 (例如 .xlsx, .csv 等)
        const nameWithoutExt = baseFileName.replace(/\.[^/.]+$/, '')

        // 取得當前時間戳記 (格式：MM-DD-HH-mm-ss)
        const now = new Date()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        const seconds = String(now.getSeconds()).padStart(2, '0')
        const timestamp = `${month}-${day}-${hours}-${minutes}-${seconds}`

        // 組合最終檔名
        finalExportFileName = `${nameWithoutExt}_${timestamp}.xlsx`
      }
      else {
        // 備用檔名 (如果 Content-Disposition 中沒有 filename*=UTF-8'' 或解析失敗)
        finalExportFileName = `板內阻抗量測_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`
      }

      console.warn('Final Export fileName:', finalExportFileName)

      // 儲存檔名供匯出使用
      setOriginalFileName(finalExportFileName)

      const fileArrayBuffer = await resFile.arrayBuffer()
      const workbook = XLSX.read(fileArrayBuffer, {
        type: 'array',
        cellDates: true,
        cellStyles: true,
        cellFormula: true,
        cellNF: true,
      })

      // 包裝 XLSX_CALC 執行，處理 STDEV.S
      try {
        ;(XLSX_CALC as any).set_fx('STDEV.S', (args: number[]) => {
          const n = args.length
          if (n <= 1)
            return 0
          // 過濾無效值
          const validArgs = args.filter(val => typeof val === 'number' && !Number.isNaN(val))
          if (validArgs.length <= 1)
            return 0
          const mean = validArgs.reduce((a, b) => a + b, 0) / validArgs.length
          const variance = validArgs.reduce((a, b) => a + (b - mean) ** 2, 0) / (validArgs.length - 1)
          return Math.sqrt(variance)
        })

        // 嘗試執行公式計算
        XLSX_CALC(workbook)
      }
      catch (calcError) {
        console.warn('部分公式計算有錯誤，將顯示原始值:', calcError)
      }

      const firstSheetName = workbook.SheetNames[0]
      const processed = processParsedData(workbook, firstSheetName)

      setTableData(processed.data)
      setDataRanges(processed)

      setTimeout(() => {
        adjustColWidths()
        try {
          const hot = hotRef.current?.hotInstance
          if (hot && processed.emptyRowHeights) {
            // 設定空列的列高
            processed.emptyRowHeights.forEach((height, rowIndex) => {
              hot.setRowHeight(rowIndex, height)
            })
          }
          hotRef.current?.hotInstance?.render()
        }
        catch {
          /* ignore */
        }
      }, 150)
    }
    catch (err) {
      console.error('Error fetching/parsing Excel data:', err)
      toast.error('Excel預覽資料載入失敗，請嘗試重整頁面', { position: 'top-center' })
    }
    finally {
      setIsLoading(false)
    }
  }, [jobId, setIsLoading, setTableData, setDataRanges, adjustColWidths, hotRef])

  useEffect(() => {
    fetchExcelData()
  }, [fetchExcelData])

  // 修正: 移除泛型參數 <T>
  const importWithRetry = async (loader: () => Promise<any>, attempts = 2, retryDelayMs = 300) => {
    let lastErr: any = null
    for (let i = 0; i < attempts; i++) {
      try {
        const mod = await loader()
        return mod
      }
      catch (err: any) {
        lastErr = err
        const isChunkErr = err && (err.name === 'ChunkLoadError' || /Loading chunk [0-9a-f]+ failed/i.test(err.message || ''))
        if (isChunkErr && i < attempts - 1) {
          await new Promise(res => setTimeout(res, retryDelayMs))
          continue
        }
        else {
          break
        }
      }
    }
    throw lastErr
  }

  const handleExportExcel = useCallback(async () => {
    if (!dataRanges || !hotRef.current) {
      toast.error('無可匯出的資料', { position: 'top-center' })
      return
    }

    try {
      // attempt dynamic imports with retry to mitigate transient chunk load errors
      const imported = await importWithRetry(async () => {
        const ExcelJSM = await import('exceljs')
        const fileSaver = await import('file-saver')
        return { ExcelJSM, fileSaver }
      }, 3, 400)

      const ExcelJSM = imported.ExcelJSM
      const ExcelJS = (ExcelJSM && (ExcelJSM as any).default) ? (ExcelJSM as any).default : ExcelJSM

      const fileSaverModule = imported.fileSaver
      // 修正: 避免 'o is not a function' 錯誤，正確取得 file-saver 的 default export (saveAs 函數)
      const saveAs = (fileSaverModule.default || fileSaverModule) as typeof import('file-saver').saveAs

      const hotInstance = hotRef.current.hotInstance
      const editedData: any[][] = hotInstance.getData() || tableData

      // 新增：檢查是否有資料
      if (!editedData || editedData.length === 0) {
        toast.error('無可匯出的資料', { position: 'top-center' })
        return
      }

      const wb: any = new ExcelJS.Workbook()
      wb.creator = 'Copilot Export'
      wb.created = new Date()
      wb.calcProperties = { fullCalcOnLoad: true }

      const ws = wb.addWorksheet('Sheet1')
      const originalWS = dataRanges.worksheet || null

      if (originalWS && originalWS['!cols']) {
        ws.columns = originalWS['!cols'].map((c: any) => {
          if (c && c.wch)
            return { width: c.wch }
          if (c && c.wpx)
            return { width: Math.max(1, Math.round(c.wpx / 7)) }
          return { width: undefined }
        })
      }

      const rows = editedData.length
      const cols = editedData[0]?.length || 0

      const borderStyle = {
        style: 'thin' as const,
        color: { argb: 'FF808080' },
      }

      for (let r = 0; r < rows; r++) {
        const excelRow = ws.getRow(r + 1)

        // 檢查是否為空列，設定列高為 4.5
        if (dataRanges.emptyRowHeights && dataRanges.emptyRowHeights.has(r)) {
          excelRow.height = 4.5
        }
        else if (originalWS && originalWS['!rows'] && originalWS['!rows'][r] && originalWS['!rows'][r].hpx) {
          excelRow.height = Math.round(originalWS['!rows'][r].hpx * 0.75)
        }

        // 檢查是否為灰色背景列（No 列）
        const isGrayRow = dataRanges.grayBackgroundRows && dataRanges.grayBackgroundRows.has(r)

        for (let c = 0; c < cols; c++) {
          const cellKey = `${r},${c}`
          const origStyle = dataRanges.cellStyles?.get(cellKey)
          const origFormula = dataRanges.cellFormulas?.get(cellKey)
          const hotValue = editedData[r][c]
          const cell = excelRow.getCell(c + 1)

          if (origFormula) {
            const f = typeof origFormula === 'string' ? (origFormula.startsWith('=') ? origFormula.substring(1) : origFormula) : String(origFormula)
            let result: any
            if (hotValue !== '' && hotValue !== null && hotValue !== undefined && !Number.isNaN(Number(hotValue))) {
              result = Number(hotValue)
            }
            else {
              try {
                const addr = XLSX.utils.encode_cell({ r, c })
                const origCell = originalWS ? originalWS[addr] : undefined
                if (origCell && (typeof origCell.v === 'number' || typeof origCell.v === 'string')) {
                  if (!Number.isNaN(Number(origCell.v)))
                    result = Number(origCell.v)
                }
              }
              catch {
                // ignore
              }
            }

            if (result !== undefined)
              cell.value = { formula: f, result }
            else cell.value = { formula: f }
          }
          else {
            // 🎯 修正: 確保 A 欄 (col === 0) 應為文字格式
            if (c === 0) {
              // A 欄一律視為文字，並設定 Excel 文字格式
              cell.value = String(hotValue || '')
              cell.numFmt = '@' // ExcelJS 標準文字格式
            }
            // 否則，套用原本的數字/空值判斷
            else if (hotValue === '' || hotValue === null || hotValue === undefined) {
              cell.value = null
            }
            else if (!Number.isNaN(Number(hotValue)) && hotValue !== true && hotValue !== false) {
              cell.value = Number(hotValue)
            }
            else {
              cell.value = hotValue
            }
          }

          // 優先處理灰色背景列
          if (isGrayRow) {
            try {
              cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } }
            }
            catch { /* ignore */ }
          }
          else if (origStyle) {
            try {
              if (origStyle.fgColor && origStyle.fgColor.rgb) {
                const argb = sheetjsAarrggbbToArgb(origStyle.fgColor.rgb)
                if (argb)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
              }
              else if (origStyle.fill && origStyle.fill.fgColor && origStyle.fill.fgColor.rgb) {
                const argb = sheetjsAarrggbbToArgb(origStyle.fill.fgColor.rgb)
                if (argb)
                  cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb } }
              }
            }
            catch { /* ignore */ }

            try {
              const font: any = {}
              if (origStyle.font) {
                if (origStyle.font.bold)
                  font.bold = true
                if (origStyle.font.italic)
                  font.italic = true
                if (origStyle.font.sz)
                  font.size = origStyle.font.sz
                if (origStyle.font.name)
                  font.name = origStyle.font.name
                if (origStyle.font.color && origStyle.font.color.rgb) {
                  const argb = sheetjsAarrggbbToArgb(origStyle.font.color.rgb)
                  if (argb)
                    font.color = { argb }
                }
              }
              if (Object.keys(font).length)
                cell.font = font
            }
            catch { /* ignore */ }

            try {
              const alignment = mapAlignment(origStyle.alignment)
              if (alignment)
                cell.alignment = alignment
            }
            catch { /* ignore */ }

            try {
              if (origStyle.numFmt)
                cell.numFmt = origStyle.numFmt
              else if (origStyle.z)
                cell.numFmt = origStyle.z
            }
            catch { /* ignore */ }
          }

          try {
            cell.border = {
              top: borderStyle,
              left: borderStyle,
              bottom: borderStyle,
              right: borderStyle,
            }
          }
          catch {
            // ignore
          }
        }
        excelRow.commit()
      }

      const buf = await wb.xlsx.writeBuffer()
      const blob = new Blob([buf], { type: 'application/octet-stream' })

      // 使用 fetchExcelData 已經計算好的包含時間戳記的檔名
      const exportFileName = originalFileName || `板內阻抗量測_預覽_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.xlsx`
      saveAs(blob, exportFileName)

      toast.success('匯出完成，檔案已下載', { position: 'top-center' })
    }
    catch (err: any) {
      console.error('handleExportExcel error', err)

      const isChunkErr = err && (err.name === 'ChunkLoadError' || /Loading chunk [0-9a-f]+ failed/i.test(err.message || ''))
      if (isChunkErr) {
        // 修正: 在這行禁用 no-alert 規則
        const tryReload = window.confirm( // eslint-disable-line no-alert
          '匯出所需資源載入失敗（可能為快取/部署不一致或套件未正確安裝）。按確定會重新整理頁面並重新嘗試，或取消查看解決建議。',
        )
        if (tryReload) {
          window.location.reload()
          return
        }
        else {
          toast.error('匯出失敗（ChunkLoadError）。請清除快取或重新部署後再試。', { position: 'top-center' })
          return
        }
      }

      toast.error('匯出失敗，請查看 console，或確認 exceljs 與 file-saver 已列為 dependencies 並重新部署。', { position: 'top-center' })
    }
  }, [dataRanges, tableData, hotRef, originalFileName])

  const hotSettings: Handsontable.GridSettings = useMemo(() => ({
    data: tableData,
    colHeaders: true,
    rowHeaders: true,
    allowInsertRow: false,
    allowRemoveRow: false,
    height: '100%',
    width: '100%',
    manualColumnResize: true,
    manualRowResize: true,
    contextMenu: false,
    autoRowSize: false,
    autoColumnSize: false,
    licenseKey: 'non-commercial-and-evaluation',
    formulas: {
      engine: HyperFormula.buildEmpty({ licenseKey: 'gpl-v3' }),
    },
    cells(row: number, col: number) {
      const cellProperties: any = {}
      if (dataRanges) {
        const isEditableRow = row >= dataRanges.editableStart && row <= dataRanges.editableEnd
        const isReadOnlyCol = dataRanges.readOnlyCols.includes(col)
        const isReadOnlyRowByMarker = dataRanges.readOnlyRows && dataRanges.readOnlyRows.has(row)
        const isGrayBackgroundRow = dataRanges.grayBackgroundRows && dataRanges.grayBackgroundRows.has(row)
        const isSummaryRow = dataRanges && row > dataRanges.editableEnd
        const isEditable = isEditableRow && !isReadOnlyCol && !isReadOnlyRowByMarker

        const formulaKey = `${row},${col}`
        const hasFormula = dataRanges.cellFormulas && dataRanges.cellFormulas.has(formulaKey)
        const styleKey = `${row},${col}`
        const excelStyle = dataRanges.cellStyles?.get(styleKey)

        cellProperties.readOnly = !isEditable || hasFormula

        let bgColor = ''
        if (excelStyle && excelStyle.fgColor && excelStyle.fgColor.rgb) {
          bgColor = rgbToHex(excelStyle.fgColor.rgb)
        }

        // 確保 A 欄 (col === 0) 永遠是文字格式
        if (col === 0) {
          cellProperties.type = 'text'
        }

        // 優先判斷是否為灰色背景列
        if (isGrayBackgroundRow) {
          cellProperties.className = 'cell-readonly htLeft cell-bg-gray'
        }
        else if (isEditable && !hasFormula) {
          if (bgColor)
            cellProperties.className = `cell-editable htLeft cell-bg-${bgColor.replace('#', '')}`
          else cellProperties.className = 'cell-editable htLeft cell-bg-yellow'
        }
        else {
          if (bgColor)
            cellProperties.className = `cell-readonly htLeft cell-bg-${bgColor.replace('#', '')}`
          else cellProperties.className = 'cell-readonly htLeft'
        }

        if (isSummaryRow && !isGrayBackgroundRow) {
          cellProperties.className = `${(cellProperties.className ?? 'cell-readonly')} cell-readonly-summary`
        }

        // 如果不是 A 欄 (col=0) 且可編輯，才設為 numeric
        if (col >= 1 && isEditable && !hasFormula) {
          cellProperties.type = 'numeric'
          cellProperties.numericFormat = { pattern: '0', culture: 'en-US' }
        }
      }
      return cellProperties
    },
  }), [tableData, dataRanges])

  return (
    <div className="border flex-1 flex flex-col bg-white rounded-xl h-full">
      <style jsx global>
        {`
          .handsontable .cell-editable.cell-bg-yellow,
          .handsontable td.cell-editable.cell-bg-yellow { background-color: #ffffe0 !important; }
          .handsontable .cell-readonly,
          .handsontable td.cell-readonly { background-color: #fff2cc !important; }
          .handsontable .cell-bg-gray,
          .handsontable td.cell-bg-gray { background-color: #d3d3d3 !important; }
          .handsontable td[class*="cell-bg-"] { font-family: Arial, sans-serif; }
          .handsontable td.cell-editable.current,
          .handsontable td.cell-editable.area { background-color: #fff4b3 !important; }
          .handsontable td.cell-readonly.current,
          .handsontable td.cell-readonly.area { background-color: #e5e5e5 !important; }
          .handsontable td:first-of-type.cell-readonly { background-color: white !important; }
          .handsontable td.cell-readonly-summary { background-color: #e2efda !important; color: #333333 !important; }
          .handsontable th { background-color: #f0f0f0 !important; font-weight: 600 !important; }
          .handsontable { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; }
        `}
      </style>

      <div className="p-4 justify-between flex items-center space-x-2">
        <span className="font-bold">檢視匯出</span>
        <div className="flex items-center gap-2">
          <Button variant="default" onClick={handleExportExcel} disabled={isLoading || !dataRanges}>
            <Download className="size-3" />
            {' '}
            匯出板內阻抗量測格式
          </Button>
          <Button variant="outline" onClick={() => router.push('/pcb')}>返回上傳</Button>
        </div>
      </div>

      <div className="flex-1 p-4 h-full">
        {isLoading
          ? (
              <Loading text="Loading..." size="large" />
            )
          : (
              <HotTable
                className="htBase"
                style={{ width: 'calc(100% - var(--spacing) * 2)', height: 'calc(100% - var(--spacing) * 2)' }}
                ref={hotRef}
                settings={hotSettings}
              />
            )}
      </div>
    </div>
  )
}

export default PatentsIdPage
