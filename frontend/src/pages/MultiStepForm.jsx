// frontend/src/pages/MultiStepForm.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema, step2Schema } from '../utils/validationSchema';

// ==========================================
// 🎯 1. สร้าง Context สำหรับแชร์ State ข้ามหน้า 
// ==========================================
const FormContext = createContext();

export const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [isReady, setIsReady] = useState(false);

  // 🎯 C3: Data Persistence (โหลดข้อมูลจาก LocalStorage)  
  useEffect(() => {
    const savedData = localStorage.getItem('vibecheck_registration');
    const savedStep = localStorage.getItem('vibecheck_step');
    if (savedData) setFormData(JSON.parse(savedData));
    if (savedStep) setStep(Number(savedStep));
    setIsReady(true);
  }, []);

  // บันทึกข้อมูลลง LocalStorage ทุกครั้งที่ Step หรือ Data เปลี่ยน
  useEffect(() => {
    if (isReady) {
      localStorage.setItem('vibecheck_registration', JSON.stringify(formData));
      localStorage.setItem('vibecheck_step', step.toString());
    }
  }, [formData, step, isReady]);

  const nextStep = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep((prev) => prev + 1);
  };

  const prevStep = () => setStep((prev) => prev - 1);

  if (!isReady) return <div className="p-10 text-center">Loading...</div>;

  return (
    <FormContext.Provider value={{ formData, setFormData, step, nextStep, prevStep }}>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full bg-white p-8 rounded-xl shadow-lg">
          {/* Progress Indicator */}
          <div className="mb-8 flex justify-between items-center text-sm font-medium text-gray-500">
            <span className={step >= 1 ? 'text-blue-600' : ''}>1. Account</span>
            <span>{'>'}</span>
            <span className={step >= 2 ? 'text-blue-600' : ''}>2. Profile</span>
            <span>{'>'}</span>
            <span className={step === 3 ? 'text-blue-600' : ''}>3. Confirm</span>
          </div>

          {/* Render Step ตาม State */}
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
        </div>
      </div>
    </FormContext.Provider>
  );
};

// ==========================================
// 🎯 Step 1: Account Setup 
// ==========================================
const Step1 = () => {
  const { formData, nextStep } = useContext(FormContext);
  const methods = useForm({
    resolver: zodResolver(step1Schema),
    defaultValues: formData, // C4: Auto-fill เวลาถอยกลับมา 
    mode: 'onChange',
  });

  const { register, handleSubmit, setError, clearErrors, formState: { errors, isValidating } } = methods;

  // 🎯 C1: Async Validation (เช็ค Username ซ้ำ)  125, 139-143]
  const checkUsernameDB = async (username) => {
    const forbidden = ['admin', 'root', 'superuser']; // 
    return new Promise((resolve) => setTimeout(() => {
      resolve(forbidden.includes(username.toLowerCase()));
    }, 500)); // หน่วงเวลา 0.5s 
  };

  const validateUsername = useCallback(
    async (e) => {
      const value = e.target.value;
      if (value.length >= 3) {
        clearErrors('username');
        const isTaken = await checkUsernameDB(value);
        if (isTaken) {
          setError('username', { type: 'manual', message: 'Username นี้มีคนใช้ไปแล้ว' }); // 
        }
      }
    },
    [setError, clearErrors]
  );

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(nextStep)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Account Setup</h2>
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register('email')} className="w-full border p-2 rounded" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" {...register('password')} className="w-full border p-2 rounded" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input 
            {...register('username')} 
            onBlur={validateUsername} // เช็คตอนพิมพ์เสร็จแล้วเอาเมาส์ออก
            className="w-full border p-2 rounded" 
          />
          {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isValidating || Object.keys(errors).length > 0} // 
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isValidating ? 'Checking...' : 'Next Step'}
        </button>
      </form>
    </FormProvider>
  );
};

// ==========================================
// 🎯 Step 2: Professional Profile 
// ==========================================
const Step2 = () => {
  const { formData, nextStep, prevStep } = useContext(FormContext);
  const methods = useForm({
    resolver: zodResolver(step2Schema),
    defaultValues: formData,
  });

  const { register, handleSubmit, watch, formState: { errors } } = methods;
  const occupation = watch('occupation'); // ดูค่าแบบ Real-time เพื่อทำ Conditional UI

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(nextStep)} className="space-y-4">
        <h2 className="text-2xl font-bold mb-6">Professional Profile</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Occupation</label>
          <select {...register('occupation')} className="w-full border p-2 rounded">
            <option value="">Select...</option>
            <option value="Developer">Developer</option>
            <option value="Designer">Designer</option>
            <option value="Manager">Manager</option>
          </select>
          {errors.occupation && <p className="text-red-500 text-xs mt-1">{errors.occupation.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Company (Optional)</label>
          <input {...register('company')} className="w-full border p-2 rounded" />
        </div>

        {/* 🎯 C2: แสดงฟิลด์นี้เสมอ แต่บังคับกรอกเฉพาะตอนเลือก Developer */}
        <div>
          <label className="block text-sm font-medium mb-1">
            GitHub / Portfolio URL {occupation === 'Developer' && <span className="text-red-500">*</span>}
          </label>
          <input {...register('githubUrl')} placeholder="https://" className="w-full border p-2 rounded" />
          {errors.githubUrl && <p className="text-red-500 text-xs mt-1">{errors.githubUrl.message}</p>}
        </div>

        <div className="flex gap-4">
          <button type="button" onClick={prevStep} className="w-1/2 border p-2 rounded hover:bg-gray-50">Back</button>
          <button type="submit" className="w-1/2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Next Step</button>
        </div>
      </form>
    </FormProvider>
  );
};

// ==========================================
// 🎯 Step 3: Summary & Confirm 
// ==========================================
const Step3 = () => {
  const { formData, prevStep } = useContext(FormContext);

  const handleFinalSubmit = () => {
    alert('ลงทะเบียนสำเร็จ! \n' + JSON.stringify(formData, null, 2));
    localStorage.removeItem('vibecheck_registration');
    localStorage.removeItem('vibecheck_step');
    window.location.reload(); // รีเซ็ตหน้าใหม่
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Summary & Confirm</h2>
      
      <div className="bg-gray-50 p-4 rounded mb-6 text-sm">
        {/* C4: ข้อมูล Flattened Object แสดงครบถ้วน  */}
        <pre>{JSON.stringify(formData, null, 2)}</pre> 
      </div>

      <div className="flex gap-4">
        <button onClick={prevStep} className="w-1/2 border p-2 rounded hover:bg-gray-50">Back</button>
        <button onClick={handleFinalSubmit} className="w-1/2 bg-green-600 text-white p-2 rounded hover:bg-green-700">Confirm & Submit</button>
      </div>
    </div>
  );
};

export default MultiStepForm;