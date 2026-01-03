
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Corrected target year to 2026
    const targetDate = new Date('2026-01-09T00:00:00');
    const now = new Date();
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays);
  }, []);

  return (
    <header className="kal-gradient text-white pt-12 md:pt-16 pb-20 md:pb-28 px-6 md:px-10 rounded-b-[3rem] md:rounded-b-[5rem] shadow-xl relative overflow-hidden">
      <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
        <i className="fa-solid fa-plane-up text-[12rem] md:text-[18rem] rotate-12 text-[#A9DDF3]"></i>
      </div>
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex flex-row justify-between items-end">
          <div className="flex-1">
             <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
                <div className="w-8 h-5 md:w-10 md:h-7 bg-white rounded-sm overflow-hidden flex items-center justify-center p-0.5">
                   <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg" alt="South Korea Flag" className="w-full h-full object-contain" />
                </div>
                <span className="text-[8px] md:text-xs font-black tracking-widest text-[#A9DDF3] uppercase">Private Journey | 프라이빗 여행</span>
             </div>
            <h1 className="text-4xl md:text-7xl font-namsan font-black mb-4 tracking-tighter leading-tight drop-shadow-md">
              2026년<br/>서울 부산 여행
            </h1>
            <p className="text-sm md:text-xl opacity-90 flex items-center gap-2 font-bold">
              <span className="bg-[#A9DDF3] text-[#003399] px-3 py-1 rounded-full text-[10px] md:text-sm font-black tracking-widest uppercase">Jan 9 — Jan 17, 2026</span>
            </p>
          </div>
          <div className="bg-white text-[#003399] p-4 md:p-8 rounded-[2rem] md:rounded-[3.5rem] text-center shadow-2xl min-w-[100px] md:min-w-[160px] ml-4">
            <p className="text-[7px] md:text-[10px] font-black uppercase mb-1 opacity-40">D-DAY | 출발 전</p>
            <div className="flex items-baseline justify-center gap-0.5">
              <span className="text-3xl md:text-6xl font-black tracking-tighter">{daysLeft > 0 ? daysLeft : 0}</span>
              <span className="text-xs md:text-lg font-black opacity-30">일</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
