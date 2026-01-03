
import React from 'react';
import { DayPlan, ItineraryItem } from '../types';

interface DayCardProps {
  day: DayPlan;
  onAddItem: (date: string) => void;
  onSuggest: (date: string) => void;
  isLoading: boolean;
}

const DayCard: React.FC<DayCardProps> = ({ day, onAddItem, onSuggest, isLoading }) => {
  const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="mb-8 last:mb-0">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 font-bold text-slate-600">
          {formattedDate.split(',')[1].split(' ')[2]}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-slate-800">{formattedDate}</h3>
          <p className="text-sm text-slate-400">Day 01</p>
        </div>
        <button 
          onClick={() => onSuggest(day.date)}
          disabled={isLoading}
          className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2"
        >
          {isLoading ? (
            <i className="fa-solid fa-spinner animate-spin"></i>
          ) : (
            <i className="fa-solid fa-wand-magic-sparkles"></i>
          )}
          AI Plan
        </button>
      </div>

      <div className="space-y-3 ml-6 pl-10 border-l-2 border-dashed border-slate-200">
        {day.items.length === 0 ? (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-center text-slate-400 italic text-sm">
            No activities planned yet.
          </div>
        ) : (
          day.items.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 rounded-2xl flex items-center gap-4 group transition-all ${
                item.status === 'FIXED' 
                  ? 'bg-white shadow-sm border border-slate-100' 
                  : 'bg-indigo-50/50 border border-indigo-100/50'
              }`}
            >
              <div className="w-16 text-xs font-semibold text-slate-400 text-center">
                {item.time}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-800">{item.activity}</h4>
                  {item.status === 'FIXED' ? (
                    <span className="bg-emerald-100 text-emerald-600 text-[10px] px-2 py-0.5 rounded-full font-bold">LOCKED</span>
                  ) : (
                    <span className="bg-indigo-100 text-indigo-600 text-[10px] px-2 py-0.5 rounded-full font-bold">SUGGESTION</span>
                  )}
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-1">
                  <i className="fa-solid fa-location-dot text-rose-400"></i>
                  {item.location}
                </p>
              </div>
              <button className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 transition-all">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </div>
          ))
        )}
        
        <button 
          onClick={() => onAddItem(day.date)}
          className="w-full p-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm hover:border-slate-300 hover:bg-white transition-all flex justify-center items-center gap-2"
        >
          <i className="fa-solid fa-plus text-xs"></i>
          Add Activity
        </button>
      </div>
    </div>
  );
};

export default DayCard;
