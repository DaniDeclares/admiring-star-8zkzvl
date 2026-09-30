#!/usr/bin/env node
/**
 * DANI provider-neutral creative executor.
 * V1 deliberately supports self-hosted ComfyUI first; paid providers are adapters, not dependencies.
 * Reads a governed job envelope from stdin and submits only owner-reviewable draft work.
 *
 * Required env: COMFYUI_SERVER
 * Input: {"workflow":{...},"prompt_overrides":{},"content_key":"...","target_surface":"..."}
 */
const fs = require('fs');
const server = (process.env.COMFYUI_SERVER || '').replace(/\/$/, '');
if (!server) throw new Error('COMFYUI_SERVER is required');
const raw = fs.readFileSync(0,'utf8');
const job = JSON.parse(raw);
if (!job.workflow || typeof job.workflow !== 'object') throw new Error('workflow is required');
if (!job.content_key) throw new Error('content_key is required');

const workflow = structuredClone(job.workflow);
for (const [nodeId, patch] of Object.entries(job.prompt_overrides || {})) {
  if (!workflow[nodeId]?.inputs) throw new Error('Unknown workflow node '+nodeId);
  Object.assign(workflow[nodeId].inputs, patch);
}

const res = await fetch(server + '/prompt', {
  method:'POST',
  headers:{'content-type':'application/json'},
  body:JSON.stringify({prompt:workflow,extra_data:{dani:{content_key:job.content_key,target_surface:job.target_surface||'UNSPECIFIED',owner_review_required:true,auto_publish_allowed:false}}})
});
const body = await res.text();
if (!res.ok) throw new Error('ComfyUI '+res.status+': '+body.slice(0,1000));
const parsed = JSON.parse(body);
process.stdout.write(JSON.stringify({status:'QUEUED',provider:'COMFYUI_SELF_HOSTED',content_key:job.content_key,prompt_id:parsed.prompt_id||null,number:parsed.number??null,owner_review_required:true,auto_publish_allowed:false}));
