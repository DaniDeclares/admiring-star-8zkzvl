import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {StaticRouter} from 'react-router-dom/server';
import PortalWorkspacePage from './PortalWorkspacePage.jsx';
import {useProviderWorkspace} from './providerWorkspaceShared.jsx';
jest.mock('./providerWorkspaceShared.jsx',()=>({
 useProviderWorkspace:jest.fn(),Card:({title,children})=><section><h2>{title}</h2>{children}</section>,Empty:({children})=><p>{children}</p>,Requirement:()=>null,buildProviderRequirements:()=>[],statusLabel:x=>x,formatDate:x=>x,AccountBadge:()=>null
}));
jest.mock('./RecurringServicesCard.jsx',()=>({__esModule:true,default:()=> <section>Recurring agreements</section>}));
jest.mock('./OwnerHQPage.jsx',()=>({__esModule:true,default:()=> <section>Owner HQ</section>}));
jest.mock('./CustomerNav.jsx',()=>({__esModule:true,default:()=>null}));
jest.mock('./ProviderNav.jsx',()=>({__esModule:true,default:()=>null}));
function render(role,extra={}){useProviderWorkspace.mockReturnValue({session:{access_token:'nonfunctional_fixture'},snapshot:{role,requests:[],jobs:[],properties:[],...extra},loading:false,load:jest.fn(),act:jest.fn()});return renderToStaticMarkup(<StaticRouter><PortalWorkspacePage/></StaticRouter>)}
test('resident and commercial workspaces show the recurring controls once',()=>{expect(render('resident').split('Recurring agreements')).toHaveLength(2);expect(render('property_manager',{properties:[{id:'property_1',property_name:'Example',resident_access_enabled:true}]})).toContain('Resident Invites')});
test('provider workspaces never expose customer agreements',()=>{expect(render('provider')).not.toContain('Recurring agreements')});
