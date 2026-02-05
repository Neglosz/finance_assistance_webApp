# 🛠️ Finance Assistance WebApp - Setup Guide

คู่มือการติดตั้งและรันโปรเจกต์สำหรับนักพัฒนา

## 1. Prerequisites
- [Node.js](https://nodejs.org/) (แนะนำเวอร์ชัน 18 ขึ้นไป)
- [npm](https://www.npmjs.com/)
- บัญชี [Supabase](https://supabase.com/)

---

## 2. การเตรียม Environment Variables (.env)
เนื่องจากไฟล์ `.env` ไม่ได้ถูกเก็บไว้บน GitHub คุณต้องสร้างขึ้นมาเองในทั้ง 2 ส่วน:

### ฝั่ง Backend (`/backend/.env`)
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend` แล้วใส่ค่าดังนี้:
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3001
```

### ฝั่ง Frontend (`/frontend/.env`)
สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend` แล้วใส่ค่าดังนี้:
```env
VITE_API_URL=http://localhost:3001/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 3. การติดตั้ง Dependencies
เปิด Terminal และรันคำสั่งดังนี้:

### ติดตั้ง Backend
```bash
cd backend
npm install
```

### ติดตั้ง Frontend
```bash
cd frontend
npm install
```

---

## 4. การเตรียม Database (Supabase)
หากคุณเริ่มโปรเจกต์ใหม่ใน Supabase ให้ทำตามนี้:
1. เข้าไปที่ **SQL Editor** ในหน้า Dashboard ของ Supabase Project ของคุณ
2. คัดลอกเนื้อหาจากไฟล์ `database/schema.sql` ในโปรเจกต์นี้
3. วางลงใน SQL Editor แล้วกด **Run** เพื่อสร้าง Tables ทั้งหมด

---

## 5. วิธีการรันโปรเจกต์
คุณต้องรันทั้ง Backend และ Frontend พร้อมกัน (เปิด 2 Terminal):

### รัน Backend
```bash
cd backend
npm start
```
*Server จะรันอยู่ที่: http://localhost:3001*

### รัน Frontend
```bash
cd frontend
npm run dev
```
*แอปจะรันอยู่ที่: http://localhost:5173 (หรือตามที่ Vite แจ้ง)*

---

## 🚀 พร้อมใช้งาน!
เมื่อทั้งสองส่วนรันแล้ว คุณสามารถเริ่มจัดการการเงินผ่าน Browser ได้เลยครับ
