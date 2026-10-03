import React,{useMemo} from 'react';
import {requestCatalogServices,selectRequestCatalogService} from '../lib/operations/requestServiceCatalog2026';

const priceLabel=service=>service?.publicPriceDisplay||(service?.baseCustomerPrice!=null?`Starting at $${Number(service.baseCustomerPrice).toFixed(2)}`:'Request a quote');

export default function GovernedServicePicker({services=[],channelType='',frontDoorCode='',selectedServiceId='',onSelect}){
 const eligible=useMemo(()=>requestCatalogServices(services,channelType,frontDoorCode),[services,channelType,frontDoorCode]);
 const selected=selectRequestCatalogService(eligible,selectedServiceId);
 return <div className="rounded-2xl border border-[#e3d2a8] bg-[#fffaf0] p-5">
  <label htmlFor="governed-service-picker" className="block text-sm font-black text-[#5b1624] mb-2">Choose a specific service <span className="font-normal text-[#806d72]">(optional)</span></label>
  <select id="governed-service-picker" value={selected?.serviceId||''} onChange={event=>onSelect?.(selectRequestCatalogService(eligible,event.target.value))} className="w-full rounded-xl border border-[#dfcfaa] px-4 py-3.5 bg-white">
   <option value="">Tell us the situation instead</option>
   {eligible.map(service=><option key={service.serviceId} value={service.serviceId}>{service.name} — {channelType==='B2G'?'Solicitation / quote':priceLabel(service)}</option>)}
  </select>
  <p className="mt-2 text-xs text-[#806d72]">Only services released through DANI DECLARES’ governed catalog for this customer type appear here. You can leave this blank and submit a general request.</p>
 </div>;
}
