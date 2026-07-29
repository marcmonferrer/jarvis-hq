(()=>{
  'use strict';

  const widgets=[...document.querySelectorAll('[data-weather-widget]')];
  if(!widgets.length)return;

  const cacheKey='jarvis-hq-weather-v1';
  const endpoint='https://api.open-meteo.com/v1/forecast?latitude=41.3874&longitude=2.1686&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&timezone=Europe%2FMadrid&forecast_days=1';
  const conditions={
    0:['Clear sky','☀️'],1:['Mainly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Overcast','☁️'],
    45:['Fog','🌫️'],48:['Fog','🌫️'],51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Heavy drizzle','🌧️'],
    61:['Light rain','🌦️'],63:['Rain','🌧️'],65:['Heavy rain','🌧️'],66:['Freezing rain','🌧️'],67:['Freezing rain','🌧️'],
    71:['Light snow','🌨️'],73:['Snow','🌨️'],75:['Heavy snow','❄️'],77:['Snow grains','🌨️'],
    80:['Rain showers','🌦️'],81:['Rain showers','🌧️'],82:['Heavy showers','⛈️'],
    85:['Snow showers','🌨️'],86:['Heavy snow showers','❄️'],95:['Thunderstorm','⛈️'],96:['Thunderstorm','⛈️'],99:['Thunderstorm','⛈️']
  };

  function readCache(){
    try{return JSON.parse(localStorage.getItem(cacheKey)||'null');}
    catch{return null;}
  }

  function saveCache(value){
    try{localStorage.setItem(cacheKey,JSON.stringify(value));}
    catch{}
  }

  function valid(data){
    return data&&Number.isFinite(data.temperature)&&Number.isFinite(data.high)&&Number.isFinite(data.low);
  }

  function normalize(payload){
    const current=payload?.current;
    const daily=payload?.daily;
    const [condition,icon]=conditions[current?.weather_code]||['Current conditions','🌡️'];
    return {
      temperature:Number(current?.temperature_2m),
      high:Number(daily?.temperature_2m_max?.[0]),
      low:Number(daily?.temperature_2m_min?.[0]),
      condition,
      icon,
      observedAt:current?.time||null,
      savedAt:Date.now()
    };
  }

  function render(data,{cached=false}={}){
    if(!valid(data))return false;
    widgets.forEach(widget=>{
      widget.dataset.state=cached?'cached':'ready';
      widget.querySelector('[data-weather-icon]').textContent=data.icon;
      widget.querySelector('[data-weather-temperature]').textContent=`${Math.round(data.temperature)}°`;
      widget.querySelector('[data-weather-condition]').textContent=data.condition;
      widget.querySelector('[data-weather-high]').textContent=`${Math.round(data.high)}°`;
      widget.querySelector('[data-weather-low]').textContent=`${Math.round(data.low)}°`;
      widget.querySelector('[data-weather-meta]').textContent=cached?'Saved weather':'Live · Barcelona';
      widget.setAttribute('aria-label',`Barcelona weather: ${Math.round(data.temperature)} degrees, ${data.condition}. High ${Math.round(data.high)}, low ${Math.round(data.low)}.`);
    });
    return true;
  }

  function unavailable(){
    widgets.forEach(widget=>{
      widget.dataset.state='unavailable';
      widget.querySelector('[data-weather-icon]').textContent='—';
      widget.querySelector('[data-weather-temperature]').textContent='—°';
      widget.querySelector('[data-weather-condition]').textContent='Weather unavailable';
      widget.querySelector('[data-weather-high]').textContent='—°';
      widget.querySelector('[data-weather-low]').textContent='—°';
      widget.querySelector('[data-weather-meta]').textContent='Try again later';
    });
  }

  async function refresh(){
    const cached=readCache();
    if(valid(cached))render(cached,{cached:true});

    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),8000);
    try{
      const response=await fetch(endpoint,{cache:'no-store',signal:controller.signal});
      if(!response.ok)throw new Error(`Weather request failed: ${response.status}`);
      const data=normalize(await response.json());
      if(!valid(data))throw new Error('Incomplete weather response');
      saveCache(data);
      render(data);
    }catch{
      if(!valid(cached))unavailable();
    }finally{
      window.clearTimeout(timeout);
    }
  }

  refresh();
})();
