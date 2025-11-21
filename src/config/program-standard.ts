// 체력 표준 타입 정의
type FitnessStandard = {
    CARDIO: number;
    STRENGTH: number | string;
    ENDURANCE: number;
    FLEXIBILITY: number;
    AGILITY?: number;
    QUICKNESS?: number;
};

type AgeGroup = "19~24" | "25~29" | "30~34" | "35~39" | "40~44" | "45~49" | "50~54" | "55~59" | "60~64";

type ProgramStandardType = {
    [grade in 1 | 2 | 3]: {
        male: Record<AgeGroup, FitnessStandard>;
        female: Record<AgeGroup, FitnessStandard>;
    };
};

const programStandard: ProgramStandardType = {
    // 1등급
    1:{
        male:{
            // 19~24	47.6	55회 이상	55	16.1	0.301	0.605
            "19~24":{
                "CARDIO": 47.6,
                "STRENGTH": 55,
                "ENDURANCE": 55,
                "FLEXIBILITY": 16.1,
                "AGILITY": 0.301,
                "QUICKNESS": 0.605,
            },
            // 25~29	44.8	54회 이상	51	14.9	0.302	0.591
            "25~29":{
                "CARDIO": 44.8,
                "STRENGTH": 54,
                "ENDURANCE": 51,
                "FLEXIBILITY": 14.9,
                "AGILITY": 0.302,
                "QUICKNESS": 0.591,
            },
            // 30~34	42.9	55회 이상	47	14.2	0.304	0.583
            "30~34":{
                "CARDIO": 42.9,
                "STRENGTH": 55,
                "ENDURANCE": 47,
                "FLEXIBILITY": 14.2,
                "AGILITY": 0.304,
                "QUICKNESS": 0.583,
            },
            // 35~39	41.8	54회 이상	45	14	0.311	0.581
            "35~39":{
                "CARDIO": 41.8,
                "STRENGTH": 54,
                "ENDURANCE": 45,
                "FLEXIBILITY": 14,
                "AGILITY": 0.311,
                "QUICKNESS": 0.581,
            },
            // 40~44	40.9	55회 이상	44	14.2	0.32	0.547
            "40~44":{
                "CARDIO": 40.9,
                "STRENGTH": 55,
                "ENDURANCE": 44,
                "FLEXIBILITY": 14.2,
                "AGILITY": 0.32,
                "QUICKNESS": 0.547,
            },
            // 45~49	40.1	54회 이상	41	13.6	0.331	0.524
            "45~49":{
                "CARDIO": 40.1,
                "STRENGTH": 54,
                "ENDURANCE": 41,
                "FLEXIBILITY": 13.6,
                "AGILITY": 0.331,
                "QUICKNESS": 0.524,
            },
            // 50~54	38.8	52회 이상	38	13.9	0.337	0.527
            "50~54":{
                "CARDIO": 38.8,
                "STRENGTH": 52,
                "ENDURANCE": 38,
                "FLEXIBILITY": 13.9,
                "AGILITY": 0.337,
                "QUICKNESS": 0.527,
            },
            // 55~59	37.7	50회 이상	35	13.3	0.348	0.508
            "55~59":{
                "CARDIO": 37.7,
                "STRENGTH": 50,
                "ENDURANCE": 35,
                "FLEXIBILITY": 13.3,
                "AGILITY": 0.348,
                "QUICKNESS": 0.508,
            },
            // 60~64	36.3	47회 이상	31	11.8	0.351	0.474
            "60~64":{
                "CARDIO": 36.3,
                "STRENGTH": 47,
                "ENDURANCE": 31,
                "FLEXIBILITY": 11.8,
                "AGILITY": 0.351,
                "QUICKNESS": 0.474,
            },
        },
        female:{
            // 19~24	36.8	21회 이상	36	19.7	0.332	0.479
            "19~24":{
                "CARDIO": 36.8,
                "STRENGTH": 21,
                "ENDURANCE": 36,
                "FLEXIBILITY": 19.7,
                "AGILITY": 0.332,
                "QUICKNESS": 0.479,
            },
            // 25~29	36	21회 이상	33	18.5	0.343	0.466
            "25~29":{
                "CARDIO": 36,
                "STRENGTH": 21,
                "ENDURANCE": 33,
                "FLEXIBILITY": 18.5,
                "AGILITY": 0.343,
                "QUICKNESS": 0.466,
            },
            // 30~34	34.8	22회 이상	31	18.2	0.347	0.464
            "30~34":{
                "CARDIO": 34.8,
                "STRENGTH": 22,
                "ENDURANCE": 31,
                "FLEXIBILITY": 18.2,
                "AGILITY": 0.347,
                "QUICKNESS": 0.464,
            },
            // 35~39	34.2	20회 이상	31	18.9	0.348	0.453
            "35~39":{
                "CARDIO": 34.2,
                "STRENGTH": 20,
                "ENDURANCE": 31,
                "FLEXIBILITY": 18.9,
                "AGILITY": 0.348,
                "QUICKNESS": 0.453,
            },
            // 40~44	33.8	20회 이상	30	18.8	0.345	0.442
            "40~44":{
                "CARDIO": 33.8,
                "STRENGTH": 20,
                "ENDURANCE": 30,
                "FLEXIBILITY": 18.8,
                "AGILITY": 0.345,
                "QUICKNESS": 0.442,
            },
            // 45~49	33	20회 이상	28	18.9	0.35	0.431
            "45~49":{
                "CARDIO": 33,
                "STRENGTH": 20,
                "ENDURANCE": 28,
                "FLEXIBILITY": 18.9,
                "AGILITY": 0.35,
                "QUICKNESS": 0.431,
            },
            // 50~54	32.3	19회 이상	24	19.5	0.354	0.407
            "50~54":{
                "CARDIO": 32.3,
                "STRENGTH": 19,
                "ENDURANCE": 24,
                "FLEXIBILITY": 19.5,
                "AGILITY": 0.354,
                "QUICKNESS": 0.407,
            },
            // 55~59	31.3	18회 이상	20	19.5	0.369	0.402
            "55~59":{
                "CARDIO": 31.3,
                "STRENGTH": 18,
                "ENDURANCE": 20,
                "FLEXIBILITY": 19.5,
                "AGILITY": 0.369,
                "QUICKNESS": 0.402,
            },
            // 60~64	30.2	17회 이상	17	19.6	0.387	0.393
            "60~64":{
                "CARDIO": 30.2,
                "STRENGTH": 17,
                "ENDURANCE": 17,
                "FLEXIBILITY": 19.6,
                "AGILITY": 0.387,
                "QUICKNESS": 0.393,
            },
        },
    },
    // 2등급
    2:{
        male:{
            // 19~24	44.8	43–54	48	11.1	0.33	0.568
            "19~24":{
                "CARDIO": 44.8,
                "STRENGTH": "43-54",
                "ENDURANCE": 48,
                "FLEXIBILITY": 11.1,
                "AGILITY": 0.33,
                "QUICKNESS": 0.568,
            },
            // 25~29	42.2	42–53	45	10.1	0.335	0.559
            "25~29":{
                "CARDIO": 42.2,
                "STRENGTH": "42-53",
                "ENDURANCE": 45,
                "FLEXIBILITY": 10.1,
                "AGILITY": 0.335,
                "QUICKNESS": 0.559,
            },
            // 30~34	40.6	43–54	41	9.4	0.337	0.548
            "30~34":{
                "CARDIO": 40.6,
                "STRENGTH": "43-54",
                "ENDURANCE": 41,
                "FLEXIBILITY": 9.4,
                "AGILITY": 0.337,
                "QUICKNESS": 0.548,
            },
            // 35~39	39.5	42–53	39	9.3	0.339	0.551
            "35~39":{
                "CARDIO": 39.5,
                "STRENGTH": "42-53",
                "ENDURANCE": 39,
                "FLEXIBILITY": 9.3,
                "AGILITY": 0.339,
                "QUICKNESS": 0.551,
            },
            // 40~44	38.8	43–54	38	9.5	0.346	0.521
            "40~44":{
                "CARDIO": 38.8,
                "STRENGTH": "43-54",
                "ENDURANCE": 38,
                "FLEXIBILITY": 9.5,
                "AGILITY": 0.346,
                "QUICKNESS": 0.521,
            },
            // 45~49	38.1	42–53	36	9.1	0.366	0.497
            "45~49":{
                "CARDIO": 38.1,
                "STRENGTH": "42-53",
                "ENDURANCE": 36,
                "FLEXIBILITY": 9.1,
                "AGILITY": 0.366,
                "QUICKNESS": 0.497,
            },
            // 50~54	36.9	40–51	32	9.3	0.371	0.486
            "50~54":{
                "CARDIO": 36.9,
                "STRENGTH": "40-51",
                "ENDURANCE": 32,
                "FLEXIBILITY": 9.3,
                "AGILITY": 0.371,
                "QUICKNESS": 0.486,
            },
            // 55~59	35.9	38–49	29	8.6	0.383	0.475
            "55~59":{
                "CARDIO": 35.9,
                "STRENGTH": "38-49",
                "ENDURANCE": 29,
                "FLEXIBILITY": 8.6,
                "AGILITY": 0.383,
                "QUICKNESS": 0.475,
            },
            // 60~64	34.8	35–46	25	7.1	0.402	0.443
            "60~64":{
                "CARDIO": 34.8,
                "STRENGTH": "35-46",
                "ENDURANCE": 25,
                "FLEXIBILITY": 7.1,
                "AGILITY": 0.402,
                "QUICKNESS": 0.443,
            },
        },
        female:{
            // 19~24	34.8	17–20	30	14.9	0.374	0.447
            "19~24":{
                "CARDIO": 34.8,
                "STRENGTH": "17-20",
                "ENDURANCE": 30,
                "FLEXIBILITY": 14.9,
                "AGILITY": 0.374,
                "QUICKNESS": 0.447,
            },
            // 25~29	34.1	17–20	27	13.8	0.383	0.442
            "25~29":{
                "CARDIO": 34.1,
                "STRENGTH": "17-20",
                "ENDURANCE": 27,
                "FLEXIBILITY": 13.8,
                "AGILITY": 0.383,
                "QUICKNESS": 0.442,
            },
            // 30~34	32.9	18–21	25	13.8	0.381	0.437
            "30~34":{
                "CARDIO": 32.9,
                "STRENGTH": "18-21",
                "ENDURANCE": 25,
                "FLEXIBILITY": 13.8,
                "AGILITY": 0.381,
                "QUICKNESS": 0.437,
            },
            // 35~39	32.3	16–20	25	14.5	0.388	0.425
            "35~39":{
                "CARDIO": 32.3,
                "STRENGTH": "16-20",
                "ENDURANCE": 25,
                "FLEXIBILITY": 14.5,
                "AGILITY": 0.388,
                "QUICKNESS": 0.425,
            },
            // 40~44	32	16–20	25	14.6	0.382	0.417
            "40~44":{
                "CARDIO": 32,
                "STRENGTH": "16-20",
                "ENDURANCE": 25,
                "FLEXIBILITY": 14.6,
                "AGILITY": 0.382,
                "QUICKNESS": 0.417,
            },
            // 45~49	31.4	15–19	22	14.8	0.392	0.404
            "45~49":{
                "CARDIO": 31.4,
                "STRENGTH": "15-19",
                "ENDURANCE": 22,
                "FLEXIBILITY": 14.8,
                "AGILITY": 0.392,
                "QUICKNESS": 0.404,
            },
            // 50~54	30.7	15–18	19	15.6	0.395	0.381
            "50~54":{
                "CARDIO": 30.7,
                "STRENGTH": "15-18",
                "ENDURANCE": 19,
                "FLEXIBILITY": 15.6,
                "AGILITY": 0.395,
                "QUICKNESS": 0.381,
            },
            // 55~59	29.8	14–18	15	15.7	0.416	0.374
            "55~59":{
                "CARDIO": 29.8,
                "STRENGTH": "14-18",
                "ENDURANCE": 15,
                "FLEXIBILITY": 15.7,
                "AGILITY": 0.416,
                "QUICKNESS": 0.374,
            },
            // 60~64	29	13–16	12	15.7	0.434	0.366
            "60~64":{
                "CARDIO": 29,
                "STRENGTH": "13-16",
                "ENDURANCE": 12,
                "FLEXIBILITY": 15.7,
                "AGILITY": 0.434,
                "QUICKNESS": 0.366,
            },
        },
    },
    // 3등급
    3:{
        male:{
            // 19~24	42	12–42	42	6.1
            "19~24":{
                "CARDIO": 42,
                "STRENGTH": "12-42",
                "ENDURANCE": 42,
                "FLEXIBILITY": 6.1,
            },
            // 25~29	39.6	11–41	38	5.3
            "25~29":{
                "CARDIO": 39.6,
                "STRENGTH": "11-41",
                "ENDURANCE": 38,
                "FLEXIBILITY": 5.3,
            },
            // 30~34	38.2	12–42	35	4.6
            "30~34":{
                "CARDIO": 38.2,
                "STRENGTH": "12-42",
                "ENDURANCE": 35,
                "FLEXIBILITY": 4.6,
            },
            // 35~39	37.2	11–41	33	4.6
            "35~39":{
                "CARDIO": 37.2,
                "STRENGTH": "11-41",
                "ENDURANCE": 33,
                "FLEXIBILITY": 4.6,
            },
            // 40~44	36.6	12–42	32	4.8
            "40~44":{
                "CARDIO": 36.6,
                "STRENGTH": "12-42",
                "ENDURANCE": 32,
                "FLEXIBILITY": 4.8,
            },
            // 45~49	36	11–41	30	4.6
            "45~49":{
                "CARDIO": 36,
                "STRENGTH": "11-41",
                "ENDURANCE": 30,
                "FLEXIBILITY": 4.6,
            },
            // 50~54	35	10–39	26	4.7
            "50~54":{
                "CARDIO": 35,
                "STRENGTH": "10-39",
                "ENDURANCE": 26,
                "FLEXIBILITY": 4.7,
            },
            // 55~59	34.1	9–37	23	3.9
            "55~59":{
                "CARDIO": 34.1,
                "STRENGTH": "9-37",
                "ENDURANCE": 23,
                "FLEXIBILITY": 3.9,
            },
            // 60~64	33.2	8–34	19	2.3
            "60~64":{
                "CARDIO": 33.2,
                "STRENGTH": "8-34",
                "ENDURANCE": 19,
                "FLEXIBILITY": 2.3,
            },
        },
        female:{
            // 19~24	32.8	4–16	23	10.1
            "19~24":{
                "CARDIO": 32.8,
                "STRENGTH": "4-16",
                "ENDURANCE": 23,
                "FLEXIBILITY": 10.1,
            },
            // 25~29	32.2	4–16	21	9.1
            "25~29":{
                "CARDIO": 32.2,
                "STRENGTH": "4-16",
                "ENDURANCE": 21,
                "FLEXIBILITY": 9.1,
            },
            // 30~34	31	4–16	19	9.4
            "30~34":{
                "CARDIO": 31,
                "STRENGTH": "4-16",
                "ENDURANCE": 19,
                "FLEXIBILITY": 9.4,
            },
            // 35~39	30.5	4–15	19	10.1
            "35~39":{
                "CARDIO": 30.5,
                "STRENGTH": "4-15",
                "ENDURANCE": 19,
                "FLEXIBILITY": 10.1,
            },
            // 40~44	30.3	4–15	19	10.4
            "40~44":{
                "CARDIO": 30.3,
                "STRENGTH": "4-15",
                "ENDURANCE": 19,
                "FLEXIBILITY": 10.4,
            },
            // 45~49	29.7	4–15	16	10.7
            "45~49":{
                "CARDIO": 29.7,
                "STRENGTH": "4-15",
                "ENDURANCE": 16,
                "FLEXIBILITY": 10.7,
            },
            // 50~54	29.1	4–14	13	11.7
            "50~54":{
                "CARDIO": 29.1,
                "STRENGTH": "4-14",
                "ENDURANCE": 13,
                "FLEXIBILITY": 11.7,
            },
            // 55~59	28.4	4–13	9	11.9
            "55~59":{
                "CARDIO": 28.4,
                "STRENGTH": "4-13",
                "ENDURANCE": 9,
                "FLEXIBILITY": 11.9,
            },
            // 60~64	27.7	3–12	7	11.8
            "60~64":{
                "CARDIO": 27.7,
                "STRENGTH": "3-12",
                "ENDURANCE": 7,
                "FLEXIBILITY": 11.8,
            },
        },
    },
}

