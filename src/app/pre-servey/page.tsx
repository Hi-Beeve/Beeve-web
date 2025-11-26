"use client";

import { useMember } from "@/api/mypage/useMypage";
import { CHECK_LIST, EXERCISE_PLACE, EXERCISE_PLACE_WITH_ICON } from "@/config/exercise-guides";
import checkWhite from '../../../public/check_white.svg';
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    return (
        <div>
           {step === 0 && <BodyInformation data={data} />}
           {step === 1 && <MeasurementPlace place={place} onClickPlace={onClickPlace}/>}
           {step === 2 && <CheckList />}
           <button onClick={onClickNext}>Next</button>
        </div>
    );
};

const BodyInformation = ({ data }: { data: any }) => {
    return (
        <div>
            <h1>Body Information</h1>
            <p>{data.name}</p>
            <p>{data.birthDate}</p>
            <p>{data.gender}</p>
            <p>{data.height}</p>
            <p>{data.weight}</p>
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

export default PreServeyPage;