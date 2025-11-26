"use client";

import { useMember } from "@/api/mypage/useMypage";
import { CHECK_LIST, EXERCISE_PLACE, EXERCISE_PLACE_WITH_ICON } from "@/config/exercise-guides";
import checkWhite from '../../../public/check_white.svg';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ProgressBar } from "@/components/progress_bar";
import { FONT_STYLES } from "@/styles/fontStyles";
import { InfoCard } from "@/components/info-card";

const STEPS = ["Body Information","Measurement Place","Check List"];

export const PreServeyPage = () => {
    const {data } = useMember();
    const [step, setStep] = useState<number>(0);
    const [place, setPlace] = useState <EXERCISE_PLACE | null>(null);
    const router = useRouter();
    const onClickPlace = (place: EXERCISE_PLACE) => {
        // place 저장
        setPlace(place);
    };
    const onClickNext = () => {
        if(step===STEPS.length-1){
            // 유저 데이터 및 place 데이터 로컬 스토리지에 저장 
            localStorage.setItem('preSurvey', JSON.stringify({data,place}));
            // 측정페이지로 이동 
            router.push('/measurement');
        } else {
            setStep(step+1);
        }
    };

    const stepTitle = [`${data.name}님의\n신체정보`, '어디서\n측정하시나요?',  '점검사항']

    const stepInfo = {
        step: step+1,
        total: STEPS.length,
        title: stepTitle[step]
    };

    return (
        <div className="flex flex-col w-full py-5 px-4">
            <ProgressBar stepInfo={stepInfo} />
            <PageTitle title={stepInfo.title} />
           {step === 0 && <BodyInformation data={data} />}
           {step === 1 && <MeasurementPlace place={place} onClickPlace={onClickPlace}/>}
           {step === 2 && <CheckList />}
           <button className="bg-[#BDB2DD] text-white h-14 rounded-[20px] py-2 fixed bottom-6 right-6 left-6" onClick={onClickNext}>다음</button>
        </div>
    );
};

const BodyInformation = ({ data }: { data: any }) => {
    // 나이 계산 함수
    const calculateAge = (birthDate: string) => {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    const formatGender = (gender: string) => {
        return gender === 'male' ? '남성' : '여성';
    };

    return (
        <div className="flex flex-col gap-2 mt-8">
            <p className="text-gray-600 text-sm ">기존의 입력하신 신체정보를 확인해주세요.</p>
            
            <div className="bg-[#F5F5F5] rounded-[20px] p-6 space-y-4">
                <div className="text-center pb-4 border-b border-gray-200 border-dashed">
                <InfoCard 
                    label="이름" 
                    value={data.name}
                />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <InfoCard 
                        label="성별" 
                        value={formatGender(data.gender)}
                    />
                    <InfoCard 
                        label="나이(만)" 
                        value={`${calculateAge(data.birthDate)}세`}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                    <InfoCard 
                        label="키" 
                        value={`${data.height}cm`}
                    />
                    <InfoCard 
                        label="체중" 
                        value={`${data.weight}kg`}
                    />
                </div>
            </div>
        </div>
    );
};

const MeasurementPlace = ({ place, onClickPlace }: { place: EXERCISE_PLACE | null, onClickPlace: (place: EXERCISE_PLACE) => void }) => {
    return (
        <div>
            {EXERCISE_PLACE_WITH_ICON.map((item) => (
                <div key={item.key} onClick={() => onClickPlace(item.key)} className={`${place === item.key && 'bg-[#656565]'}`}>
                    <img src={item.icon} alt={item.key} />
                    <p>{item.key}</p>
                </div>
            ))}
        </div>
    );
};

const CheckList = () => {
    const [isChecked, setIsChecked] = useState<boolean[]>(CHECK_LIST.map(() => false));
    const onClick = (index: number) => {
        setIsChecked((prev) => {
            const newChecked = [...prev];
            newChecked[index] = !newChecked[index];
            return newChecked;
        });
    };
    return (
        <div>
            {
                CHECK_LIST.map((item,index) => (
                    <CheckListCard key={item} text={item} isChecked={isChecked[index]} onClick={()=>onClick(index)} />
                ))
            }
        </div>
    );
};

const CheckListCard = ({text, isChecked, onClick}: {text: string, isChecked: boolean, onClick: () => void}) => {
    return (
        <div onClick={onClick} className={`${isChecked && 'bg-[#656565]'} rounded-[20px] flex justify-between`}>
            <div>{text}</div>
            {isChecked&&<img src={checkWhite} alt="" />}
        </div>
    );
};

const PageTitle = ({title}: {title: string}) => {
    return (
        <div className="whitespace-pre-line pt-10">
            <h1 className={FONT_STYLES.heading32}>{title}</h1>
        </div>
    );
};

export default PreServeyPage;