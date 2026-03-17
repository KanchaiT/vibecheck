// frontend/src/pages/DynamicFormEngine.jsx
import React, { useState, useMemo } from 'react';
import { useForm, FormProvider, useFormContext, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// ==========================================
// 🎯 ข้อมูล JSON จำลอง (สามารถแก้ตรงนี้เพื่อเทส C1 และ C2 ได้เลย) [cite: 220, 231-233, 236-238]
// ==========================================
const initialFormSchema = [
  {
    name: "username",
    label: "Username",
    type: "text",
    validation_rules: { required: true, min: 5 } // C2: ลองแก้เลข 5 เป็น 15 ดูครับ!
  },
  {
    name: "role",
    label: "Role (สิทธิ์ผู้ใช้งาน)",
    type: "select",
    options: ["guest", "admin"]
  },
  {
    name: "admin_code",
    label: "Admin Secret Code",
    type: "text",
    show_if: { field: "role", equals: "admin" }, // C3: เงื่อนไขการซ่อน/แสดง [cite: 223, 241-245]
    validation_rules: { required: true }
  },
  {
    name: "contact_info",
    label: "Contact Information",
    type: "group", // C5: การใช้ Group เพื่อทำ Nested Data [cite: 221, 249-251]
    fields: [
      {
        name: "email",
        label: "Email Address",
        type: "text",
        validation_rules: { required: true }
      }
      // C1: ลอง Un-comment ก้อนข้างล่างนี้ แล้วกด Save ดูครับ! UI จะงอกออกมาเอง
      
      , {
        name: "phoneNumber",
        label: "Phone Number",
        type: "text",
        validation_rules: { required: true, min: 10 }
      }
      
    ]
  }
];

// ==========================================
// 🎯 1. ฟังก์ชันสร้าง Zod Schema แบบ Runtime [cite: 222, 234-238]
// ==========================================
const generateZodSchema = (fields) => {
  const schemaObject = {};

  fields.forEach((field) => {
    // C5: ถ้ารูปแบบเป็น group ให้เรียกตัวเองซ้ำ (Recursive) [cite: 251]
    if (field.type === 'group' || field.type === 'section') {
      schemaObject[field.name] = generateZodSchema(field.fields);
    } else {
      let validator = z.string();
      
      // อ่านกฎจาก JSON เพื่อมาสร้าง Zod Rules
      if (field.validation_rules?.required) {
        validator = validator.min(1, { message: `กรุณากรอก ${field.label}` });
      } else {
        validator = validator.optional().or(z.literal(''));
      }

      if (field.validation_rules?.min) {
        validator = validator.min(field.validation_rules.min, { 
          message: `ต้องมีความยาวอย่างน้อย ${field.validation_rules.min} ตัวอักษร` 
        });
      }

      schemaObject[field.name] = validator;
    }
  });

  return z.object(schemaObject);
};

// ==========================================
// 🎯 2. Component อัจฉริยะ (เรียกตัวเองซ้ำได้) [cite: 215, 250-251]
// ==========================================
const DynamicField = ({ field, path = "" }) => {
  const { register, formState: { errors }, control } = useFormContext();
  
  // จัดการชื่อ Field ให้รองรับ Nested (เช่น contact_info.email)
  const fieldName = path ? `${path}.${field.name}` : field.name;

  // 🎯 C3: ตรวจสอบเงื่อนไขการซ่อน/แสดงด้วย useWatch [cite: 239-245, 253]
  const showIfValue = useWatch({ control, name: field.show_if?.field || "" });
  
  if (field.show_if && showIfValue !== field.show_if.equals) {
    return null; // ลบออกจาก DOM ทันทีเมื่อไม่ตรงเงื่อนไข [cite: 241, 243]
  }

  // C5: Recursive Call ถ้ารูปแบบเป็น group ให้ Render วนลูปตัวเอง [cite: 251]
  if (field.type === 'group' || field.type === 'section') {
    return (
      <div className="border border-gray-300 p-5 rounded-lg mb-4 bg-gray-50">
        <h3 className="font-bold text-gray-700 mb-3">{field.label}</h3>
        {field.fields.map((subField) => (
          <DynamicField key={subField.name} field={subField} path={fieldName} />
        ))}
      </div>
    );
  }

  // Helper สำหรับดึงข้อความ Error กรณีที่เป็น Nested Object (เช่น errors.contact_info.email)
  const getNestedError = (obj, pathStr) => pathStr.split('.').reduce((acc, part) => acc && acc[part], obj);
  const error = getNestedError(errors, fieldName);

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-700 mb-1">
        {field.label} {field.validation_rules?.required && <span className="text-red-500">*</span>}
      </label>

      {/* C1: ตรวจสอบ Type เพื่อสร้าง UI ที่ถูกต้อง [cite: 233] */}
      {field.type === 'select' ? (
        <select 
          {...register(fieldName)} 
          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input 
          type="text" 
          {...register(fieldName)} 
          className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 ring-red-200' : 'focus:ring-blue-500'}`}
        />
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error.message}</p>}
    </div>
  );
};

// ==========================================
// 🎯 3. คอมโพเนนต์หลัก (Form Engine)
// ==========================================
export const DynamicFormEngine = () => {
  const schemaJson = initialFormSchema;
  const [payloadResult, setPayloadResult] = useState(null);

  // 🎯 C2: สร้าง Schema ใหม่เสมอเมื่อ JSON มีการเปลี่ยนแปลง [cite: 238]
  const dynamicSchema = useMemo(() => {
    console.log("Generating New Zod Schema..."); 
    return generateZodSchema(schemaJson);
  }, [schemaJson]);

  const methods = useForm({
    resolver: zodResolver(dynamicSchema),
    shouldUnregister: true, // 🚨 ทริคไม้ตาย! C3: ทำให้เมื่อฟิลด์โดนซ่อน ค่าและเงื่อนไข Validation จะถูกตัดออกอัตโนมัติ [cite: 245]
    mode: 'onChange'
  });

  const onSubmit = (data) => {
    console.log("Submitted Payload:", data);
    setPayloadResult(data);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* กล่องแสดงผลฟอร์มที่ถูกสร้างอัตโนมัติ */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h2 className="text-2xl font-black text-gray-800 mb-6 border-b pb-4">
            Dynamic Form Engine (Schema-to-UI)
          </h2>
          
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)}>
              {schemaJson.map((field) => (
                <DynamicField key={field.name} field={field} />
              ))}
              
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-6 transition-colors">
                Submit Form
              </button>
            </form>
          </FormProvider>
        </div>

        {/* C4: Payload Output  */}
        {payloadResult && (
          <div className="bg-gray-800 p-6 rounded-xl shadow-lg text-green-400">
            <h3 className="font-bold text-white mb-2">Final Payload (C4: Hierarchy Object):</h3>
            <pre className="text-sm overflow-x-auto">{JSON.stringify(payloadResult, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicFormEngine;