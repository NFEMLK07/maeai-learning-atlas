import {createHmac, timingSafeEqual} from 'node:crypto';
import {cookies} from 'next/headers';

export const COOKIE_NAME='maeai_admin';
const maxAge=60*60*8;
function signature(payload:string){return createHmac('sha256',process.env.SESSION_SECRET||'').update(payload).digest('hex')}
export function credentialsReady(){return !!(process.env.ADMIN_PASSWORD&&process.env.SESSION_SECRET&&process.env.GAS_WEB_APP_URL&&process.env.GAS_SHARED_SECRET)}
export function newSession(){const expires=Date.now()+maxAge*1000;const body=`${expires}`;return `${body}.${signature(body)}`}
export async function authorized(){
  if(!credentialsReady())return false;
  const token=(await cookies()).get(COOKIE_NAME)?.value||'';
  const [expires,mac,...extra]=token.split('.');
  if(extra.length||!expires||!mac||!/^\d+$/.test(expires)||Number(expires)<Date.now())return false;
  const expected=Buffer.from(signature(expires),'hex');
  const actual=Buffer.from(mac,'hex');
  return expected.length===actual.length&&timingSafeEqual(expected,actual);
}
export const sessionOptions={httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'strict' as const,path:'/',maxAge};
