/* StormWatch v41: keep advanced verification out of the primary forecast flow. */
(()=>{'use strict';
const panel=document.getElementById('dailyPanel');if(!panel)return;
const cards=['.su32','.su34','.su37','.su36'].map(selector=>panel.querySelector(selector)).filter(Boolean);
if(!cards.length)return;
const details=document.createElement('details');details.className='su41';
const summary=document.createElement('summary');summary.textContent='Forecast accuracy & weather stations';
const intro=document.createElement('p');intro.className='su41-intro';intro.textContent='Optional tools: check a nearby station, compare past forecasts, and review accuracy when enough history is available.';
details.append(summary,intro);
for(const card of cards)details.append(card);
panel.append(details);
})();
