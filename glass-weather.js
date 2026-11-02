/* StormWatch v71: dynamic frosted-glass tint based on current model conditions. */
(()=>{'use strict';
const root=document.documentElement;
const themes={
sunny:{fill:'rgba(64,74,91,.66)',edge:'rgba(255,223,158,.38)',hero:'linear-gradient(145deg,rgba(255,190,97,.33),rgba(54,99,141,.53) 55%,rgba(13,36,66,.69))',glow:'rgba(255,182,76,.24)'},
cloudy:{fill:'rgba(34,57,81,.73)',edge:'rgba(221,237,249,.29)',hero:'linear-gradient(145deg,rgba(153,177,201,.24),rgba(40,72,101,.53) 60%,rgba(11,32,58,.72))',glow:'rgba(146,174,203,.17)'},
rain:{fill:'rgba(17,54,82,.76)',edge:'rgba(139,206,252,.34)',hero:'linear-gradient(145deg,rgba(50,132,193,.30),rgba(19,65,109,.61) 60%,rgba(6,30,61,.78))',glow:'rgba(69,153,220,.19)'},
snow:{fill:'rgba(58,81,105,.72)',edge:'rgba(225,247,255,.48)',hero:'linear-gradient(145deg,rgba(192,224,246,.32),rgba(77,122,159,.45) 58%,rgba(24,53,85,.75))',glow:'rgba(183,224,255,.20)'},
storm:{fill:'rgba(36,39,79,.80)',edge:'rgba(181,173,249,.42)',hero:'linear-gradient(145deg,rgba(117,99,181,.33),rgba(45,54,110,.57) 58%,rgba(18,26,60,.82))',glow:'rgba(127,106,204,.20)'},
night:{fill:'rgba(17,30,59,.83)',edge:'rgba(169,189,242,.24)',hero:'linear-gradient(145deg,rgba(60,80,151,.25),rgba(23,43,88,.56) 58%,rgba(9,19,47,.87))',glow:'rgba(82,106,190,.15)'}
};
function themeFor(current){const code=Number(current.weather_code);if(current.is_day===0)return 'night';if([95,96,99].includes(code))return 'storm';if([71,73,75,77,85,86].includes(code))return 'snow';if([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code))return 'rain';if([0,1].includes(code))return 'sunny';return 'cloudy'}
function apply(current){if(!current)return;const name=themeFor(current),t=themes[name];root.dataset.glassWeather=name;root.style.setProperty('--sw-glass-fill',t.fill);root.style.setProperty('--sw-glass-edge',t.edge);root.style.setProperty('--sw-glass-hero',t.hero);root.style.setProperty('--sw-glass-glow',t.glow)}
window.addEventListener('stormwatch:updated',e=>apply(e.detail?.weather?.current));
})();