# Mae Ai Learning Atlas — GitHub + Vercel + Google Sheets

เว็บไซต์แหล่งเรียนรู้อำเภอแม่อาย 75 รายการ ครอบคลุม 7 ตำบล โดยใช้ Next.js, Vercel และ Google Apps Script เป็น API เชื่อม Google Sheets

## ไฟล์สำคัญ

- `app/page.tsx` — หน้าเว็บไซต์และ Admin
- `app/globals.css` — ธีมและการเคลื่อนไหว
- `data/places.json` — ข้อมูลเริ่มต้น 75 แห่ง ใช้แสดงสำรองเมื่อยังไม่เชื่อม Sheets
- `public/images/` — ฉากแผนที่ (มีไฟล์ภาพกว้าง 3840×1600; ยังไม่ใช่ 4K UHD 3840×2160)
- `gas/Code.gs` — เว็บ API สำหรับ Google Sheets
- `gas/places-import.csv` — ไฟล์นำเข้าข้อมูล 75 แถว
- `.env.example` — ตัวอย่างการตั้งค่า (ห้ามใส่รหัสจริงใน GitHub)

## ขั้นที่ 1 — สร้าง Google Sheet

1. เปิด https://sheets.new และตั้งชื่อ `Mae Ai Learning Atlas DB`.
2. เลือก **ไฟล์ > นำเข้า > อัปโหลด** แล้วเลือก `gas/places-import.csv`.
3. เลือก **แทนที่ชีตปัจจุบัน** (เฉพาะชีตใหม่ที่ว่างอยู่) และตัวคั่น **จุลภาค (Comma)**; ตรวจว่าคอลัมน์ตรงตาม `id,name,description,tambon,category,lat,lng,address,link,image`.
4. เปลี่ยนชื่อแท็บที่นำเข้าเป็น `places` (ตัวเล็กทั้งหมด). ต้องมีแถวหัวตารางและข้อมูล 75 แถว รวม 76 แถว.
5. คัดลอก Spreadsheet ID จาก URL ช่วงระหว่าง `/d/` และ `/edit` ไว้ใช้ตั้งค่า Apps Script.

## ขั้นที่ 2 — ตั้งค่า Apps Script

1. จาก Google Sheets เปิด **ส่วนขยาย > Apps Script**.
2. ลบโค้ดเริ่มต้นใน `Code.gs` แล้ววางเนื้อหาจาก `gas/Code.gs`.
3. ไปที่ **การตั้งค่าโปรเจกต์ > คุณสมบัติสคริปต์ (Script properties)** เพิ่ม:
   - `SPREADSHEET_ID` = Spreadsheet ID จากขั้นที่ 1
   - `GAS_SHARED_SECRET` = ข้อความสุ่มยาวอย่างน้อย 32 ตัวอักษร **ไม่ใช่** รหัส Admin
4. บันทึกและรันฟังก์ชัน `setupSheet` หนึ่งครั้งเพื่อขอสิทธิ์เข้าถึงชีต.
5. กด **Deploy > New deployment > Web app** ตั้ง `Execute as: Me` และ `Who has access: Anyone` แล้ว Deploy.
6. คัดลอก URL ที่ลงท้ายด้วย `/exec` มาใช้เป็น `GAS_WEB_APP_URL`.

**สำคัญ:** Web App ตั้งค่าให้เรียกได้จากภายนอก แต่ทุกคำสั่ง API ต้องมี secret ที่เก็บไว้ฝั่ง Next.js เท่านั้น อย่านำ `GAS_SHARED_SECRET` ไปใส่ใน HTML หรือไฟล์ GitHub.

## ขั้นที่ 3 — ทดลองในเครื่อง

ใช้ Node.js 22.13 ขึ้นไป เปิด Terminal ที่โฟลเดอร์โปรเจกต์:

```bash
npm install
cp .env.example .env.local
npm run dev
```

แก้ `.env.local` ให้ตรงกับ Google Apps Script:

```dotenv
GAS_WEB_APP_URL=https://script.google.com/macros/s/xxx/exec
GAS_SHARED_SECRET=ใช้ค่าเดียวกับใน Script Properties
ADMIN_PASSWORD=ตั้งรหัสเจ้าหน้าที่ที่เดายาก
SESSION_SECRET=สุ่มข้อความอีกชุดอย่างน้อย 32 ตัวอักษร
```

