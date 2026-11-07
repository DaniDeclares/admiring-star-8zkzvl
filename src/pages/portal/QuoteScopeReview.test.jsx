import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import QuoteScopeReview from './QuoteScopeReview.jsx';

test('staff view presents full saved scope, confirmed package and both holds',()=>{
 const scope={property_name:'Fixture Park Apartments',property_address:'100 Fictional Ct',unit_count:2,occupancy:'vacant',requested_window:'November 18–20',completion_deadline:'November 20',access_notes:'Leasing escort, written keys',assumptions:'Vacant units',exclusions:'No pesticides',customer_decisions_needed:'Authorization required',units:[{unit_number:'T-101',unit_type:'2BR / 2BA',maintenance_issues:'Cabinet latch'}],components:[{sku:'DNI-02A-009'},{sku:'DNI-02A-016'},{sku:'DNI-02A-029'}],source_request:{id:'fixture-request'}};
 const pkg={id:'959a1978-bd2d-4c4e-9a21-5adbb608ae07',package_code:'PKG-CH02-F01-TURN_READY',package_name:'Turnover & Make-Ready Execution',commercial_offer_status:'INTAKE_ONLY',components:[{canonical_sku:'DNI-02A-009',is_required:true},{canonical_sku:'DNI-02A-016',is_required:true},{canonical_sku:'DNI-02A-029',is_required:true}]};
 const release=new Map([['DNI-02A-009',{service_name:'Make-Ready Cleaning',release_state:'LIVE_READY',blocking_gate:'NONE'}],['DNI-02A-016',{service_name:'Punch List',release_state:'HOLD',blocking_gate:'PAYMENT_LEDGER'}],['DNI-02A-029',{service_name:'Move-In / Move-Out Photo Report',release_state:'HOLD',blocking_gate:'PAYMENT_LEDGER'}]]);
 const html=renderToStaticMarkup(<QuoteScopeReview scope={scope} captureStatus="COMPLETE" sourceRequestId="fixture-request" packageRecord={pkg} linkedPackage={true} unmetRequired={['DNI-02A-016','DNI-02A-029']} lineItems={[{id:'1',serviceSku:'DNI-02A-009'},{id:'2',serviceSku:'DNI-02A-016'},{id:'3',serviceSku:'DNI-02A-029'}]} releaseBySku={release} serviceBySku={new Map([['DNI-02A-009',{name:'Make-Ready Cleaning'}]])} statusVerified={true}/>);
 for(const term of ['Fixture Park Apartments','No pesticides','Leasing escort','Cabinet latch','PKG-CH02-F01-TURN_READY','INTAKE_ONLY','Punch List','Move-In / Move-Out Photo Report','DNI-02A-016','DNI-02A-029'])expect(html).toContain(term);
 expect(html.match(/PAYMENT_LEDGER/g).length).toBe(2);
 expect(html).toContain('capture completeness is not permission');
});
