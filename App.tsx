
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import { DayPlan, ItineraryItem } from './types';

interface Voucher {
  id: string;
  title: string;
  type: string;
  screenshot?: string;
  status: string;
}

const App: React.FC = () => {
  const [view, setView] = useState<'itinerary' | 'booking' | 'share'>('itinerary');
  
  // 初始數據：優先從 LocalStorage 讀取，若無則使用預設值
  const [itinerary, setItinerary] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem('k_trip_itinerary');
    return saved ? JSON.parse(saved) : [
      { date: '2026-01-09', items: [{ id: 'f1', time: '07:50', activity: '✈️ CI 160 TPE-ICN', location: '타오위안 T1 | 桃園 T1', status: 'FIXED' }] },
      { date: '2026-01-10', items: [] },
      { date: '2026-01-11', items: [] },
      { date: '2026-01-12', items: [] },
      { date: '2026-01-13', items: [] },
      { date: '2026-01-14', items: [] },
      { date: '2026-01-15', items: [] },
      { date: '2026-01-16', items: [] },
      { date: '2026-01-17', items: [{ id: 'f2', time: '19:50', activity: '✈️ CI 187 PUS-TPE', location: '김해국제공항 | 金海機場', status: 'FIXED' }] },
    ];
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('k_trip_vouchers');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', title: 'Grand Hyatt Seoul', type: 'Accommodation | 숙소', status: 'Confirmed | 확인됨' },
      { id: 'v2', title: 'Lotte Hotel Busan', type: 'Accommodation | 숙소', status: 'Confirmed | 확인됨' }
    ];
  });

  // 每當數據變動時，自動存入 LocalStorage
  useEffect(() => {
    localStorage.setItem('k_trip_itinerary', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    localStorage.setItem('k_trip_vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  
  const [newActivity, setNewActivity] = useState({ activity: '', location: '', time: '', naverUrl: '' });
  const [newVoucher, setNewVoucher] = useState<{title: string, type: string, screenshot: string | undefined}>({
    title: '', type: 'Accommodation | 숙소', screenshot: undefined
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeDay = itinerary[selectedIdx];

  useEffect(() => {
    if (scrollRef.current && view === 'itinerary') {
      const activeElement = scrollRef.current.children[selectedIdx] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedIdx, view]);

  const exportTripData = () => {
    const data = JSON.stringify({ itinerary, vouchers }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `K-Journey-Backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importTripData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.itinerary && imported.vouchers) {
          if (window.confirm("匯入將會覆蓋目前的行程，確定嗎？")) {
            setItinerary(imported.itinerary);
            setVouchers(imported.vouchers);
            alert('Import Successful! | 가져오기 성공!');
          }
        }
      } catch (err) { alert('Invalid file format. | 잘못된 파일 형식입니다.'); }
    };
    reader.readAsText(file);
  };

  const copyTextSummary = () => {
    let summary = "🇰🇷 2026 K-Journey Summary\n\n";
    itinerary.forEach(day => {
      if (day.items.length > 0) {
        summary += `📅 ${new Date(day.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}\n`;
        day.items.forEach(item => {
          summary += `• [${item.time}] ${item.activity} @ ${item.location}\n`;
        });
        summary += "\n";
      }
    });
    navigator.clipboard.writeText(summary).then(() => alert('Copied! | 복사되었습니다!'));
  };

  const handleManualAdd = () => {
    if (!newActivity.activity) return;
    const newItem: ItineraryItem = {
      id: `act-${Date.now()}`,
      time: newActivity.time || 'TBD',
      activity: newActivity.activity,
      location: newActivity.location || 'TBD',
      status: 'FIXED' as const,
      naverUrl: newActivity.naverUrl || ''
    };
    setItinerary(prev => prev.map((day, idx) => idx === selectedIdx ? { ...day, items: [...day.items, newItem].sort((a,b) => a.time.localeCompare(b.time)) } : day));
    setNewActivity({ activity: '', location: '', time: '', naverUrl: '' });
    setShowAddModal(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewVoucher(prev => ({ ...prev, screenshot: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddVoucher = () => {
    if (!newVoucher.title) return;
    setVouchers(prev => [...prev, { id: `v-${Date.now()}`, ...newVoucher, status: 'Added | 추가됨' }]);
    setNewVoucher({ title: '', type: 'Accommodation | 숙소', screenshot: undefined });
    setShowVoucherModal(false);
  };

  const removeItem = (id: string) => {
    if(window.confirm("Delete this? | 삭제하시겠습니까?")) {
      setItinerary(prev => prev.map(day => ({ ...day, items: day.items.filter(item => item.id !== id) })));
    }
  };

  const removeVoucher = (id: string) => {
    if(window.confirm("Delete voucher? | 삭제하시겠습니까?")) {
      setVouchers(prev => prev.filter(v => v.id !== id));
    }
  };

  const renderTicket = (flightNo: string, route: string, time: string, date: string, isReturn: boolean = false) => {
    const [from, to] = route.split('-');
    const [depTime, arrTime] = time.split('/');
    return (
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col mb-6 animate-k hover:shadow-lg group">
        <div className="p-6 md:p-10 flex-1">
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 kal-gradient rounded-xl md:rounded-2xl flex items-center justify-center text-white">
                 <i className="fa-solid fa-plane-departure text-lg md:text-xl"></i>
              </div>
              <div>
                <p className="text-[8px] md:text-[10px] font-black text-[#003399] uppercase tracking-widest">China Airlines</p>
                <h4 className="text-xl md:text-2xl font-black text-slate-800">{flightNo}</h4>
              </div>
            </div>
            <span className="text-[10px] font-black text-emerald-600 uppercase border border-emerald-100 px-3 py-1 rounded-full">OK</span>
          </div>
          <div className="flex justify-between items-center relative">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black text-[#003399]">{from}</h2>
              <p className="text-2xl md:text-3xl font-black text-slate-800 mt-2">{depTime}</p>
            </div>
            <div className="flex-1 flex flex-col items-center px-4">
               <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-[1px] bg-slate-200 relative">
                     <i className={`fa-solid fa-plane absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl text-[#A9DDF3] ${isReturn ? 'scale-x-[-1]' : ''}`}></i>
                  </div>
               </div>
               <span className="text-[8px] font-black text-slate-300 mt-2">DIRECT</span>
            </div>
            <div className="text-center md:text-right">
              <h2 className="text-3xl md:text-5xl font-black text-[#003399]">{to}</h2>
              <p className="text-2xl md:text-3xl font-black text-slate-800 mt-2">{arrTime}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 md:p-10 border-t border-dashed border-slate-200 flex justify-between items-center">
          <div className="text-left">
             <p className="text-[8px] font-black text-slate-400 uppercase">Flight Date</p>
             <p className="text-lg md:text-2xl font-black text-[#003399] uppercase">{date}</p>
          </div>
          <div className="text-right">
             <p className="text-[8px] font-black text-slate-400 uppercase">Seat</p>
             <p className="text-lg md:text-2xl font-black text-slate-800 uppercase">TBD / 12A</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-32 md:pb-48">
      <Header />
      <main className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
        {view === 'itinerary' && (
          <div className="animate-k">
            <div ref={scrollRef} className="date-slider hide-scrollbar mb-8 md:mb-12">
              {itinerary.map((day, idx) => {
                const dateObj = new Date(day.date);
                const isActive = selectedIdx === idx;
                return (
                  <button key={day.date} onClick={() => setSelectedIdx(idx)} className={`date-item w-20 md:w-24 h-28 md:h-36 flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] transition-all duration-300 ${isActive ? 'bg-[#003399] text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    <span className="text-[9px] font-black uppercase opacity-60 mb-1">{dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })}</span>
                    <span className="text-2xl md:text-3xl font-black">{dateObj.getDate()}</span>
                    <span className="text-[9px] mt-2 font-bold opacity-40 uppercase">{dateObj.toLocaleDateString('ko-KR', { month: 'short' })}</span>
                  </button>
                );
              })}
            </div>

            <div className="k-card p-6 md:p-16 min-h-[500px] border-t-8 border-t-[#A9DDF3]">
              <div className="mb-10 text-center md:text-left">
                <h3 className="text-3xl md:text-5xl font-namsan font-black text-slate-900 mb-2">
                  {new Date(activeDay.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                </h3>
                <p className="text-[#003399] font-black text-xs uppercase tracking-widest">Day {selectedIdx + 1} Itinerary | 일정</p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {activeDay.items.length === 0 ? (
                  <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300">
                    <p className="font-bold text-lg">No plans for today</p>
                  </div>
                ) : (
                  activeDay.items.map((item) => (
                    <div key={item.id} className="group relative flex items-center gap-4 md:gap-8 p-6 md:p-10 rounded-[2rem] bg-white border border-slate-100 shadow-sm">
                      <div className="text-xl md:text-2xl font-black text-[#003399] min-w-[60px] md:min-w-[90px]">{item.time}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg md:text-2xl font-black text-slate-800 leading-tight">{item.activity}</h4>
                          {item.naverUrl && <a href={item.naverUrl} target="_blank" className="naver-green w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black">N</a>}
                        </div>
                        <p className="text-sm md:text-lg text-slate-400 font-bold truncate max-w-[150px] md:max-w-none">
                          <i className="fa-solid fa-location-dot text-[#A9DDF3] mr-1"></i>{item.location}
                        </p>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="p-3 text-slate-200 hover:text-rose-500 transition-all bg-slate-50 rounded-full">
                        <i className="fa-solid fa-trash-can text-lg"></i>
                      </button>
                    </div>
                  ))
                )}
                <button onClick={() => setShowAddModal(true)} className="w-full py-8 border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 font-black text-xl hover:text-[#003399] transition-all">
                  + 手動新增行程
                </button>
              </div>
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="animate-k space-y-6 md:space-y-12 pb-10">
            {renderTicket('CI 160', 'TPE-ICN', '07:50/11:20', '1월 9일')}
            {renderTicket('CI 187', 'PUS-TPE', '19:50/21:20', '1월 17일', true)}
            <div className="k-card p-6 md:p-12">
               <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl md:text-2xl font-black text-slate-800">Accommodation | 숙소</h3>
                 <button onClick={() => setShowVoucherModal(true)} className="bg-[#003399] text-white px-4 py-2 rounded-xl font-black text-xs">+ New</button>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {vouchers.map((v) => (
                    <div key={v.id} className="bg-slate-50 p-6 rounded-[1.5rem] flex flex-col group border border-slate-100">
                       <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <p className="text-[8px] font-black text-[#003399] uppercase">{v.type}</p>
                            <h4 className="text-lg font-black text-slate-800">{v.title}</h4>
                          </div>
                          <button onClick={() => removeVoucher(v.id)} className="text-slate-200 hover:text-rose-500 p-2"><i className="fa-solid fa-trash-can"></i></button>
                       </div>
                       {v.screenshot && <img src={v.screenshot} alt="voucher" className="w-full h-24 object-cover rounded-xl border border-slate-200 bg-white" />}
                       <p className="text-[10px] font-bold text-slate-400 mt-4"><span className="w-1.5 h-1.5 inline-block rounded-full bg-emerald-500 mr-2"></span>{v.status}</p>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {view === 'share' && (
          <div className="animate-k space-y-6 pb-10">
            <div className="k-card p-8 md:p-12">
               <h3 className="text-2xl md:text-3xl font-namsan font-black mb-8">Share & Sync | 공유</h3>
               <div className="space-y-4">
                  <div className="p-6 bg-[#003399]/[0.02] rounded-[2rem] border border-[#003399]/10">
                     <h4 className="font-black text-slate-800 mb-4">Export Trip Data (JSON)</h4>
                     <button onClick={exportTripData} className="w-full py-4 bg-[#003399] text-white rounded-2xl font-black">Download File</button>
                  </div>
                  <div className="p-6 bg-[#A9DDF3]/[0.05] rounded-[2rem] border border-[#A9DDF3]/20">
                     <h4 className="font-black text-slate-800 mb-4">Import Trip Data</h4>
                     <label className="block w-full py-4 bg-white text-[#003399] rounded-2xl font-black text-center cursor-pointer border border-[#003399]/10">
                        Select File <input type="file" accept=".json" onChange={importTripData} className="hidden" />
                     </label>
                  </div>
                  <button onClick={copyTextSummary} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black">Copy Text Summary</button>
               </div>
            </div>
            <div className="text-center text-slate-400 text-xs font-bold px-10">
              提示：數據將自動儲存在您的手機瀏覽器中。
            </div>
          </div>
        )}
      </main>

      {/* Modals for Mobile */}
      {(showAddModal || showVoucherModal) && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 modal-backdrop">
           <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-k border border-blue-50">
              <div className="bg-[#003399] p-6 md:p-10 text-white flex justify-between items-center">
                 <h3 className="text-xl md:text-3xl font-black">{showAddModal ? 'Add Activity' : 'Add Voucher'}</h3>
                 <button onClick={() => {setShowAddModal(false); setShowVoucherModal(false);}} className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="p-6 md:p-10 space-y-4">
                 {showAddModal ? (
                   <>
                    <input type="text" placeholder="活動名稱 | Activity" value={newActivity.activity} onChange={e => setNewActivity({...newActivity, activity: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                    <div className="grid grid-cols-2 gap-4">
                       <input type="text" placeholder="地點 | Location" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                       <input type="text" placeholder="時間 (14:00)" value={newActivity.time} onChange={e => setNewActivity({...newActivity, time: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                    </div>
                    <button onClick={handleManualAdd} className="w-full py-4 bg-[#003399] text-white rounded-2xl font-black mt-4">Confirm | 確定</button>
                   </>
                 ) : (
                   <>
                    <input type="text" placeholder="預定項目 | Title" value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} className="w-full bg-slate-50 p-4 rounded-2xl font-bold" />
                    <input type="file" accept="image/*" onChange={handleFileChange} className="w-full text-xs text-slate-400 file:bg-blue-50 file:border-0 file:rounded-full file:px-4 file:py-2 file:mr-4" />
                    <button onClick={handleAddVoucher} className="w-full py-4 bg-[#003399] text-white rounded-2xl font-black mt-4">Save | 保存</button>
                   </>
                 )}
              </div>
           </div>
        </div>
      )}

      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 glass-nav px-6 md:px-12 py-4 md:py-6 rounded-full shadow-2xl flex items-center gap-8 md:gap-16 z-50 border border-white/50 w-[90%] md:w-auto justify-around md:justify-center">
        {[
          { id: 'itinerary', icon: 'fa-calendar-days', label: 'Trip' },
          { id: 'booking', icon: 'fa-ticket', label: 'Booking' },
          { id: 'share', icon: 'fa-share-nodes', label: 'Share' }
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id as any)} className={`flex flex-col items-center transition-all ${view === item.id ? 'text-[#003399] scale-110' : 'text-slate-300'}`}>
            <i className={`fa-solid ${item.icon} text-2xl mb-1`}></i>
            <span className="text-[8px] font-black uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