เปิด http://localhost:3000 — หากไม่ใส่ตัวแปร ระบบจะแสดงข้อมูล 75 แห่งแบบอ่านอย่างเดียวจาก JSON แต่ Admin จะล็อกอินไม่ได้จนกว่าจะตั้งค่าครบ.

## ขั้นที่ 4 — นำขึ้น GitHub

1. เข้าบัญชี GitHub เดิม `NFEMLK07` แล้วเลือก **New repository** ชื่อ `maeai-learning-atlas` เลือก **Private**.
2. ที่ VS Code เปิดโฟลเดอร์โปรเจกต์นี้แล้วเปิด Terminal:

```bash
git init
git add .
git commit -m "Initial Mae Ai Learning Atlas"
git branch -M main
git remote add origin https://github.com/NFEMLK07/maeai-learning-atlas.git
git push -u origin main
```

หากมี Git repo เดิมหรือไม่ได้ใช้บัญชี `NFEMLK07` ให้ปรับคำสั่ง `remote` ตาม URL ที่ GitHub แสดงจริง ห้าม Commit `.env.local` (ไฟล์นี้อยู่ใน `.gitignore`).

## ขั้นที่ 5 — เปิดเว็บด้วย Vercel

1. ไปที่ https://vercel.com/new แล้วเชื่อม GitHub.
2. Import repository `maeai-learning-atlas`.
3. ให้ Framework Preset เป็น **Next.js**, Root Directory เป็น `./`, Build Command ค่าเริ่มต้น `next build`.
4. ก่อน Deploy เปิด **Environment Variables** ใส่ 4 ค่า: `GAS_WEB_APP_URL`, `GAS_SHARED_SECRET`, `ADMIN_PASSWORD`, `SESSION_SECRET` โดยไม่ต้องมีคำว่า `NEXT_PUBLIC_`.
5. กด **Deploy**. เมื่อผ่านจะได้ลิงก์ลักษณะ `https://maeai-learning-atlas.vercel.app` (ชื่อจริงขึ้นกับ Vercel).

## ทดสอบก่อนเปิดให้ใช้งานจริง

1. นับจำนวนแหล่งเรียนรู้ต้องเป็น 75.
2. ลองค้น `วัดแม่อายหลวง` และกรอง `ตำบลมะลิกา`.
3. คลิกรายละเอียดแล้วกด Google Maps ตรวจตำแหน่ง.
4. เข้า Admin ด้วย `ADMIN_PASSWORD`, แก้ชื่อทดสอบ แล้วตรวจว่าข้อมูลเปลี่ยนใน Sheets และหน้าเว็บหลังรีเฟรช.
5. ลองเปิด `/api/places` ต้องไม่แสดงรหัสลับ.
6. ลองแก้ไขโดยไม่ล็อกอิน ต้องถูกปฏิเสธด้วย HTTP 401.
7. ยืนยันสิทธิ์การเผยแพร่ข้อมูลชื่อบุคคลและพิกัดจากฐานข้อมูลก่อนเปิดเป็นสาธารณะ.

## หมายเหตุความปลอดภัยและการใช้งาน

- หน้าเว็บ Vercel ปกติ **เข้าถึงได้ด้วยลิงก์** แม้ GitHub repository เป็น Private; หากต้องการจำกัดผู้ชมต้องตั้งค่าระบบป้องกันการเข้าถึงเพิ่มเติม.
- Admin ใช้รหัสผ่านที่ตรวจบนเซิร์ฟเวอร์และ cookie อายุ 8 ชั่วโมง; ควรใช้รหัสยาว ไม่แชร์รหัส และเปลี่ยนหากสงสัยว่ารั่วไหล.
- สำหรับงานหลายเจ้าหน้าที่ในอนาคต ควรยกระดับเป็นระบบบัญชีผู้ใช้แยกคน พร้อมบันทึกประวัติแก้ไขและการจำกัดจำนวนครั้งที่ลองรหัสผ่าน.
- ปัจจุบันใช้ URL รูปภาพ หากจะอัปโหลดรูปโดยตรงจาก Admin ต้องเพิ่มบริการเก็บไฟล์แยกต่างหาก.
