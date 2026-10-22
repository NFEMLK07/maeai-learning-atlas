import {NextRequest,NextResponse} from 'next/server';
import {authorized,credentialsReady} from '../admin/session';
import seed from '../../../data/places.json';

export const runtime='nodejs';
export const dynamic='force-dynamic';
type Place=(typeof seed)[number];

async function gas(action:string,extra:Record<string,unknown>={}){
  const response=await fetch(process.env.GAS_WEB_APP_URL!,{
    method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},
    body:JSON.stringify({secret:process.env.GAS_SHARED_SECRET,action,...extra}),
    cache:'no-store',redirect:'follow',signal:AbortSignal.timeout(18000),
  });
  if(!response.ok)throw new Error(`Google Apps Script: HTTP ${response.status}`);
  const data=await response.json();
  if(!data.ok)throw new Error(data.error||'Google Sheets ไม่ตอบรับคำขอ');
  return data;
}

export async function GET(){
  if(!credentialsReady())return NextResponse.json({places:seed,configured:false},{headers:{'Cache-Control':'no-store'}});
  try{
    const data=await gas('list');
    return NextResponse.json({places:data.places,configured:true},{headers:{'Cache-Control':'no-store'}});
  }catch{
    return NextResponse.json({places:seed,configured:true,warning:'การเชื่อม Google Sheets ขัดข้อง กำลังแสดงข้อมูลต้นฉบับ'},{headers:{'Cache-Control':'no-store'}});
  }
}
export async function POST(request:NextRequest){
  if(!await authorized())return NextResponse.json({error:'กรุณาเข้าสู่ระบบเจ้าหน้าที่'},{status:401});
  const body=await request.json().catch(()=>null) as (Partial<Place>&{removed?:boolean})|null;
  if(!body)return NextResponse.json({error:'รูปแบบข้อมูลไม่ถูกต้อง'},{status:400});
  const id=Number(body.id),lat=Number(body.lat),lng=Number(body.lng);
  if(!Number.isSafeInteger(id)||id<1||!body.name?.trim()||!['แม่อาย','มะลิกา','แม่สาว','แม่นาวาง','ท่าตอน','บ้านหลวง','สันต้นหมื้อ'].includes(body.tambon||'')||!Number.isFinite(lat)||!Number.isFinite(lng)||lat<19||lat>21||lng<98||lng>101)
    return NextResponse.json({error:'ชื่อ ตำบล หรือพิกัดไม่ถูกต้อง'},{status:400});
  const place={id,name:body.name.trim().slice(0,200),description:String(body.description||'').slice(0,20000),tambon:body.tambon,category:String(body.category||'แหล่งเรียนรู้(สถานที่)'),lat,lng,address:String(body.address||'').slice(0,1000),link:String(body.link||'').slice(0,2000),image:String(body.image||'').slice(0,2000)};
  try{
    await gas(body.removed?'delete':'upsert',{place});
    return NextResponse.json({ok:true});
  }catch(error){return NextResponse.json({error:(error as Error).message},{status:502})}
}
