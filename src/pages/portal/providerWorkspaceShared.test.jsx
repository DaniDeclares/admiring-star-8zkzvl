import React from 'react';
import {act} from 'react-dom/test-utils';
import {createRoot} from 'react-dom/client';
import {useProviderWorkspace} from './providerWorkspaceShared.jsx';
import {supabase} from '../../lib/supabaseClient.js';

jest.mock('../../lib/supabaseClient.js',()=>({
  supabase:{
    auth:{getSession:jest.fn(),signOut:jest.fn()},
    storage:{from:jest.fn()}
  }
}));
jest.mock('../../lib/posthogAnalytics.js',()=>({captureServiceLifecycle:jest.fn()}));

function Harness(){
  const state=useProviderWorkspace();
  if(state.loading)return <div>loading workspace</div>;
  if(state.error&&!state.snapshot)return <button type="button" onClick={state.load}>retry workspace</button>;
  return <div>workspace ready</div>;
}

describe('provider workspace recovery',()=>{
  let container;
  let root;
  beforeEach(()=>{
    jest.useFakeTimers();
    container=document.createElement('div');
    document.body.appendChild(container);
    root=createRoot(container);
    global.fetch=jest.fn().mockRejectedValueOnce(new Error('initial failure'));
  });
  afterEach(async()=>{
    await act(async()=>{root.unmount();});
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    container.remove();
    jest.clearAllMocks();
  });

  test('retry keeps a loading surface visible while no snapshot exists',async()=>{
    let resolveRetry;
    supabase.auth.getSession
      .mockResolvedValueOnce({data:{session:{access_token:'test-token'}},error:null})
      .mockImplementationOnce(()=>new Promise(resolve=>{resolveRetry=resolve;}));

    await act(async()=>{
      root.render(<Harness/>);
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(container.textContent).toContain('retry workspace');

    act(()=>{
      container.querySelector('button').dispatchEvent(new MouseEvent('click',{bubbles:true}));
    });
    expect(container.textContent).toContain('loading workspace');

    await act(async()=>{
      resolveRetry({data:{session:null},error:null});
      await Promise.resolve();
    });
  });
});
