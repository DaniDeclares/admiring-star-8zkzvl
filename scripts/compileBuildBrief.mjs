#!/usr/bin/env node
import fs from 'node:fs';

const input=process.argv[2] || '/tmp/candidate.json';
const output=process.argv[3] || '/tmp/manifest.json';
const resultPath=process.argv[4] || '/tmp/compiler-result.json';

const rows=JSON.parse(fs.readFileSync(input,'utf8'));
const c=Array.isArray(rows)?rows[0]:rows;
let brief;
try { brief=typeof c?.proposed_build==='string'?JSON.parse(c.proposed_build):c?.proposed_build; } catch { brief=null; }

const forbidden=p=>!p || p.startsWith('/') || p.includes('..') ||
  /(^|\/)(\.env|\.github\/workflows)(\/|$)/.test(p) ||
  /(^|\/)(prisma\/schema\.prisma|supabase\/migrations)(\/|$)/.test(p);

function finish(x,code=0){
  fs.writeFileSync(resultPath,JSON.stringify(x,null,2));
  console.log(JSON.stringify(x));
  process.exit(code);
}
if(!brief || brief.kind!=='BUILD_BRIEF_V1') finish({status:'UNSUPPORTED',reason:'NOT_BUILD_BRIEF_V1'},42);
if(brief.execution_mode!=='CODE_BUILD') finish({status:'BLOCKED',reason:'NOT_CODE_BUILD'},43);

const edits=brief.bounded_edits || brief.files;
if(!Array.isArray(edits)||!edits.length){
  finish({status:'NEEDS_ENRICHMENT',reason:'MISSING_BOUNDED_EDITS',candidate_key:c.candidate_key,
    required:['bounded_edits[].path','bounded_edits[].content'],
    note:'Outcome-level briefs must be enriched with explicit bounded repository edits before autonomous compilation.'},44);
}
if(edits.some(f=>typeof f?.path!=='string'||typeof f?.content!=='string'||forbidden(f.path))){
  finish({status:'BLOCKED',reason:'UNSAFE_OR_INVALID_EDIT',candidate_key:c.candidate_key},45);
}
const manifest={
  kind:'PATCH_MANIFEST_V1',
  candidate_key:c.candidate_key,
  repository:brief.repository,
  files:edits.map(({path,content})=>({path,content})),
  acceptance_criteria:c.acceptance_criteria||brief.acceptance_criteria||null,
  compiled_from:'BUILD_BRIEF_V1',
  compiler:'dani-manifest-compiler-v1'
};
fs.writeFileSync(output,JSON.stringify(manifest,null,2));
finish({status:'COMPILED',candidate_key:c.candidate_key,file_count:manifest.files.length});
