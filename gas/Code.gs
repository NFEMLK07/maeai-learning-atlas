/** Mae Ai Learning Atlas — Google Sheets backend.
 * Script Properties required: SPREADSHEET_ID and GAS_SHARED_SECRET.
 * Deploy as Web app: Execute as Me; Access: Anyone (API secret is mandatory).
 * Only the Next.js server calls this endpoint; browsers never receive the secret.
 */
const HEADERS=['id','name','description','tambon','category','lat','lng','address','link','image'];
const TAB='places';

function sheet_(){
  const id=PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if(!id)throw Error('Missing SPREADSHEET_ID in Script Properties');
  const doc=SpreadsheetApp.openById(id);
  return doc.getSheetByName(TAB)||doc.insertSheet(TAB);
}
function setupSheet(){
  const sh=sheet_();
  if(sh.getLastRow()===0)sh.appendRow(HEADERS);
  sh.setFrozenRows(1);
  sh.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#dbece2');
}
function output_(object){return ContentService.createTextOutput(JSON.stringify(object)).setMimeType(ContentService.MimeType.JSON)}
function list_(){
  const values=sheet_().getDataRange().getValues();
  return values.slice(1).filter(row=>row[0]!==''&&row[0]!==null).map(row=>{
    const p={};HEADERS.forEach((key,i)=>p[key]=row[i]===null?'':row[i]);
    p.id=Number(p.id);p.lat=Number(p.lat);p.lng=Number(p.lng);
    return p;
  }).sort((a,b)=>a.id-b.id);
}
function doPost(e){
  try{
    const json=JSON.parse(e.postData.contents||'{}');
    const expected=PropertiesService.getScriptProperties().getProperty('GAS_SHARED_SECRET');
    if(!expected||json.secret!==expected)return output_({ok:false,error:'Not authorized'});
    if(json.action==='list')return output_({ok:true,places:list_()});
    if(!['upsert','delete'].includes(json.action))return output_({ok:false,error:'Invalid action'});
    const p=json.place||{};
    const id=Number(p.id);
    if(!Number.isSafeInteger(id)||id<1||!String(p.name||'').trim())return output_({ok:false,error:'Invalid place'});
    const lat=Number(p.lat),lng=Number(p.lng);
    if(json.action==='upsert'&&(!Number.isFinite(lat)||!Number.isFinite(lng)||lat<19||lat>21||lng<98||lng>101))return output_({ok:false,error:'Invalid coordinates'});
    const lock=LockService.getScriptLock();lock.waitLock(15000);
    try{
      const sh=sheet_();
      const ids=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,1).getValues().map(r=>Number(r[0])):[];
      const index=ids.indexOf(id);const row=index<0?-1:index+2;
      if(json.action==='delete'){
        if(row>0)sh.deleteRow(row);
        return output_({ok:true});
      }
      const vals=HEADERS.map(key=>key==='lat'?lat:key==='lng'?lng:key==='id'?id:String(p[key]??''));
      if(row>0)sh.getRange(row,1,1,HEADERS.length).setValues([vals]);
      else sh.appendRow(vals);
      return output_({ok:true});
    }finally{lock.releaseLock()}
  }catch(err){return output_({ok:false,error:String(err.message||err)})}
}
