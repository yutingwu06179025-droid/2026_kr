
import React from 'react';
import { DayPlan } from '../types';

interface DayCardProps {
  day: DayPlan;
  dayNumber: number;
  onAddItem: (idx: number) => void;
  onRemoveItem: (id: string) => void;
  isActive: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, dayNumber, onAddItem, onRemoveItem, isActive }) => {
  if (!isActive) return null;

  return (
    <div className="animate-k">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div className="text-left">
          <h3 className="text-3xl md:text-5xl font-namsan font-black text-slate-900 mb-2">
            {new Date(day.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-[#003399] font-black text-xs uppercase tracking-widest">Day {dayNumber} Itinerary | 일정</p>
        </div>
      </div>

      <div className="space-y-4 md:space-y-6">
        {day.items.length === 0 ? (
          <div className="py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300">
            <i className="fa-solid fa-map-pin text-3xl mb-4 opacity-20"></i>
            <p className="font-bold text-lg mb-1">오늘의 일정이 없습니다</p>
            <p className="text-xs uppercase tracking-widest opacity-60 font-black">No fixed plans</p>
          </div>
        ) : (
          day.items.map((item) => (
            <div key={item.id} className="group relative flex items-center gap-4 md:gap-10 p-8 md:p-12 rounded-[2.5rem] bg-white border border-slate-50 shadow-sm hover:shadow-xl transition-all">
              <div className="text-2xl md:text-3xl font-black text-[#003399] min-w-[70px] md:min-w-[100px]">{item.time}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="text-xl md:text-3xl font-black text-slate-800 leading-tight">{item.activity}</h4>
                  {item.naverUrl && <a href={item.naverUrl} target="_blank" rel="noreferrer" className="naver-green w-8 h-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-emerald-500/20 active:scale-90 transition-transform">N</a>}
                </div>
                <p className="text-sm md:text-xl text-slate-400 font-bold truncate max-w-[200px] md:max-w-none flex items-center gap-2">
                  <i className="fa-solid fa-location-dot text-[#A9DDF3]"></i>{item.location}
                </p>
              </div>
              <button onClick={() => onRemoveItem(item.id)} className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-full">
                <i className="fa-solid fa-trash-can text-xl"></i>
              </button>
            </div>
          ))
        )}
        <button onClick={() => onAddItem(dayNumber - 1)} className="w-full py-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] text-slate-300 font-black text-xl hover:text-[#003399] hover:border-[#003399]/20 hover:bg-[#003399]/5 transition-all flex items-center justify-center gap-4">
          <i className="fa-solid fa-plus-circle"></i>
          Add Activity | 일정 추가
        </button>
      </div>
    </div>
  );
};

export default DayCard;
