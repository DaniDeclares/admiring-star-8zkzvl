# admiring-star-8zkzvl
Created with CodeSandbox
# 📂 Dani Declares Project

## 1. Business Overview
- **Name:** Dani Declares  
- **Owner:** Danielle Williams  
- **Location:** Atlanta, GA  
- **Website:** https://danideclares.com  
- **Emails:** admin@danideclares.com | danideclaresns@gmail.com  

> _“We simplify life’s milestones—weddings, legal services, financial planning—in one warm, empowering experience.”_

---

## 2. Brand Kit
- **Primary Color (Burgundy):** #8B1E2E  
- **Secondary Color (Ivory):** #F8F5F1  
- **Accent Color (Gold):** #D4AF37  
- **Fonts:**  
  - Headings: Roboto, Georgia, Merriweather  
  - Body: Arial, Helvetica, Montserrat  
- **Logo Files:**  
  - `/assets/logo-primary.png`  
  - `/assets/logo-gold-seal.png`  

---

## 3. Services & Packages
| Service                   | URL Slug        | Starting Price | Notes                          |
|---------------------------|-----------------|---------------:|--------------------------------|
| Mobile Notary             | `/notary`       |      $50       | Apostille, fingerprinting      |
| Wedding Officiant         | `/weddings`     |     $150       | Elopement → Full planning      |
| Coaching (DIY / Group / 1:1 VIP) | `/coaching` |  $99 / $499 / $2,500 | Funnel: eBook → Webinar → VIP  |
| Events                    | `/events`       |  See calendar  | Sign & Sip, Love & Legalities, Declare Your Worth |

---

## 4. Upcoming Events & Milestones
| Date       | Event                                      | Folder / Design Path           |
|------------|--------------------------------------------|--------------------------------|
| Jun 2 2025 | Sign & Sip: Notary + Networking Pop-Up      | `src/pages/SignSipPage.jsx`    |
| Jul 13 2025| Love & Legalities: Wedding Mixer            | `src/pages/LoveLegalities.jsx` |
| Sept 2025  | Declare Your Worth Festival (Brook Run)     | `src/pages/FestivalPage.jsx`   |
| Jan 1 2026 | Start filming ‘WedFest: Battle for the Big Day’ | —                              |

---

## 5. Website Structure & Tech

## 5.1 Build, E-Commerce & Analytics

- **Build & Deploy:** Vercel (`vercel.json` defines builds + routes)  
- **E-commerce:** Snipcart (use `<button class="snipcart-add-item" data-item-id="…" …>` snippets in your product pages)  
- **Analytics/Ads:** Google Analytics, Facebook Pixel (wrap Pixel script in a `try/catch` or load only in production)


