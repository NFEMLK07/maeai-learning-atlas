import {timingSafeEqual} from 'node:crypto';
import {NextRequest,NextResponse} from 'next/server';
import {authorized,COOKIE_NAME,credentialsReady,newSession,sessionOptions} from './session';

export const runtime='nodejs';
export async function GET(){return NextResponse.json({authorized:await authorized(),configured:credentialsReady()},{headers:{'Cache-Control':'no-store'}})}
export async function POST(request:NextRequest){
  if(!credentialsReady())return NextResponse.json({error:'ยังไม่ได้ตั้งค่าการเชื่อมต่อและรหัสผ่านใน Vercel'},{status:503});
  const {password}=await request.json().catch(()=>({password:''}));
  const expected=Buffer.from(process.env.ADMIN_PASSWORD||'','utf8');
  const incoming=Buffer.from(String(password||''),'utf8');
  if(incoming.length!==expected.length||!timingSafeEqual(incoming,expected))return NextResponse.json({error:'รหัสผ่านไม่ถูกต้อง'},{status:401});
  const response=NextResponse.json({ok:true});
  response.cookies.set(COOKIE_NAME,newSession(),sessionOptions);
  return response;
}
export async function DELETE(){const response=NextResponse.json({ok:true});response.cookies.delete(COOKIE_NAME);return response}