// 타입들도 export
export type { FitnessStandard, AgeGroup, ProgramStandardType };

export default programStandard;

// 사용 예시:
// const standard = getFitnessStandardByAge(1, 'male', 25);
// console.log(standard?.CARDIO); // 44.8
// 
// const cardioValue = getFitnessValue(1, 'female', 30, 'CARDIO');
// console.log(cardioValue); // 34.8

// 1등급							

// 남	
// 19~24	47.6	55회 이상	55	16.1	0.301	0.605
// 	25~29	44.8	54회 이상	51	14.9	0.302	0.591
// 	30~34	42.9	55회 이상	47	14.2	0.304	0.583
// 	35~39	41.8	54회 이상	45	14	0.311	0.581
// 	40~44	40.9	55회 이상	44	14.2	0.32	0.547
// 	45~49	40.1	54회 이상	41	13.6	0.331	0.524
// 	50~54	38.8	52회 이상	38	13.9	0.337	0.527
// 	55~59	37.7	50회 이상	35	13.3	0.348	0.508
// 	60~64	36.3	47회 이상	31	11.8	0.351	0.474
// 여	
// 19~24	36.8	21회 이상	36	19.7	0.332	0.479
// 	25~29	36	21회 이상	33	18.5	0.343	0.466
// 	30~34	34.8	22회 이상	31	18.2	0.347	0.464
// 	35~39	34.2	20회 이상	31	18.9	0.348	0.453
// 	40~44	33.8	20회 이상	30	18.8	0.345	0.442
// 	45~49	33	20회 이상	28	18.9	0.35	0.431
// 	50~54	32.3	19회 이상	24	19.5	0.354	0.407
// 	55~59	31.3	18회 이상	20	19.5	0.369	0.402
// 	60~64	30.2	17회 이상	17	19.6	0.387	0.393
							