PRINTIFY_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIzN2Q0YmQzMDM1ZmUxMWU5YTgwM2FiN2VlYjNjY2M5NyIsImp0aSI6ImZiM2M3NTA3ZGUyNzIwNzgxMjhhYWI4MmEzY2EwMDYxMjRmMDA3NDRiMWZjMGVlZjQ3NTFmNzllMzc5NWRhOTc5Y2Q3MDNjZTY4YjllNzMwIiwiaWF0IjoxNzQ3NjA0NTA0LjM5NDMzNywibmJmIjoxNzQ3NjA0NTA0LjM5NDMzOSwiZXhwIjoxNzc5MTQwNTA0LjM4NTM1Nywic3ViIjoiMjMyMDc2MDgiLCJzY29wZXMiOlsic2hvcHMubWFuYWdlIiwic2hvcHMucmVhZCIsImNhdGFsb2cucmVhZCIsIm9yZGVycy5yZWFkIiwib3JkZXJzLndyaXRlIiwicHJvZHVjdHMucmVhZCIsInByb2R1Y3RzLndyaXRlIiwid2ViaG9va3MucmVhZCIsIndlYmhvb2tzLndyaXRlIiwidXBsb2Fkcy5yZWFkIiwidXBsb2Fkcy53cml0ZSIsInByaW50X3Byb3ZpZGVycy5yZWFkIiwidXNlci5pbmZvIl19.MqoxfESTt1SvVjL-eOr5xfEpbCRCfLtzDU4UkejEyZ1a7Cy1f1rBTixmP2MMjkx38bsqvNAwpmlblsxrGEdERkEmw6y6rmgVXFZ-viLCyQFOaHFHGcVO26oZp9x_TPWfAQXd20ow0-7e10s31Hg6qvP6T0Rr3a8wbKQKJzz6UbALtzKtwbYK_JCsKbJlLjkTHSuoMw2I-1x8onD7_ALemNnkk-qLJc1a6Nuara3dLaSTpDa8cPfbCG0WmEa3FbW23rgktLcA18apFaPqwTT3Szdw7q2ENXh1l2XbwG_jrqxJNRU3_KefBhKz-OsA1MEB5EpzrBN5CzjovU3jMAl91uNXbwbCrzxOUHmZD7vzhhR1LrBo20MHyo76kSQvyjLpOi0ib-rNe4qw-mdr0UkHASDduNO0J-4wse4HkWbaV_fY3u-40PHBTYUNHLCT-TFGL0lzIP9o7sFrD7BcPbESSGkiTpPHL21DbwDvsWXQ3Ll9K44pk8owtdB-syzYG708X3lRyH-ra6WVxIxP89mE4yBowySkD8VizHP0ndwfoSidUTUyZ1mRtFM9ZsJnE4CmiTjxcpE7vDwz4zKFx0nnffHLkRn6zc1kWWGe-VEVKFWmtUrLPpIzJ_3f17RWuOJXq1XKpeCLMjyZYMTxbcRaaFsQFB1buL8UKh7wME8M1qk  # your full token
PRINTIFY_STORE_ID=23207608             # your shop ID
REACT_APP_PAYPAL_CLIENT_ID=AbsR-8imZi3QwDWf0e0XhjTVB1GdXCnfcmTOXTDlBjkWTt5LjGNr8aby78jy58oUwGFvgsuYT_XEzfzq
# .env.production (at project root)
REACT_APP_SNIPCART_API_KEY=…<script>
    window.SnipcartSettings = {
        publicApiKey: 'NTNkMzZkYjAtMTNmMC00MmU4LThmODMtNGI3YzZmNjBiMzdhNjM4ODMwODkxMTUzNTc0NzYw',
        loadStrategy: 'on-user-interaction',
    };

    (()=>{var c,d;(d=(c=window.SnipcartSettings).version)!=null||(c.version="3.0");var s,S;(S=(s=window.SnipcartSettings).timeoutDuration)!=null||(s.timeoutDuration=2750);var l,p;(p=(l=window.SnipcartSettings).domain)!=null||(l.domain="cdn.snipcart.com");var w,u;(u=(w=window.SnipcartSettings).protocol)!=null||(w.protocol="https");var f=window.SnipcartSettings.version.includes("v3.0.0-ci")||window.SnipcartSettings.version!="3.0"&&window.SnipcartSettings.version.localeCompare("3.4.0",void 0,{numeric:!0,sensitivity:"base"})===-1,m=["focus","mouseover","touchmove","scroll","keydown"];window.LoadSnipcart=o;document.readyState==="loading"?document.addEventListener("DOMContentLoaded",r):r();function r(){window.SnipcartSettings.loadStrategy?window.SnipcartSettings.loadStrategy==="on-user-interaction"&&(m.forEach(t=>document.addEventListener(t,o)),setTimeout(o,window.SnipcartSettings.timeoutDuration)):o()}var a=!1;function o(){if(a)return;a=!0;let t=document.getElementsByTagName("head")[0],e=document.querySelector("#snipcart"),i=document.querySelector(`src[src^="${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}"][src$="snipcart.js"]`),n=document.querySelector(`link[href^="${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}"][href$="snipcart.css"]`);e||(e=document.createElement("div"),e.id="snipcart",e.setAttribute("hidden","true"),document.body.appendChild(e)),v(e),i||(i=document.createElement("script"),i.src=`${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}/themes/v${window.SnipcartSettings.version}/default/snipcart.js`,i.async=!0,t.appendChild(i)),n||(n=document.createElement("link"),n.rel="stylesheet",n.type="text/css",n.href=`${window.SnipcartSettings.protocol}://${window.SnipcartSettings.domain}/themes/v${window.SnipcartSettings.version}/default/snipcart.css`,t.prepend(n)),m.forEach(g=>document.removeEventListener(g,o))}function v(t){!f||(t.dataset.apiKey=window.SnipcartSettings.publicApiKey,window.SnipcartSettings.addProductBehavior&&(t.dataset.configAddProductBehavior=window.SnipcartSettings.addProductBehavior),window.SnipcartSettings.modalStyle&&(t.dataset.configModalStyle=window.SnipcartSettings.modalStyle),window.SnipcartSettings.currency&&(t.dataset.currency=window.SnipcartSettings.currency),window.SnipcartSettings.templatesUrl&&(t.dataset.templatesUrl=window.SnipcartSettings.templatesUrl))}})();
</script>
REACT_APP_GA_MEASUREMENT_ID=…
REACT_APP_FB_PIXEL_ID=…
