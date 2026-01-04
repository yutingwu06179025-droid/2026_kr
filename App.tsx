
import React, { useState, useRef, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, Timestamp } from "firebase/firestore";
import Header from './components/Header';
import DayCard from './components/DayCard';
import { DayPlan } from './types';

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA4cFMOFLHrUlfcavtXWVO0H8IvtI9dwAc",
  authDomain: "krtrip-2ae4a.firebaseapp.com",
  projectId: "krtrip-2ae4a",
  storageBucket: "krtrip-2ae4a.firebasestorage.app",
  messagingSenderId: "241609859982",
  appId: "1:241609859982:web:297a462553fff7bcfffadf",
  measurementId: "G-VHVYQE94FJ"
};

// Initialize Firebase safely
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface Spot {
  id: string;
  name: string;
  description: string;
  createdAt: any;
}

const App: React.FC = () => {
  const [view, setView] = useState<'itinerary' | 'booking' | 'shopping' | 'share'>('itinerary');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [spots, setSpots] = useState<Spot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSpotName, setNewSpotName] = useState('');
  const [newSpotDesc, setNewSpotDesc] = useState('');
  
  const defaultItinerary: DayPlan[] = [
    { date: '2026-01-09', weather: 'sun', temp: '-2', locationName: '서울', items: [{ id: 'f1', time: '07:50', activity: 'China Airlines CI 160', location: '인천공항 T1', type: 'FLIGHT', origin: 'TPE', destination: 'ICN', status: 'FIXED' }] },
    { date: '2026-01-10', weather: 'cloud', temp: '-5', locationName: '서울', items: [] },
    { date: '2026-01-11', weather: 'snow', temp: '-3', locationName: '서울', items: [] },
    { date: '2026-01-12', weather: 'sun', temp: '-4', locationName: '서울', items: [] },
    { date: '2026-01-13', weather: 'sun', temp: '-6', locationName: '서울', items: [] },
    { date: '2026-01-14', weather: 'cloud', temp: '1', locationName: '釜山', items: [] },
    { date: '2026-01-15', weather: 'sun', temp: '3', locationName: '釜山', items: [] },
    { date: '2026-01-16', weather: 'rain', temp: '5', locationName: '釜山', items: [] },
    { date: '2026-01-17', weather: 'cloud', temp: '4', locationName: '釜山', items: [{ id: 'f2', time: '19:50', activity: 'China Airlines CI 187', location: '김해공항', type: 'FLIGHT', origin: 'PUS', destination: 'TPE', status: 'FIXED' }] },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync with Firestore
  useEffect(() => {
    const q = query(collection(db, "spots"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const spotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Spot[];
      setSpots(spotsData);
      setLoading(false);
    }, (err) => {
      console.error("Firestore error:", err);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAddSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpotName.trim()) return;
    try {
      await addDoc(collection(db, "spots"), {
        name: newSpotName,
        description: newSpotDesc,
        createdAt: Timestamp.now()
      });
      setNewSpotName('');
      setNewSpotDesc('');
    } catch (e) {
      alert("資料儲存失敗，請檢查 Firestore 權限設定。");
    }
  };

  const daysKo = ['일', '월', '화', '수', '목', '금', '토'];
  const WeatherIcon = ({ type }: { type?: string }) => {
    switch(type) {
      case 'sun': return <i className="fa-solid fa-sun text-amber-400"></i>;
      case 'cloud': return <i className="fa-solid fa-cloud text-slate-300"></i>;
      case 'snow': return <i className="fa-solid fa-snowflake text-sky-200"></i>;
      case 'rain': return <i className="fa-solid fa-cloud-rain text-blue-300"></i>;
      default: return null;
    }
  };

  if (loading && spots.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0057B8] text-white">
        <div className="loading-spinner mb-6"></div>
        <p className="font-bold tracking-widest text-lg">LOADING K-JOURNEY...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="relative z-20">
        {view === 'itinerary' && (
          <div>
            {/* Date Slider */}
            <div ref={scrollRef} className="main-gradient flex gap-5 overflow-x-auto hide-scrollbar px-10 pb-24 pt-4">
              {defaultItinerary.map((day, idx) => {
                const dateObj = new Date(day.date);
                const isActive = selectedIdx === idx;
                return (
                  <button 
                    key={day.date} 
                    onClick={() => setSelectedIdx(idx)}
                    className={`date-capsule ${isActive ? 'active' : 'inactive'}`}
                  >
                    <span className="text-[11px] font-bold opacity-70 mb-0.5">{daysKo[dateObj.getDay()]}</span>
                    <span className="text-[32px] font-extrabold leading-none">{dateObj.getDate()}</span>
                    <div className="text-[22px] mt-1.5"><WeatherIcon type={day.weather} /></div>
                  </button>
                );
              })}
            </div>

            <div className="content-container">
              <div className="px-10 pt-12 animate-enter">
                {/* Firestore Spot List */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-extrabold text-[#1a1e27] tracking-tighter uppercase">DB SPOTS</h2>
                  <span className="bg-[#EBFBFF] text-[#0057B8] text-[11px] font-bold px-4 py-1.5 rounded-full border border-[#A9DDF3]/50">
                    {spots.length} PLACES
                  </span>
                </div>

                <div className="space-y-5 mb-12">
                  {spots.length === 0 ? (
                    <div className="py-12 text-center text-slate-300 font-bold border-2 border-dashed border-slate-100 rounded-[35px]">
                      Firestore에 아직 景點이 없습니다.
                    </div>
                  ) : (
                    spots.map(spot => (
                      <div key={spot.id} className="bg-white border border-slate-50 p-7 rounded-[35px] shadow-lg shadow-blue-900/5 flex items-start gap-5">
                        <div className="w-14 h-14 bg-[#EBFBFF] rounded-2xl flex items-center justify-center text-[#0057B8]">
                          <i className="fa-solid fa-location-dot text-xl"></i>
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-[#1a1e27] mb-1">{spot.name}</h4>
                          <p className="text-sm text-slate-400 font-medium">{spot.description || "설명이 없습니다."}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Add Form */}
                <div className="bg-[#0057B8]/5 rounded-[40px] p-8 border border-[#0057B8]/10 mb-12">
                   <h4 className="text-lg font-extrabold text-[#0057B8] mb-6 tracking-tight">새로운 景點 追加</h4>
                   <form onSubmit={handleAddSpot} className="space-y-4">
                      <input 
                        className="input-field" 
                        placeholder="景點 名稱" 
                        value={newSpotName}
                        onChange={e => setNewSpotName(e.target.value)}
                        required
                      />
                      <input 
                        className="input-field" 
                        placeholder="景點 描述" 
                        value={newSpotDesc}
                        onChange={e => setNewSpotDesc(e.target.value)}
                      />
                      <button type="submit" className="btn-primary w-full">Firestore에 저장</button>
                   </form>
                </div>
              </div>

              {/* Itinerary Rendering */}
              <DayCard 
                day={defaultItinerary[selectedIdx]}
                dayNumber={selectedIdx + 1}
                isActive={true}
                onAddItem={() => {}}
                onRemoveItem={() => {}}
              />
            </div>
          </div>
        )}

        {view !== 'itinerary' && (
           <div className="content-container pt-20 px-10 flex flex-col items-center justify-center text-center">
              <i className="fa-solid fa-toolbox text-6xl text-[#A9DDF3] mb-8 opacity-40"></i>
              <h2 className="text-3xl font-extrabold text-[#1a1e27] mb-4">準備中</h2>
              <p className="text-slate-400 font-bold max-w-xs leading-relaxed uppercase">
                {view} feature is coming soon.
              </p>
           </div>
        )}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="floating-nav">
        {[
          { id: 'itinerary', icon: 'fa-calendar-day', label: 'PLAN' },
          { id: 'booking', icon: 'fa-ticket-simple', label: 'VOUCHER' },
          { id: 'shopping', icon: 'fa-heart', label: 'WISH' },
          { id: 'share', icon: 'fa-rotate', label: 'SYNC' }
        ].map(item => (
          <button key={item.id} onClick={() => setView(item.id as any)} className={`flex flex-col items-center gap-2 transition-all ${view === item.id ? 'text-[#0057B8]' : 'text-slate-300'}`}>
            <i className={`fa-solid ${item.icon} text-2xl`}></i>
            <span className="text-[10px] font-extrabold tracking-[0.15em]">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
