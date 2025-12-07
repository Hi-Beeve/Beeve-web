'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMember, useUpdateProfile } from "@/api/mypage/useMypage";
import { FONT_STYLES } from '@/styles/fontStyles';
import { 
  NameInput, 
  BirthDateSelect, 
  GenderSelect, 
  PhysicalInfoInput 
} from '@/components/common/FormComponents';
import arrowLeft from '../../../../public/arrow_left.svg';
import Image from 'next/image';

const EditPage = () => {
    const router = useRouter();
    const { data } = useMember();
    
    const { updateProfile } = useUpdateProfile();
    // 폼 데이터 상태
    const [formData, setFormData] = useState({
        name: '',
        birthDate: '',
        gender: '',
        height: 0,
        weight: 0
    });

    useEffect(()=>{
        setFormData({
            name: data?.name || '',
        birthDate: data?.birthDate || '',
        gender: data?.gender === "M" ? "male" : "female" ,
        height: data?.height || 0,
        weight: data?.weight || 0
        })
    },[data])
    
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 입력 핸들러들
    const handleNameChange = (name: string) => {
        setFormData(prev => ({ ...prev, name }));
        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
    };

    const handleBirthDateChange = (birthDate: string) => {
        setFormData(prev => ({ ...prev, birthDate }));
        if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: '' }));
    };

    const handleGenderChange = (gender: string) => {
        setFormData(prev => ({ ...prev, gender }));
        if (errors.gender) setErrors(prev => ({ ...prev, gender: '' }));
    };

    const handleHeightChange = (height: number) => {
        setFormData(prev => ({ ...prev, height }));
        if (errors.height) setErrors(prev => ({ ...prev, height: '' }));
    };

    const handleWeightChange = (weight: number) => {
        setFormData(prev => ({ ...prev, weight }));
        if (errors.weight) setErrors(prev => ({ ...prev, weight: '' }));
    };

    // 유효성 검사
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요';
        }

        if (!formData.birthDate) {
            newErrors.birthDate = '생년월일을 선택해주세요';
        }

        if (!formData.gender) {
            newErrors.gender = '성별을 선택해주세요';
        }

        if (!formData.height || formData.height < 100 || formData.height > 250) {
            newErrors.height = '키를 올바르게 입력해주세요 (100-250cm)';
        }

        if (!formData.weight || formData.weight < 30 || formData.weight > 200) {
            newErrors.weight = '체중을 올바르게 입력해주세요 (30-200kg)';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 저장 핸들러
    const handleSave = () => {
        if (validateForm()) {            
            console.log('프로필 업데이트:', formData);
            updateProfile(formData);
            router.push('/mypage');
        }
    };

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-400">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* 헤더 */}
            <div className="flex flex-col gap-4 items-start p-5 pb-0">
                <button 
                    onClick={() => router.back()}
                    className=""
                >
                    <Image src={arrowLeft} alt="arrow left" width={24} height={24}/>
                </button>
                <h1 className={FONT_STYLES.heading28}>프로필 수정</h1>
                <div className="w-10" /> {/* 공간 확보용 */}
            </div>

            {/* 폼 컨텐츠 */}
            <div className="px-5 py-6 space-y-8">
                {/* 이름 */}
                <div>
                    <label className="block text-[13px] font-medium text-[#767676] mb-3">
                        이름
                    </label>
                    <NameInput
                        value={formData.name}
                        onChange={handleNameChange}
                        error={errors.name}
                    />
                </div>

                {/* 생년월일 */}
                <div>
                    <label className="block text-[13px] font-medium text-[#767676] mb-3">
                        생년월일
                    </label>
                    <BirthDateSelect
                        value={formData.birthDate}
                        onChange={handleBirthDateChange}
                        error={errors.birthDate}
                    />
                </div>

                {/* 성별 */}
                <div>
                    <label className="block text-[13px] font-medium text-[#767676] mb-3">
                        성별
                    </label>
                    <GenderSelect
                        value={formData.gender}
                        onChange={handleGenderChange}
                        error={errors.gender}
                    />
                </div>

                {/* 키 */}
                <div>
                    <label className="block text-[13px] font-medium text-[#767676] mb-3">
                        키
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.height || ''}
                            onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0)}
                            placeholder="160"
                            min="100"
                            max="250"
                            className="w-full px-4 py-4 pr-12 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#767676]">
                            cm
                        </span>
                    </div>
                    {errors.height && (
                        <div className="text-red-500 text-sm mt-2">{errors.height}</div>
                    )}
                </div>

                {/* 체중 */}
                <div>
                    <label className="block text-[13px] font-medium text-[#767676] mb-3">
                        체중
                    </label>
                    <div className="relative">
                        <input
                            type="number"
                            value={formData.weight || ''}
                            onChange={(e) => handleWeightChange(parseFloat(e.target.value) || 0)}
                            placeholder="52"
                            min="30"
                            max="200"
                            className="w-full px-4 py-4 pr-12 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#767676]">
                            kg
                        </span>
                    </div>
                    {errors.weight && (
                        <div className="text-red-500 text-sm mt-2">{errors.weight}</div>
                    )}
                </div>
            </div>

            {/* 저장 버튼 */}
            <div className="fixed bottom-4 left-5 right-5">
                <button
                    onClick={handleSave}
                    className="w-full px-4 py-4 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200"
                >
                    저장
                </button>
            </div>
        </div>
    );
};

export default EditPage;