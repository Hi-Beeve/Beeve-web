import { HexLineGraph } from "@/components/hex/hex_line_graph"
import strengthIcon from "../../../../public/STRENGTH.svg"
import cardioIcon from "../../../../public/CARDIO.svg"
import enduranceIcon from "../../../../public/ENDURANCE.svg"
import flexibilityIcon from "../../../../public/FLEXIBILITY.svg"
import agilityIcon from "../../../../public/AGILITY.svg"
import quicknessIcon from "../../../../public/QUICKNESS.svg"
import totalIcon from "../../../../public/TotalGraph.svg"

export default function GraphPage() {
    return(
        <div className="w-full pt-10 px-5 flex flex-col gap-3">
            {Object.entries(MockData).map(([key, value]) => (
                <HexLineGraph key={key} title={key} data={value} />
            ))}
            </div>
    )
}

// TODO : 체력 등급 데이터 받아와서 수정
const MockData = {
    '종합등급':{
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:totalIcon
    },
    '근력' : {
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:strengthIcon
    },
    '근지구력':{
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:enduranceIcon
    },
    '심폐지구력':{
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:cardioIcon
    },
    '유연성':{
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:flexibilityIcon
    },
    '민첩성':{
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:agilityIcon
    },
    '순발력':{
        labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05', '2025-01-06', '2025-01-07'],
        values: [4, 4, 3, 4, 3, 2, 1],
        icon:quicknessIcon
    }

}