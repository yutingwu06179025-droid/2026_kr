
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Correct target date for Jan 9, 2026
    const targetDate = new Date('2026-01-09T00:00:00');
    const now = new Date();
    // Get the difference in milliseconds and convert to days
    const diffTime = targetDate.getTime() - now.getTime();
    // Ensure we don't get negative numbers if the date has passed
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setDaysLeft(diffDays > 0 ? diffDays : 0);
  }, []);

  return (
    <header className="main-gradient text-white pt-14 pb-28 px-10">
      <div className="max-w-4xl mx-auto">
        {/* Top Info Bar */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-6 bg-white rounded-sm p-0.5 shadow-sm overflow-hidden">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/09/Flag_of_South_Korea.svg" alt="KR" className="w-full h-full object-cover" />
          </div>
          <p className="text-[10px] font-bold tracking-[0.25em] uppercase opacity-90">
            CHINA AIRLINES | 2026 WINTER JOURNEY
          </p>
        </div>

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-[42px] font-extrabold tracking-tight leading-[1.15] mb-8">
              2026년<br />
              서울 부산 여행
            </h1>
            
            <div className="inline-flex items-center bg-white/12 backdrop-blur-xl border border-white/25 px-7 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase">
              JAN 09 — JAN 17, 2026
            </div>
          </div>

          <div className="d-day-circle">
            <p className="text-[9px] font-bold text-[#A9DDF3] mb-1 tracking-widest">D-DAY</p>
            <div className="flex items-baseline gap-1">
              <span className="text-[38px] font-extrabold text-[#0057B8] leading-none">{daysLeft}</span>
              <span className="text-sm font-bold text-[#0057B8]">일</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
