import {readFileSync,writeFileSync} from 'node:fs';
const data=JSON.parse(readFileSync(new URL('../data/places.json',import.meta.url)));
const keys=['id','name','description','tambon','category','lat','lng','address','link','image'];
function safe(value){
  let v=String(value??'');
  if(/^[\s]*[=+@-]/.test(v))v="'"+v;
  return '"'+v.replaceAll('"','""')+'"';
}
const csv=[keys.map(safe).join(','),...data.map(row=>keys.map(k=>safe(row[k])).join(','))].join('\r\n');
writeFileSync(new URL('../gas/places-import.csv',import.meta.url),'\uFEFF'+csv);
console.log('Exported',data.length,'rows');
