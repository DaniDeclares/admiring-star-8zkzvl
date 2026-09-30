# DANI Creative Executor V1

Purpose: replace paid creative SaaS as a hard dependency with a governed provider-neutral execution lane.

## Authority
- Existing `dd_content_draft_queue` remains the content authority.
- Generated media is always a draft: `owner_review_required=true`, `auto_publish_allowed=false`.
- This worker does not publish, spend money, change pricing, or contact customers.
- Paid providers can be added later as optional adapters; self-hosted ComfyUI is the default.

## Default self-hosted stack
1. ComfyUI server.
2. Wan 2.2 for text/image-to-video when hardware permits.
3. Commercial-use-compatible image model selected only after model-license verification.
4. Existing DANI source assets supplied as governed inputs.

## Runtime contract
Set `COMFYUI_SERVER` to the private/self-hosted ComfyUI endpoint. Send one JSON job envelope on stdin containing:
- `content_key`
- `target_surface`
- API-format ComfyUI `workflow`
- optional `prompt_overrides` keyed by node ID.

The executor submits to ComfyUI `/prompt` and returns a receipt containing the prompt ID. It never exposes a local endpoint publicly by itself.

## Deployment gate
Do not deploy until:
- compute target/GPU capacity is identified;
- exact model weights and licenses are pinned;
- workflow JSON is pinned and smoke-tested;
- private network/auth boundary is established;
- output storage and malware/media validation are defined;
- owner-review receipt is wired back to `dd_content_draft_queue`.

Higgsfield is optional and must not be required for core DANI creative operations.
