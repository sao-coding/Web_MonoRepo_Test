// 音檔上傳-逐字稿(字)結果的型別
export interface WordsData {
  start: number;    // 開始時間 (秒)
  end: number;      // 結束時間 (秒)
  word: string;     // 字詞
  score?: number;   // 信心分數 (選填)
  speaker?: string; // 語者 (選填)
}

// 音檔上傳-逐字稿(段)結果的型別
export interface AudioData {
  start: number;      // 開始時間 (秒)
  end: number;        // 結束時間 (秒)
  speaker: string;    // 語者
  text: string;       // 原文
  translation?: string | null;  // 譯文 (選填，可能為 null)
  words?: WordsData[];   // 模型名稱 (選填)
}

// 音檔上傳-逐字稿結果的型別
export interface TranscriptionData {
  segments: AudioData[]
}

// 即時轉錄-逐字稿結果的型別
export interface TranscriptionResult {
  status: string
  source: string
  translation: string
  done: boolean
  timestamp?: string
}
