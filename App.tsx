
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import DayCard from './components/DayCard';
import { DayPlan, ItineraryItem, Voucher } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'itinerary' | 'booking' | 'share'>('itinerary');
  const [selectedIdx, setSelectedIdx] = useState(0);
  
  const defaultItinerary: DayPlan[] = [
    { date: '2026-01-09', items: [{ id: 'f1', time: '07:50', activity: '✈️ CI 160 TPE-ICN', location: 'TPE Airport Terminal 1', status: 'FIXED' }] },
    { date: '2026-01-10', items: [] },
    { date: '2026-01-11', items: [] },
    { date: '2026-01-12', items: [] },
    { date: '2026-01-13', items: [] },
    { date: '2026-01-14', items: [] },
    { date: '2026-01-15', items: [] },
    { date: '2026-01-16', items: [] },
    { date: '2026-01-17', items: [{ id: 'f2', time: '19:50', activity: '✈️ CI 187 PUS-TPE', location: 'Gimhae Int\'l Airport (PUS)', status: 'FIXED' }] },
  ];

  const [itinerary, setItinerary] = useState<DayPlan[]>(() => {
    const saved = localStorage.getItem('k_trip_itinerary_2026');
    return saved ? JSON.parse(saved) : defaultItinerary;
  });

  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem('k_trip_vouchers_2026');
    return saved ? JSON.parse(saved) : [
      { id: 'v1', title: 'Grand Hyatt Seoul', type: 'Accommodation', status: 'Confirmed', date: '2026-01-09' },
      { id: 'v2', title: 'Lotte Hotel Busan', type: 'Accommodation', status: 'Confirmed', date: '2026-01-14' }
    ];
  });

  useEffect(() => {
    localStorage.setItem('k_trip_itinerary_2026', JSON.stringify(itinerary));
  }, [itinerary]);

  useEffect(() => {
    localStorage.setItem('k_trip_vouchers_2026', JSON.stringify(vouchers));
  }, [vouchers]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  
  const [newActivity, setNewActivity] = useState({ activity: '', location: '', time: '', naverUrl: '' });
  const [newVoucher, setNewVoucher] = useState({ title: '', type: 'Accommodation', date: '', status: 'Confirmed', note: '' });

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current && view === 'itinerary') {
      const activeElement = scrollRef.current.children[selectedIdx] as HTMLElement;
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [selectedIdx, view]);

  const removeItem = (id: string) => {
    if(window.confirm("이 항목을 삭제하시겠습니까? (Delete this item?)")) {
      setItinerary(prev => prev.map(day => ({ ...day, items: day.items.filter(item => item.id !== id) })));
    }
  };

  const removeVoucher = (id: string) => {
    if(window.confirm("이 예약을 삭제하시겠습니까? (Delete this reservation?)")) {
      setVouchers(prev => prev.filter(v => v.id !== id));
    }
  };

  const handleManualAdd = () => {
    if (!newActivity.activity) return;
    const newItem: ItineraryItem = {
      id: `act-${Date.now()}`,
      time: newActivity.time || 'TBD',
      activity: newActivity.activity,
      location: newActivity.location || 'TBD',
      status: 'FIXED',
      naverUrl: newActivity.naverUrl || ''
    };
    setItinerary(prev => prev.map((day, idx) => idx === selectedIdx ? { ...day, items: [...day.items, newItem].sort((a,b) => a.time.localeCompare(b.time)) } : day));
    setNewActivity({ activity: '', location: '', time: '', naverUrl: '' });
    setShowAddModal(false);
  };

  const handleVoucherAdd = () => {
    if (!newVoucher.title) return;
    const item: Voucher = {
      id: `vouch-${Date.now()}`,
      ...newVoucher
    };
    setVouchers(prev => [...prev, item]);
    setNewVoucher({ title: '', type: 'Accommodation', date: '', status: 'Confirmed', note: '' });
    setShowVoucherModal(false);
  };

  const exportTripData = () => {
    const data = JSON.stringify({ itinerary, vouchers }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `K-Journey-Backup-2026.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = JSON.parse(e.target?.result as string);
        if (content.itinerary && content.vouchers) {
          setItinerary(content.itinerary);
          setVouchers(content.vouchers);
          alert("데이터를 성공적으로 불러왔습니다! (Import Success)");
        } else {
          throw new Error("Invalid Format");
        }
      } catch (err) {
        alert("잘못된 파일 형식입니다. (Invalid File Format)");
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const resetAllData = () => {
    if (window.confirm("모든 데이터를 초기화하시겠습니까? (Reset all data?)")) {
      setItinerary(defaultItinerary);
      setVouchers([]);
      localStorage.clear();
      alert("완료되었습니다 (Complete)");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen pb-32 md:pb-48">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 md:px-6 -mt-8 md:-mt-12 relative z-20">
        {view === 'itinerary' && (
          <div>
            <div ref={scrollRef} className="date-slider hide-scrollbar mb-8 md:mb-12">
              {itinerary.map((day, idx) => {
                const dateObj = new Date(day.date);
                const isActive = selectedIdx === idx;
                return (
                  <button key={day.date} onClick={() => setSelectedIdx(idx)} className={`date-item w-20 md:w-24 h-28 md:h-36 flex flex-col items-center justify-center rounded-[2rem] md:rounded-[2.5rem] transition-all duration-300 ${isActive ? 'bg-[#003399] text-white shadow-xl scale-105' : 'bg-white text-slate-400 border border-slate-100'}`}>
                    <span className="text-[9px] font-black uppercase opacity-60 mb-1">
                      {dateObj.toLocaleDateString('ko-KR', { weekday: 'short' })}
                    </span>
                    <span className="text-2xl md:text-3xl font-black">{dateObj.getDate()}</span>
                    <span className="text-[9px] mt-2 font-bold opacity-40 uppercase">
                      {dateObj.toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="k-card p-6 md:p-16 min-h-[500px] border-t-8 border-t-[#A9DDF3]">
              {itinerary.map((day, idx) => (
                <DayCard 
                  key={day.date}
                  day={day}
                  dayNumber={idx + 1}
                  isActive={selectedIdx === idx}
                  onAddItem={() => setShowAddModal(true)}
                  onRemoveItem={removeItem}
                />
              ))}
            </div>
          </div>
        )}

        {view === 'booking' && (
          <div className="animate-k space-y-6 md:space-y-8 pb-10">
            <div className="flex justify-center md:justify-end px-2 mb-2">
               <button 
                  onClick={() => setShowVoucherModal(true)} 
                  className="w-full md:w-auto kal-gradient text-white px-8 py-4 rounded-[1.5rem] font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                 <i className="fa-solid fa-plus-circle"></i>
                 예약 정보 추가 (Add Reservation)
               </button>
            </div>
            
            {vouchers.length === 0 ? (
               <div className="py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[3rem] text-slate-300 bg-white/50">
                 <i className="fa-solid fa-ticket-simple text-4xl mb-4 opacity-10"></i>
                 <p className="font-bold text-lg">저장된 예약 정보가 없습니다</p>
                 <p className="text-xs tracking-widest uppercase opacity-60 font-black">No vouchers stored</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {vouchers.map(v => (
                   <div key={v.id} className="k-card p-8 border-l-[10px] border-l-[#A9DDF3] relative group hover:shadow-2xl transition-all duration-300">
                      <div className="flex justify-between items-start mb-6">
                        <span className="bg-[#003399]/5 text-[#003399] text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider">{v.type}</span>
                        <button onClick={() => removeVoucher(v.id)} className="w-8 h-8 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-all">
                          <i className="fa-solid fa-trash-can text-sm"></i>
                        </button>
                      </div>
                      <h4 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{v.title}</h4>
                      <p className="text-sm text-slate-400 font-bold mb-6 flex items-center gap-2">
                        <i className="fa-solid fa-calendar-day opacity-40"></i>
                        {v.date ? `${v.date}` : 'TBD'}
                      </p>
                      <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                        <span className="text-xs font-black text-emerald-500 flex items-center gap-2 uppercase tracking-widest">
                          <i className="fa-solid fa-circle-check"></i> {v.status}
                        </span>
                        {v.note && <span className="text-[10px] text-slate-300 font-bold italic truncate max-w-[120px]">{v.note}</span>}
                      </div>
                   </div>
                 ))}
               </div>
            )}
          </div>
        )}

        {view === 'share' && (
          <div className="animate-k space-y-6 pb-10">
            <div className="k-card p-10 md:p-14">
               <h3 className="text-3xl md:text-4xl font-namsan font-black mb-10 text-slate-900 tracking-tight">Management | 설정</h3>
               <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button onClick={exportTripData} className="w-full py-5 bg-[#003399] text-white rounded-[2rem] font-black shadow-xl hover:bg-[#002673] transition-all flex items-center justify-center gap-3">
                      <i className="fa-solid fa-download"></i>
                      데이터 백업 (Export)
                    </button>
                    <button onClick={handleImportClick} className="w-full py-5 bg-white border-2 border-[#003399] text-[#003399] rounded-[2rem] font-black shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                      <i className="fa-solid fa-upload"></i>
                      데이터 불러오기 (Import)
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileImport} className="hidden" accept=".json" />
                  </div>
                  
                  <div className="h-6"></div>
                  <hr className="border-slate-100" />
                  <div className="h-6"></div>
                  
                  <button onClick={resetAllData} className="w-full py-5 bg-white text-rose-500 border border-rose-100 rounded-[2rem] font-black hover:bg-rose-50 transition-all">
                    전체 데이터 초기화 (Reset All Data)
                  </button>
               </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Itinerary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center modal-backdrop p-0 md:p-6">
           <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl animate-k">
              <div className="bg-[#003399] p-8 text-white flex justify-between items-center rounded-t-[2.5rem] md:rounded-t-[3rem]">
                 <h3 className="text-2xl font-black font-namsan">일정 추가 (Add Activity)</h3>
                 <button onClick={() => setShowAddModal(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="p-10 space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">활동 명칭 (Activity Name)</label>
                    <input type="text" placeholder="e.g. Gwangjang Market" value={newActivity.activity} onChange={e => setNewActivity({...newActivity, activity: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">위치 (Location)</label>
                       <input type="text" placeholder="Location" value={newActivity.location} onChange={e => setNewActivity({...newActivity, location: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">시간 (Time)</label>
                       <input type="time" value={newActivity.time} onChange={e => setNewActivity({...newActivity, time: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Naver Map Link (선택)</label>
                    <input type="text" placeholder="Naver Map link" value={newActivity.naverUrl} onChange={e => setNewActivity({...newActivity, naverUrl: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                 </div>
                 <button onClick={handleManualAdd} className="w-full py-5 bg-[#003399] text-white rounded-[2rem] font-black shadow-xl mt-4">일정 저장 (Save)</button>
              </div>
           </div>
        </div>
      )}

      {/* Add Voucher Modal */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center modal-backdrop p-0 md:p-6">
           <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[3rem] shadow-2xl animate-k">
              <div className="bg-[#003399] p-8 text-white flex justify-between items-center rounded-t-[2.5rem] md:rounded-t-[3rem]">
                 <h3 className="text-2xl font-black font-namsan">예약 정보 추가 (New Reservation)</h3>
                 <button onClick={() => setShowVoucherModal(false)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><i className="fa-solid fa-xmark text-xl"></i></button>
              </div>
              <div className="p-10 space-y-6 max-h-[75vh] overflow-y-auto hide-scrollbar">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">명칭 (Title / Name)</label>
                    <input type="text" placeholder="e.g. Grand Hyatt Seoul" value={newVoucher.title} onChange={e => setNewVoucher({...newVoucher, title: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">유형 (Type)</label>
                      <select value={newVoucher.type} onChange={e => setNewVoucher({...newVoucher, type: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3] appearance-none">
                        <option value="Accommodation">숙소 (Accommodation)</option>
                        <option value="Flight">항공 (Flight)</option>
                        <option value="Activity">활동 (Activity)</option>
                        <option value="Restaurant">식당 (Restaurant)</option>
                        <option value="Transportation">교통 (Transportation)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">날짜 (Date)</label>
                      <input type="date" value={newVoucher.date} onChange={e => setNewVoucher({...newVoucher, date: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                    </div>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">상태 (Status)</label>
                    <input type="text" placeholder="e.g. Confirmed" value={newVoucher.status} onChange={e => setNewVoucher({...newVoucher, status: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3]" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">메모 (Notes)</label>
                    <textarea placeholder="Address, Confirmation Code, etc." value={newVoucher.note} onChange={e => setNewVoucher({...newVoucher, note: e.target.value})} className="w-full bg-slate-50 p-5 rounded-2xl font-bold border-none focus:ring-2 focus:ring-[#A9DDF3] h-28 resize-none" />
                 </div>
                 <button onClick={handleVoucherAdd} className="w-full py-5 bg-[#003399] text-white rounded-[2rem] font-black shadow-xl mt-4">예약 저장 (Save)</button>
              </div>
           </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 glass-nav px-10 py-5 rounded-[2.5rem] shadow-2xl flex items-center gap-16 z-50 border border-white/50 w-[90%] md:w-auto justify-around">
        {[
          { id: 'itinerary', icon: 'fa-calendar-days', label: '일정' },
          { id: 'booking', icon: 'fa-ticket', label: '예약' },
          { id: 'share', icon: 'fa-gears', label: '설정' }
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id as any)} className={`flex flex-col items-center transition-all ${view === item.id ? 'text-[#003399] scale-110' : 'text-slate-300 hover:text-slate-400'}`}>
            <i className={`fa-solid ${item.icon} text-2xl mb-1.5`}></i>
            <span className="text-[10px] font-black tracking-widest uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
