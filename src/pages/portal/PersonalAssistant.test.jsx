import React, {act} from 'react';
import {createRoot} from 'react-dom/client';
import PersonalAssistant from './PersonalAssistant.jsx';

let container,root;
const session={access_token:'test-session',user:{id:'owner-test'}};
const render=async props=>{await act(async()=>{root.render(<PersonalAssistant session={session} clockState="running" {...props}/>);});};
const button=text=>Array.from(container.querySelectorAll('button')).find(x=>x.textContent===text);
beforeEach(()=>{
  jest.useFakeTimers();jest.setSystemTime(new Date('2026-11-02T15:00:00Z'));
  global.IS_REACT_ACT_ENVIRONMENT=true;
  global.fetch=jest.fn().mockResolvedValue({ok:true,json:async()=>({success:true,ownerAttention:[{id:'task',reason:'Review actual decision',recommended_action:'Read the source first.'}],appointments:[]})});
  container=document.createElement('div');document.body.appendChild(container);root=createRoot(container);
});
afterEach(()=>{act(()=>root.unmount());container.remove();jest.useRealTimers();delete global.fetch;});
test('loads existing authenticated snapshot; next never marks work complete',async()=>{
  await render();
  expect(container.textContent).toContain('Review actual decision');
  expect(fetch.mock.calls[0][0]).toBe('/api/portal-operations?ownerDashboard=1');
  act(()=>button('Ready for the next item').click());
  expect(container.textContent).not.toContain('Read the source first.');
  expect(fetch).toHaveBeenCalledTimes(1);
});
test('private focus makes no business write and clears on signout',async()=>{
  await render();
  const input=container.querySelector('input');
  act(()=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,'Private study block');input.dispatchEvent(new Event('input',{bubbles:true}));});
  act(()=>container.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true})));
  expect(container.querySelector('h3').textContent).toBe('Private study block');
  expect(fetch).toHaveBeenCalledTimes(1);
  await render({session:null});
  expect(container.textContent).toBe('');
  await render();
  expect(container.textContent).not.toContain('Private study block');
});
test('focus timer pauses with work clock and break delegates to the existing clock',async()=>{
  const onBreak=jest.fn();await render({onBreak});
  act(()=>button('Focus for 10 minutes').click());
  act(()=>jest.advanceTimersByTime(60000));
  expect(container.textContent).toContain('9:00');
  act(()=>button('Take a break').click());expect(onBreak).toHaveBeenCalledTimes(1);
  await render({clockState:'paused'});
  act(()=>jest.advanceTimersByTime(60000));
  expect(container.textContent).toContain('9:00 · paused');
});
test('failed or stale data disables action suggestions',async()=>{
  fetch.mockResolvedValueOnce({ok:false,json:async()=>({success:false,error:'Unavailable'})});
  await render();expect(container.textContent).toContain('Unavailable');expect(button('Marketing').disabled).toBe(true);
  act(()=>button('Refresh my day').click());await act(async()=>{});
  expect(button('Marketing').disabled).toBe(false);
  act(()=>jest.advanceTimersByTime(301000));
  expect(button('Marketing').disabled).toBe(true);
});
test('5pm offers clock-out and does not schedule more owner work',async()=>{
  jest.setSystemTime(new Date('2026-11-02T22:00:00Z'));const onClockOut=jest.fn();await render({onClockOut});
  expect(container.textContent).toContain('Your workday is over.');
  expect(button('Marketing')).toBeUndefined();
  act(()=>button('Save my time & clock out').click());expect(onClockOut).toHaveBeenCalledTimes(1);
});
