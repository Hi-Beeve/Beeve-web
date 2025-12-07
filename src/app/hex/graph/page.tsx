"use client"

import { HexLineGraph } from "@/components/hex/hex_line_graph"
import { useGraph } from "@/api/graph/useGraph"

export default function GraphPage() {
    const { transformedData, isLoading, error } = useGraph();

    if (isLoading) {
        return (
            <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
                <div>로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
                <div>데이터를 불러오는데 실패했습니다.</div>
            </div>
        );
    }

    if (!transformedData) {
        return (
            <div className="w-full pt-10 px-5 pb-10 flex justify-center items-center">
                <div>데이터가 없습니다.</div>
            </div>
        );
    }

    return(
        <div className="w-full pt-10 px-5 pb-10 flex flex-col gap-3">
            {Object.entries(transformedData).map(([key, value]) => (
                <HexLineGraph 
                    key={key} 
                    title={key} 
                    data={value} 
                    maxValue={key==='종합등급' ? 5 : 4}
                    minValue={1}
                    stepSize={1}
                />
            ))}
        </div>
    )
}