// 2등급							

// 남	
// 19~24	44.8	43–54	48	11.1	0.33	0.568
// 	25~29	42.2	42–53	45	10.1	0.335	0.559
// 	30~34	40.6	43–54	41	9.4	0.337	0.548
// 	35~39	39.5	42–53	39	9.3	0.339	0.551
// 	40~44	38.8	43–54	38	9.5	0.346	0.521
// 	45~49	38.1	42–53	36	9.1	0.366	0.497
// 	50~54	36.9	40–51	32	9.3	0.371	0.486
// 	55~59	35.9	38–49	29	8.6	0.383	0.475
// 	60~64	34.8	35–46	25	7.1	0.402	0.443
// 여	
// 19~24	34.8	17–20	30	14.9	0.374	0.447
// 	25~29	34.1	17–20	27	13.8	0.383	0.442
// 	30~34	32.9	18–21	25	13.8	0.381	0.437
// 	35~39	32.3	16–20	25	14.5	0.388	0.425
// 	40~44	32	16–20	25	14.6	0.382	0.417
// 	45~49	31.4	15–19	22	14.8	0.392	0.404
// 	50~54	30.7	15–18	19	15.6	0.395	0.381
// 	55~59	29.8	14–18	15	15.7	0.416	0.374
// 	60~64	29	13–16	12	15.7	0.434	0.366
							
// 3등급							

// 남	
// 19~24	42	12–42	42	6.1	
// 	25~29	39.6	11–41	38	5.3		
// 	30~34	38.2	12–42	35	4.6		
// 	35~39	37.2	11–41	33	4.6		
// 	40~44	36.6	12–42	32	4.8		
// 	45~49	36	11–41	30	4.6		
// 	50~54	35	10–39	26	4.7		
// 	55~59	34.1	9–37	23	3.9		
// 	60~64	33.2	8–34	19	2.3		
// 여	
// 19~24	32.8	4–16	23	10.1	
// 	25~29	32.2	4–16	21	9.1		
// 	30~34	31	4–16	19	9.4		
// 	35~39	30.5	4–15	19	10.1		
// 	40~44	30.3	4–15	19	10.4		
// 	45~49	29.7	4–15	16	10.7		
// 	50~54	29.1	4–14	13	11.7		
// 	55~59	28.4	4–13	9	11.9		
// 	60~64	27.7	3–12	7	11.8		