import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('password sign-in resolves session and routes without depending solely on an auth event',()=>{
 const code=read('src/pages/PortalLoginPage.jsx');
 assert.match(code,/signInWithPassword/);
 assert.match(code,/data\?\.session/);
 assert.match(code,/if\(routeRef\.current\)await routeRef\.current\(data\.session\)/);
 assert.match(code,/window\.setTimeout\(\(\)=>\{/);
 assert.match(code,/routingPromise/);
});
test('owner sign in does not depend on completing provider onboarding fallback',()=>{
 const code=read('src/pages/PortalLoginPage.jsx');
 assert.match(code,/isKnownOwnerEmail/);
 assert.match(code,/if\(!isKnownStaff&&!isKnownOwnerEmail\)/);
 assert.match(code,/boundedAuth\(resolvePortalDestination/);
 assert.match(code,/detachStagedOnboarding\(onboardingOperation\)/);
 const onboarding=read('src/lib/pendingOnboarding.js');
 assert.match(onboarding,/export function completeStagedOnboarding/);
 assert.doesNotMatch(onboarding,/export async function completeStagedOnboarding/);
 assert.match(onboarding,/inFlightCompletion === trackedOperation/);
});
test('sign-out is current device scoped and makes errors visible to owner',()=>{
 const nav=read('src/components/Navbar.jsx');
 const portal=read('src/pages/portal/providerWorkspaceShared.jsx');
 for(const s of [nav,portal]){
  assert.match(s,/signOut\(\{scope:'local'\}\)/);
  assert.match(s,/Sign-out timed out/);
  assert.match(s,/role="alert"/);
 }
});
test('portal loading is bounded and recovery links are accessible',()=>{
 const workspace=read('src/pages/portal/providerWorkspaceShared.jsx');
 const page=read('src/pages/portal/PortalWorkspacePage.jsx');
 assert.match(workspace,/Authentication check timed out/);
 assert.match(workspace,/snapshotRef/);
 assert.match(workspace,/if \(!snapshotRef\.current\) setLoading\(true\)/);
 assert.match(workspace,/signOutOperation\.then/);
 assert.match(workspace,/redirectAfterSignOut/);
 assert.match(page,/Retry workspace/);
 assert.match(page,/Open Owner HQ directly/);
});
