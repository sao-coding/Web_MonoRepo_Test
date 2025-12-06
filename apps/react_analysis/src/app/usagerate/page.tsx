"use client";

import { Button } from "@msi/ui/components/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import AnalysisFilter from "./components/AnalysisFilter";
import ChartContainer from "./components/ChartContainer";

interface FilterState {
  AnalysisType: "clickrate" | "usage";
  FunctionMode: string;
  Year: number;
  Month: number;
  FilterBU: string; // BU篩選
  FilterLOB: string; // LOB篩選，支持多選，用逗號分隔
  FilterSystems: string[]; // 改為陣列類型
}

interface ChartData {
  name: string;
  value: number;
  percent: string;
  fullName: string;
}

export default function AnalysisPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    AnalysisType: "usage",
    FunctionMode: "SystemCentric",
    Year: new Date().getFullYear(),
    Month: new Date().getMonth() + 1,
    FilterBU: "ALL",
    FilterLOB: "ALL",
    FilterSystems: ["ALL"], // 改為陣列
  });

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 處理數據轉換
  const processData = (data: any[]) => {
    if (!data || data.length === 0) {
      return [];
    }

    if (filters.FunctionMode === "SystemCentric") {
      // SystemCentric: 顯示各個系統(system)的百分比分布
      const systemGroups: Record<string, { count: number }> = {};

      // 先統計數量
      data.forEach((item) => {
        const systemName = item.system || "未分類系統";
        if (!systemGroups[systemName]) {
          systemGroups[systemName] = { count: 0 };
        }
        systemGroups[systemName].count += item.count || 0;
      });

      // 計算總數
      const totalCount = Object.values(systemGroups).reduce(
        (sum, group) => sum + group.count,
        0,
      );

      // 轉換為最終格式並計算百分比
      return Object.entries(systemGroups)
        .map(([system, data]) => {
          const percentage =
            totalCount > 0 ? (data.count / totalCount) * 100 : 0;
          return {
            name: system.length > 12 ? `${system.substring(0, 12)}...` : system,
            value: data.count,
            percent: `${percentage.toFixed(2)}%`,
            fullName: system,
          };
        })
        .sort((a, b) => b.value - a.value);
    } else {
      // UnitCentric: 顯示各個部門(bu)的百分比分布
      const buGroups: Record<string, { count: number }> = {};

      // 先統計數量
      data.forEach((item) => {
        const buName = item.bu || "未分類部門";
        if (!buGroups[buName]) {
          buGroups[buName] = { count: 0 };
        }
        buGroups[buName].count += item.count || 0;
      });

      // 計算總數
      const totalCount = Object.values(buGroups).reduce(
        (sum, group) => sum + group.count,
        0,
      );

      // 轉換為最終格式並計算百分比
      return Object.entries(buGroups)
        .map(([bu, data]) => {
          const percentage =
            totalCount > 0 ? (data.count / totalCount) * 100 : 0;
          return {
            name: bu.length > 10 ? `${bu.substring(0, 10)}...` : bu,
            value: data.count,
            percent: `${percentage.toFixed(2)}%`,
            fullName: bu,
          };
        })
        .sort((a, b) => b.value - a.value);
    }
  };

  // 獲取數據
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        FunctionMode: filters.FunctionMode,
        Year: filters.Year.toString(),
        Month: filters.Month.toString(),
        FilterBU: filters.FilterBU,
        FilterLOB: filters.FilterLOB,
        FilterSystems: filters.FilterSystems.join(","), // 陣列轉為逗號分隔的字串
      });

      const baseUrl = process.env.NEXT_PUBLIC_analysis_API_URL;
      const response = await fetch(
        `${baseUrl}/api/Statistics/getusagerate?${params}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const processedData = processData(data);
      setChartData(processedData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("無法獲取數據，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters]);

  // 回到首頁
  const handleGoBack = () => {
    router.push("/");
  };

  // 處理篩選器變更
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* 頁面標題和返回按鈕 */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="size-4" />
            <span>返回首頁</span>
          </Button>
        </div>

        {/* 主要內容區域 */}
        <div className="flex gap-6">
          {/* 左邊的圖表區域 */}
          <div className="flex-1">
            <ChartContainer
              filters={filters}
              chartData={chartData}
              loading={loading}
              error={error}
            />

            {/* 詳細數據表格 - 放在圖表下面 */}
            {chartData.length > 0 && (
              <div className="mt-6 rounded-lg bg-white p-6 shadow-sm">
                <h4 className="text-md mb-3 font-semibold text-gray-800">
                  詳細數據
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="px-3 py-2 text-left">
                          {filters.FunctionMode === "SystemCentric"
                            ? "系統名稱"
                            : "部門/單位"}
                        </th>
                        <th className="px-3 py-2 text-center">數量次數</th>
                        <th className="px-3 py-2 text-center">占比</th>
                      </tr>
                    </thead>
                    <tbody>
                      {chartData.map((item, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="px-3 py-2">{item.fullName}</td>
                          <td className="px-3 py-2 text-center">
                            {item.value.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {item.percent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* 右邊的篩選器 */}
          <div className="w-80">
            <AnalysisFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
