'use client';

import { useState } from 'react';
import { FONT_STYLES } from '@/styles/fontStyles';
import Picker from "react-mobile-picker";
import BottomSheet from '@/components/bottom-sheet';
import { sendPhoneCode, verifyPhoneCode } from '@/api/auth/auth.api';

// 성별 선택 컴포넌트
interface GenderSelectProps {
  value: string;
  onChange: (gender: string) => void;
  error?: string;
}

export const GenderSelect = ({ value, onChange, error }: GenderSelectProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {['male', 'female'].map((gender) => (
          <button
            key={gender}
            type="button"
            onClick={() => onChange(gender)}
            className={`px-3 h-14 rounded-[20px] transition-all duration-200 ${
              value === gender
                ? 'bg-black text-white'
                : 'bg-[#F5F5F5] text-[#767676] hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className="font-medium">{gender === 'male' ? '남성' : '여성'}</div>
            </div>
          </button>
        ))}
      </div>
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

// 생년월일 선택 컴포넌트
interface BirthDateSelectProps {
  value: string;
  onChange: (date: string) => void;
  error?: string;
}

export const BirthDateSelect = ({ value, onChange, error }: BirthDateSelectProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState({
    year: value ? value.split('-')[0] : '2000',
    month: value ? value.split('-')[1] : '01',
    day: value ? value.split('-')[2] : '01'
  });

  // 연도 옵션 생성 (19세~100세)
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 100;
  const maxYear = currentYear - 19;
  
  const yearOptions = Array.from({ length: maxYear - minYear + 1 }, (_, i) => 
    (maxYear - i).toString()
  );
  
  const monthOptions = Array.from({ length: 12 }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );
  
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };
  
  const dayOptions = Array.from({ length: getDaysInMonth(parseInt(pickerValue.year), parseInt(pickerValue.month)) }, (_, i) => 
    (i + 1).toString().padStart(2, '0')
  );

  const formatDisplayDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${year}.${month}.${day}`;
  };

  const handleDateConfirm = () => {
    const selectedDate = `${pickerValue.year}-${pickerValue.month}-${pickerValue.day}`;
    onChange(selectedDate);
    setIsDatePickerOpen(false);
  };

  const handlePickerChange = (value: { year: string; month: string; day: string; }, key: string) => {
    const newPickerValue = { ...value };
    
    // 월이 변경되면 일자 조정
    if (key === 'month' || key === 'year') {
      const maxDays = getDaysInMonth(parseInt(newPickerValue.year), parseInt(newPickerValue.month));
      if (parseInt(newPickerValue.day) > maxDays) {
        newPickerValue.day = maxDays.toString().padStart(2, '0');
      }
    }
    
    setPickerValue(newPickerValue);
  };

  return (
    <div className="space-y-6">
      <div
        onClick={() => setIsDatePickerOpen(true)}
        className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] cursor-pointer flex items-center justify-between"
      >
        <span>
          {value ? formatDisplayDate(value) : '연.월.일'}
        </span>
        <svg className="w-5 h-5 text-[#767676]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}

      {/* 날짜 선택 Bottom Sheet */}
      <BottomSheet
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
      >
        <div className="p-4">
          <h3 className={`text-center mb-6 ${FONT_STYLES.heading3}`}>생년월일 선택</h3>
          
          <div className="mb-6">
            <Picker
              value={pickerValue}
              onChange={handlePickerChange}
              wheelMode="normal"
            >
              <Picker.Column name="year">
                {yearOptions.map(year => (
                  <Picker.Item key={year} value={year}>
                    {year}년
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="month">
                {monthOptions.map(month => (
                  <Picker.Item key={month} value={month}>
                    {month}월
                  </Picker.Item>
                ))}
              </Picker.Column>
              <Picker.Column name="day">
                {dayOptions.map(day => (
                  <Picker.Item key={day} value={day}>
                    {day}일
                  </Picker.Item>
                ))}
              </Picker.Column>
            </Picker>
          </div>
          
          <button
            onClick={handleDateConfirm}
            className="w-full px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200"
          >
            확인
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};

// 키/체중 입력 컴포넌트
interface PhysicalInfoInputProps {
  height: number;
  weight: number;
  onHeightChange: (height: number) => void;
  onWeightChange: (weight: number) => void;
  errors?: {
    height?: string;
    weight?: string;
  };
}

export const PhysicalInfoInput = ({ 
  height, 
  weight, 
  onHeightChange, 
  onWeightChange, 
  errors 
}: PhysicalInfoInputProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5">
        <div>
          <label className="block text-[13px] font-medium text-[#767676] mb-2">
            키 (cm)
          </label>
          <input
            type="number"
            value={height || ''}
            onChange={(e) => onHeightChange(parseFloat(e.target.value) || 0)}
            placeholder=""
            min="100"
            max="250"
            className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
            required
          />
          {errors?.height && (
            <div className="text-red-500 text-sm mt-2">{errors.height}</div>
          )}
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#767676] mb-2">
            체중 (kg)
          </label>
          <input
            type="number"
            value={weight || ''}
            onChange={(e) => onWeightChange(parseFloat(e.target.value) || 0)}
            placeholder=""
            min="30"
            max="200"
            className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
            required
          />
          {errors?.weight && (
            <div className="text-red-500 text-sm mt-2">{errors.weight}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// 이름 입력 컴포넌트
interface NameInputProps {
  value: string;
  onChange: (name: string) => void;
  error?: string;
}

export const NameInput = ({ value, onChange, error }: NameInputProps) => {
  return (
    <div className="space-y-2">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="정승은"
        className="w-full px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
        required
      />
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

// 휴대폰 인증 컴포넌트
interface PhoneVerificationInputProps {
  phoneNumber: string;
  onPhoneNumberChange: (phoneNumber: string) => void;
  onVerified: (verified: boolean, verificationToken?: string) => void;
  error?: string;
}

export const PhoneVerificationInput = ({
  phoneNumber,
  onPhoneNumberChange,
  onVerified,
  error,
}: PhoneVerificationInputProps) => {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState('');

  const handlePhoneNumberChange = (value: string) => {
    const numbersOnly = value.replace(/[^0-9]/g, '').slice(0, 11);
    onPhoneNumberChange(numbersOnly);
  };

  const handleSendCode = async () => {
    if (phoneNumber.length !== 11) {
      setMessage('휴대폰 번호 11자리를 입력해주세요.');
      return;
    }
    setSending(true);
    setMessage('');
    try {
      await sendPhoneCode(phoneNumber);
      setCodeSent(true);
      setMessage('인증번호가 발송되었습니다.');
    } catch {
      setMessage('인증번호 발송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setMessage('인증번호 6자리를 입력해주세요.');
      return;
    }
    setVerifying(true);
    setMessage('');
    try {
      const response = await verifyPhoneCode(phoneNumber, code);
      const token = response.data?.verificationToken;
      setVerified(true);
      onVerified(true, token);
      setMessage('인증이 완료되었습니다.');
    } catch {
      setMessage('인증번호가 올바르지 않습니다. 다시 확인해주세요.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 휴대폰 번호 입력 */}
      <div className="flex gap-3">
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => handlePhoneNumberChange(e.target.value)}
          placeholder="01012345678"
          disabled={verified}
          className="flex-1 px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleSendCode}
          disabled={phoneNumber.length !== 11 || sending || verified}
          className="px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {sending ? '발송 중...' : codeSent ? '재발송' : '인증번호 발송'}
        </button>
      </div>

      {/* 인증번호 입력 */}
      {codeSent && !verified && (
        <div className="flex gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="인증번호 6자리"
            className="flex-1 px-4 py-4 text-lg bg-[#F5F5F5] rounded-[20px] text-[#767676] placeholder-[#767676] focus:outline-none focus:ring-2 focus:ring-[#BDB2DD] focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleVerifyCode}
            disabled={code.length !== 6 || verifying}
            className="px-4 py-3 bg-[#BDB2DD] text-white font-medium rounded-[20px] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {verifying ? '확인 중...' : '확인'}
          </button>
        </div>
      )}

      {/* 인증 완료 표시 */}
      {verified && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-[20px]">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-green-600 font-medium">인증 완료</span>
        </div>
      )}

      {/* 메시지 */}
      {message && !verified && (
        <div className={`text-sm px-1 ${message.includes('실패') || message.includes('올바르지') || message.includes('입력') ? 'text-red-500' : 'text-[#767676]'}`}>
          {message}
        </div>
      )}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
    </div>
  );
};
