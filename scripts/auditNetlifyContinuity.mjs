import fs from 'node:fs'; import path from 'node:path';
const ROOT=process.cwd();
const walk=(dir)=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];}):[];
const apiFiles=walk(path.join(ROOT,'api')).filter(f=>/\.(js|mjs|cjs)$/.test(f));
const srcFiles=[...apiFiles,...walk(path.join(ROOT,'src')).filter(f=>/\.(js|jsx|ts|tsx)$/.test(f))];
const env=new Set(),vercelPatterns=[];
for(const f of srcFiles){const s=fs.readFileSync(f,'utf8');for(const m of s.matchAll(/process\.env\.([A-Z0-9_]+)/g))env.add(m[1]);if(/x-forwarded-host|x-forwarded-proto|VERCEL_|@vercel\//.test(s))vercelPatterns.push(path.relative(ROOT,f));}
const critical=['api/portal-operations.js','api/process-outbox.js','api/_portalAuth.js','api/_w9Crypto.js'];
const missing=critical.filter(f=>!fs.existsSync(path.join(ROOT,f)));
const report={generated_at:new Date().toISOString(),purpose:'DANI temporary Netlify production preflight',api_file_count:apiFiles.length,api_files:apiFiles.map(f=>path.relative(ROOT,f)).sort(),environment_keys:[...env].sort(),files_with_vercel_runtime_assumptions:[...new Set(vercelPatterns)].sort(),critical_files_missing:missing,gates:{tester_runtime_first:true,tester_supabase_project:'okvepooyxurujcwgfoju',production_supabase_project:'ajxezpczaemunlcmqlgl',production_dns_change_authorized:false,production_webhook_change_authorized:false,production_cron_change_authorized:false,production_secret_copy_authorized:false}};
fs.mkdirSync(path.join(ROOT,'artifacts'),{recursive:true});fs.writeFileSync(path.join(ROOT,'artifacts/netlify-continuity-preflight.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({api_file_count:report.api_file_count,env_key_count:report.environment_keys.length,critical_files_missing:missing},null,2));if(missing.length)process.exit(1);