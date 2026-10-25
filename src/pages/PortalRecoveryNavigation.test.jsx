import React from 'react';
import ReactDOM from 'react-dom';
import {act,Simulate} from 'react-dom/test-utils';
import {MemoryRouter} from 'react-router-dom';
import Forgot from './PortalForgotPasswordPage';
import Reset from './PortalResetPasswordPage';
import {supabase} from '../lib/supabaseClient';
jest.mock('../lib/supabaseClient',()=>({supabase:{auth:{resetPasswordForEmail:jest.fn(),getSession:jest.fn(),updateUser:jest.fn()}}}));
jest.mock('../data/siteConfig',()=>({SITE_URL:'https://danideclares.com'}));
let container;
beforeEach(()=>{container=document.createElement('div');document.body.appendChild(container);jest.clearAllMocks();supabase.auth.resetPasswordForEmail.mockResolvedValue({error:null});supabase.auth.getSession.mockResolvedValue({data:{session:null}});supabase.auth.updateUser.mockResolvedValue({error:null});});
afterEach(()=>{ReactDOM.unmountComponentAtNode(container);container.remove();});
async function show(route,q,Component){window.history.replaceState({},'',route+q);await act(async()=>{ReactDOM.render(<MemoryRouter><Component/></MemoryRouter>,container);});}
function link(label){return [...container.querySelectorAll('a')].find(x=>x.textContent===label)?.getAttribute('href');}
test.each([['provider','?role=provider','?role=provider'],['ordinary','',''],['other','?role=customer','']])('%s forgot navigation and redirect',async(_,q,suffix)=>{
 await show('/portal/forgot-password',q,Forgot);
 expect(link('Back to sign in')).toBe('/portal/login'+suffix);
 await act(async()=>{Simulate.change(container.querySelector('input[type=email]'),{target:{value:'nobody@example.test'}});});
 await act(async()=>{Simulate.submit(container.querySelector('form'),{preventDefault:()=>{}});});
 expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('nobody@example.test',{redirectTo:'https://danideclares.com/portal/reset-password'+suffix});
 expect(link('Return to sign in')).toBe('/portal/login'+suffix);
});
test.each([['provider','?role=provider','?role=provider'],['ordinary','','']])('%s expired recovery navigation',async(_,q,suffix)=>{
 await show('/portal/reset-password',q,Reset);
 expect(link('Request a new link')).toBe('/portal/forgot-password'+suffix);
});
test.each([['provider','?role=provider','?role=provider'],['ordinary','','']])('%s successful mocked update sign in navigation',async(_,q,suffix)=>{
 supabase.auth.getSession.mockResolvedValue({data:{session:{user:{id:'mock'}}}});
 await show('/portal/reset-password',q,Reset);
 const inputs=container.querySelectorAll('input[type=password]');
 await act(async()=>{Simulate.change(inputs[0],{target:{value:'TestPass1234'}});Simulate.change(inputs[1],{target:{value:'TestPass1234'}});});
 await act(async()=>{Simulate.submit(container.querySelector('form'),{preventDefault:()=>{}});});
 expect(link('Sign in')).toBe('/portal/login'+suffix);
});
