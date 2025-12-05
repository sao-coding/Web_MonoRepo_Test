/**
 * 取得分頁顯示的頁碼陣列
 * @param totalPages 總頁數
 * @param currentPage 當前頁碼
 * @param maxVisible 最多顯示幾個頁碼（預設5）
 * @returns number[]
 */
export function getPaginationRange(
  totalPages: number,
  currentPage: number,
  maxVisible: number = 5,
): number[] {
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const half = Math.floor(maxVisible / 2)
  let start = currentPage - half
  let end = currentPage + half
  if (start < 1) {
    start = 1
    end = maxVisible
  }
  else if (end > totalPages) {
    end = totalPages
    start = totalPages - maxVisible + 1
  }
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * 判斷是否顯示前後省略號
 * @param totalPages 總頁數
 * @param currentPage 當前頁碼
 * @param maxVisible 最多顯示幾個頁碼（預設5）
 */
export function shouldShowEllipsis(
  totalPages: number,
  currentPage: number,
  maxVisible: number = 5,
): { showStartEllipsis: boolean, showEndEllipsis: boolean } {
  if (totalPages <= maxVisible) {
    return { showStartEllipsis: false, showEndEllipsis: false }
  }
  const half = Math.floor(maxVisible / 2)
  let start = currentPage - half
  let end = currentPage + half
  if (start < 1) {
    start = 1
    end = maxVisible
  }
  else if (end > totalPages) {
    end = totalPages
    start = totalPages - maxVisible + 1
  }
  return {
    showStartEllipsis: start > 1,
    showEndEllipsis: end < totalPages,
  }
}
