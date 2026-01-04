
import React from 'react';
import { DayPlan, ItineraryItem } from '../types';

interface DayCardProps {
  day: DayPlan;
  dayNumber: number;
  onAddItem: (idx: number) => void;
  onRemoveItem: (id: string) => void;
  isActive: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, dayNumber, onAddItem, onRemoveItem, isActive }) => {
  if (!isActive) return null;

  const dateObj = new Date(day.date);
  const month = dateObj.getMonth() + 1;
  const date = dateObj.getDate();

  const WeatherIcon = ({ type }: { type?: string }) => {
    switch(type) {
      case 'sun': return <i className="fa-solid fa-sun text-amber-400"></i>;
      case 'cloud': return <i className="fa-solid fa-cloud text-slate-300"></i>;
      case 'snow': return <i className="fa-solid fa-snowflake text-sky-300"></i>;
      case 'rain': return <i className="fa-solid fa-cloud-rain text-blue-400"></i>;
      default: return null;
    }
  };

  return (
    <div className="animate-enter px-10 pt-16">
      <div className="mb-12 flex justify-between items-start">
        <div>
          <h2 className="text-[44px] font-extrabold text-[#1a1e27] mb-4 tracking-tighter">
            {month}월 {date}일
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-[#0057B8] font-bold text-[11px] tracking-widest uppercase bg-[#EBFBFF] px-4 py-1.5 rounded-xl border border-[#A9DDF3]/40">
              {day.locationName || '서울'}
            </span>
            <span className="text-[#adb5bd] font-bold text-xs uppercase tracking-[0.2em] ml-1">DAY {dayNumber}</span>
          </div>
        </div>
        
        {day.weather && (
          <div className="flex items-center gap-3 mt-1.5">
            <div className="text-[52px] drop-shadow-sm"><WeatherIcon type={day.weather} /></div>
            <span className="text-[34px] font-extrabold text-[#1a1e27] tracking-tighter">{day.temp}°</span>
          </div>
        )}
      </div>

      <div className="space-y-7">
        {day.items.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center rounded-[3rem] bg-[#F8FAFC] border border-slate-50">
             <i className="fa-solid fa-compass text-[#A9DDF3] text-4xl mb-5 opacity-30"></i>
             <p className="text-slate-400 font-bold text-lg mb-1 tracking-tight">오늘의 일정이 없습니다</p>
             <p className="text-[#A9DDF3] text-[10px] font-bold uppercase tracking-widest">Planned via K-Journey</p>
          </div>
        ) : (
          day.items.map((item) => (
            item.type === 'FLIGHT' ? (
              <div key={item.id} className="relative overflow-hidden shadow-2xl rounded-[2.8rem] bg-[#0057B8] text-white p-9">
                <div className="flex justify-between items-start mb-8">
                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                        <i className="fa-solid fa-plane text-xs"></i>
                     </div>
                     <p className="text-[20px] font-extrabold tracking-tight">{item.activity}</p>
                   </div>
                   <button onClick={() => onRemoveItem(item.id)} className="opacity-40 hover:opacity-100 transition-opacity p-2"><i className="fa-solid fa-trash-can text-sm"></i></button>
                </div>
                
                <div className="flex justify-between items-center px-2 relative mb-2">
                  <div className="text-center">
                    <p className="text-[38px] font-extrabold tracking-tighter mb-1">{item.origin || 'TPE'}</p>
                    <p className="text-xs font-bold opacity-60 tracking-[0.2em] uppercase">{item.time}</p>
                  </div>
                  <div className="flex-1 px-8 flex flex-col items-center opacity-30">
                    <div className="w-full h-[1.5px] bg-white relative">
                      <i className="fa-solid fa-plane absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm"></i>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-[38px] font-extrabold tracking-tighter mb-1">{item.destination || 'ICN'}</p>
                    <p className="text-xs font-bold opacity-60 tracking-[0.2em] uppercase">{item.endTime || '--:--'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div key={item.id} className="activity-card flex items-center gap-7 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-[#0057B8] opacity-10"></div>
                <div className="flex flex-col items-center min-w-[55px]">
                  <span className="text-[19px] font-extrabold text-[#0057B8] tracking-tighter">{item.time}</span>
                  <div className="h-4 w-[2.5px] bg-[#A9DDF3] rounded-full my-2 opacity-60"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[22px] font-bold text-[#1a1e27] mb-1.5 tracking-tight truncate">{item.activity}</h4>
                  <p className="text-sm text-slate-400 font-bold flex items-center gap-2 truncate uppercase">
                    <i className="fa-solid fa-location-dot text-[#A9DDF3]"></i> {item.location}
                  </p>
                </div>
                <button onClick={() => onRemoveItem(item.id)} className="text-slate-100 group-hover:text-rose-400 p-2 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
              </div>
            )
          ))
        )}

        <button 
          onClick={() => onAddItem(dayNumber - 1)} 
          className="w-full py-8 bg-white border-2 border-dashed border-[#A9DDF3]/50 rounded-[3rem] text-slate-400 font-bold text-sm hover:bg-[#F8FBFF] hover:border-[#0057B8] hover:text-[#0057B8] transition-all flex items-center justify-center gap-3 active:scale-98"
        >
          <i className="fa-solid fa-plus-circle text-xl text-[#A9DDF3]"></i>
          새 일정 추가하기
        </button>
      </div>
    </div>
  );
};

export default DayCard;
