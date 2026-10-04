import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

describe('owner personal candidate miner governance', () => {
  const scriptPath = path.resolve('scripts/dani-owner-personal-candidate-miner.mjs');
  const workflowPath = path.resolve('.github/workflows/dani-owner-personal-candidate-miner.yml');
  const script = fs.readFileSync(scriptPath, 'utf8');
  const workflow = fs.readFileSync(workflowPath, 'utf8');

  it('is valid JavaScript', () => {
    const result = spawnSync(process.execPath, ['--check', scriptPath], { encoding: 'utf8' });
    expect(result.status).toBe(0);
  });

  it('is public-source-only and fail-closed on outreach', () => {
    expect(script).toContain('outreach_authorized:false');
    expect(script).toContain('REDDIT_PUBLIC');
    expect(script).toContain('verification_status:\'PARTIAL\'');
    expect(script).toContain('card_status:\'REVIEW_READY\'');
    expect(script).not.toContain('/api/v1/compose');
    expect(script).not.toContain('sendMessage');
  });

  it('runs on a bounded schedule without repository write permission', () => {
    expect(workflow).toContain("cron: '17 */6 * * *'");
    expect(workflow).toContain('contents: read');
    expect(workflow).not.toContain('contents: write');
    expect(workflow).not.toContain('pull-requests: write');
  });
});
