import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'แหล่งเรียนรู้อำเภอแม่อาย — Mae Ai Learning Atlas',
  description: 'สำรวจแหล่งเรียนรู้ 75 แห่ง ครอบคลุม 7 ตำบล อำเภอแม่อาย จังหวัดเชียงใหม่',
};

export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="th"><body>{children}</body></html>;
}
