import React from "react";
import { Link } from "react-router-dom";

const frontDoors = [
  ["CH01-F01","Home Cleaning & Home Reset","Cleaning, deep resets and home-ready support when your space needs a reset."],
  ["CH01-F02","Household Concierge & Errands","Practical household tasks and errands handled so your time stays yours."],
  ["CH01-F03","Pet & Plant Care","Routine pet and indoor plant support through a governed service request."],
  ["CH01-F04","Home Watch & Away Support","Documented household checks while you are away, with clear visit boundaries."],
  ["CH01-F05","Move, Guest & Seasonal Support","Extra hands for moving, hosting, travel, seasonal changes and household transitions."]
];

export default function ResidentWelcomePage() {
  return <div style={{fontFamily:"Inter,system-ui,sans-serif",background:"#fbf8f4",minHeight:"100vh",color:"#211417"}}>
    <section style={{background:"linear-gradient(145deg,#5d1325,#2a0b12)",color:"white",padding:"4.5rem 1.5rem"}}>
      <div style={{maxWidth:980,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:3,color:"#d7b980",fontWeight:800}}>DANI DECLARES • RESIDENT CONCIERGE</div>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"clamp(2.4rem,7vw,4.5rem)",margin:"10px 0 14px",lineHeight:1.04}}>Tell us what kind of help your household needs.</h1>
        <p style={{maxWidth:760,margin:"0 auto",color:"#eadde0",fontSize:18,lineHeight:1.65}}>Start with the situation you are trying to solve. We route the request into the right resident service path, confirm scope and timing, and show the applicable commercial path before work is scheduled.</p>
        <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginTop:24}}>
          <Link to="/request-service?channelType=B2C" style={{background:"#d7b980",color:"#2a0b12",padding:"14px 22px",borderRadius:7,fontWeight:800,textDecoration:"none"}}>Start a resident request</Link>
          <a href="tel:+14704857173" style={{border:"1px solid #d7b980",color:"white",padding:"14px 22px",borderRadius:7,fontWeight:700,textDecoration:"none"}}>(470) 485-7173</a>
        </div>
      </div>
    </section>
    <main style={{maxWidth:1040,margin:"0 auto",padding:"3.25rem 1.5rem 5rem"}}>
      <section style={{marginBottom:28}}>
        <div style={{fontSize:12,textTransform:"uppercase",letterSpacing:2.4,fontWeight:800,color:"#7a2637"}}>Five resident starting points</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:34,margin:"8px 0 10px"}}>One request. The right lane.</h2>
        <p style={{color:"#65565a",lineHeight:1.7,maxWidth:760}}>These are starting points, not fixed packages. The actual service is selected from the governed catalog after your request is understood.</p>
      </section>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:14}}>
        {frontDoors.map(([code,title,detail])=><article key={code} style={{background:"white",border:"1px solid #e4d9d3",borderRadius:12,padding:22}}>
          <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:2,fontWeight:800,color:"#a8791c"}}>{code}</div>
          <h3 style={{margin:"8px 0 8px",color:"#66192b"}}>{title}</h3>
          <p style={{margin:0,color:"#6b5c60",lineHeight:1.6}}>{detail}</p>
          <Link to={"/request-service?channelType=B2C&frontDoor="+encodeURIComponent(code)} style={{display:"inline-block",marginTop:16,background:"#6b1426",color:"white",padding:"10px 15px",borderRadius:7,fontWeight:800,textDecoration:"none"}}>Start here</Link>
        </article>)}
      </div>
      <section style={{marginTop:34,background:"#f2e8df",padding:22,borderRadius:10}}>
        <h3 style={{marginTop:0}}>What happens next</h3>
        <p style={{marginBottom:0,color:"#65565a",lineHeight:1.65}}>Your starting point travels with the request into intake. DANI DECLARES then confirms the service, scope, availability and applicable commercial path before fulfillment.</p>
      </section>
    </main>
  </div>;
}