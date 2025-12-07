import { useGraphQuery } from "./queries";
import strengthIcon from "../../../public/STRENGTH.svg"
import cardioIcon from "../../../public/CARDIO.svg"
import enduranceIcon from "../../../public/ENDURANCE.svg"
import flexibilityIcon from "../../../public/FLEXIBILITY.svg"
import agilityIcon from "../../../public/AGILITY.svg"
import quicknessIcon from "../../../public/QUICKNESS.svg"
import totalIcon from "../../../public/TotalGraph.svg"

type GradeType = {
    grade: number;
    date: string;
}

type GraphResponse = {
    totalGradeList: GradeType[];
    strengthGradeList: GradeType[];
    cardioGradeList: GradeType[];
    enduranceGradeList: GradeType[];
    flexibilityGradeList: GradeType[];
    agilityGradeList: GradeType[];
    quicknessGradeList: GradeType[];
}

type TransformedGraphData = {
    labels: string[];
    values: number[];
    icon: any;
}

type GraphDataMap = {
    [key: string]: TransformedGraphData;
}

const transformGraphData = (data: GraphResponse): GraphDataMap => {
    const transformList = (gradeList: GradeType[]) => ({
        labels: gradeList.map(item => item.date),
        values: gradeList.map(item => item.grade)
    });

    return {
        '종합등급': {
            ...transformList(data.totalGradeList),
            icon: totalIcon
        },
        '근력': {
            ...transformList(data.strengthGradeList),
            icon: strengthIcon
        },
        '심폐지구력': {
            ...transformList(data.cardioGradeList),
            icon: cardioIcon
        },
        '근지구력': {
            ...transformList(data.enduranceGradeList),
            icon: enduranceIcon
        },
        '유연성': {
            ...transformList(data.flexibilityGradeList),
            icon: flexibilityIcon
        },
        '민첩성': {
            ...transformList(data.agilityGradeList),
            icon: agilityIcon
        },
        '순발력': {
            ...transformList(data.quicknessGradeList),
            icon: quicknessIcon
        }
    };
};

export const useGraph = () => {
    const query = useGraphQuery();
    
    const transformedData = query.data ? transformGraphData(query.data.data) : null;
    
    return {
        ...query,
        transformedData
    };
}
