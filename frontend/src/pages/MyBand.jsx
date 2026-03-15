import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import { Users, Music, Phone, Instagram, LogOut, Plus, AlertCircle, Send, MessageSquare } from 'lucide-react'; // 👈 เติม 2 ตัวหลัง
import { Settings, Trash2, UserMinus, Save, X, Check } from 'lucide-react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

export default function MyBand() {
  // 🚨 1. สร้าง State แบบแยกหน้าที่กันชัดเจน
  const [bands, setBands] = useState([]); // เก็บ "รายชื่อวงทั้งหมด" (Array)
  const [band, setBand] = useState(null); // เก็บ "วงที่กำลังถูกเลือกดูอยู่" (Object)
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State สำหรับฟอร์มสร้างวงใหม่
  const [isEditingBand, setIsEditingBand] = useState(false);
  const [editData, setEditData] = useState({ name: "", ig: "", phone: "" });

  // ==========================================
  // 🚨 State สำหรับระบบแชท
  // ==========================================
  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const messagesEndRef = useRef(null); // เอาไว้ให้แชทเลื่อนลงมาล่างสุดอัตโนมัติ
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const currentUser = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  // ดึงข้อมูลวงของเรา
// ดึงข้อมูลวงของเรา
  const fetchMyBand = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/bands/my-bands');
      setBands(response.data); 
      
      if (response.data && response.data.length > 0) {
        // 🚨 ทริค: ใช้ Callback ใน setBand เพื่อดูว่า "ก่อนหน้านี้เราดูวงไหนอยู่?"
        setBand((prevBand) => {
          // 1. ถ้าก่อนหน้านี้ดูวงไหนอยู่ ให้หาข้อมูล "วงเดิม" ที่เพิ่งอัปเดตมาโชว์
          if (prevBand) {
            const updatedBand = response.data.find(b => b._id === prevBand._id);
            if (updatedBand) return updatedBand; // คืนค่าวงเดิม (แต่ข้อมูลใหม่)
          }
          
          // 2. ถ้าเพิ่งโหลดหน้าเว็บครั้งแรก (ยังไม่มีวงเดิม) ให้หาวงแรกที่เราเป็นสมาชิกมาโชว์
          const activeBand = response.data.find(
            b => !b.pendingMembers?.some(m => m._id === currentUser?._id || m === currentUser?._id)
          );
          return activeBand || null;
        });
      } else {
        setBand(null);
      }
      
    } catch (error) {
      console.error(error);
      setError("ไม่สามารถโหลดข้อมูลวงได้");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyBand();
  }, []);

  // ฟังก์ชันออกจากวง
  const handleLeaveBand = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากวงนี้? ความทรงจำดีๆ จะหายไปนะ! 😢")) return;
    try {
      // 🚨 เติม ID วงที่เรากำลังดูอยู่เข้าไปใน URL เพื่อบอกให้หลังบ้านรู้ว่าเราจะออกวงไหน
      await api.put(`/bands/${band._id}/leave`);
      
      // พอกดออกสำเร็จ ให้โหลดข้อมูลวงทั้งหมดของเราใหม่ (วงที่เพิ่งออกจะได้หายไปจากจอ)
      fetchMyBand(); 
      
    } catch (err) {
      alert("เกิดข้อผิดพลาด: " + (err.response?.data?.message || err.message));
    }
  };

  // 1. ฟังก์ชันอัปเดตวง
  const handleUpdateBand = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/bands/${band._id}`, {
        name: editData.name,
        socialLinks: { ig: editData.ig, phone: editData.phone }
      });
      setIsEditingBand(false);
      fetchMyBand(); // โหลดข้อมูลใหม่
    } catch (err) {
      alert("แก้ข้อมูลไม่ได้: " + err.message);
    }
  };

  // 2. ฟังก์ชันเตะสมาชิก
  const handleKickMember = async (memberId) => {
    if (!window.confirm("แน่ใจนะว่าจะเตะสมาชิกคนนี้ออกจากวง?")) return;
    try {
      await api.delete(`/bands/${band._id}/members/${memberId}`);
      fetchMyBand();
    } catch (err) {
      alert("เตะไม่ได้: " + err.message);
    }
  };

  // 3. ฟังก์ชันยุบวง
  const handleDeleteBand = async () => {
    if (!window.confirm("อันตราย! 🚨 คุณแน่ใจที่จะ 'ยุบวง' นี้ใช่ไหม? ข้อมูลทั้งหมดจะหายไปเลยนะ!")) return;
    try {
      await api.delete(`/bands/${band._id}`);
      setBand(null);
      fetchMyBand();
    } catch (err) {
      alert("ยุบวงไม่ได้: " + err.message);
    }
  };

  // ==========================================
  // 🚨 ฟังก์ชันจัดการคำขอเข้าวง
  // ==========================================
  const handleAcceptMember = async (userId) => {
    try {
      await api.put(`/bands/${band._id}/accept/${userId}`);
      fetchMyBand(); // โหลดข้อมูลใหม่
    } catch (err) {
      alert("รับสมาชิกไม่ได้: " + err.message);
    }
  };

  const handleRejectMember = async (userId) => {
    if (!window.confirm("ต้องการปฏิเสธคำขอนี้ใช่ไหม?")) return;
    try {
      await api.put(`/bands/${band._id}/reject/${userId}`);
      fetchMyBand();
    } catch (err) {
      alert("ปฏิเสธไม่ได้: " + err.message);
    }
  };

  // ==========================================
  // 🚨 ฟังก์ชันระบบแชท
  // ==========================================
  // 1. ดึงข้อความแชท
  const fetchMessages = async (bandId) => {
    try {
      const response = await api.get(`/bands/${bandId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("โหลดแชทไม่ขึ้น:", error);
    }
  };

  // 2. ถ้ามีการเปลี่ยนวง (กดแถบสีเหลือง) หรือโหลดวงเสร็จ ให้ไปดึงแชทของวงนั้นมาโชว์
  useEffect(() => {
    if (band?._id) {
      fetchMessages(band._id);
    }
  }, [band?._id]);

  // 3. เลื่อนแชทลงล่างสุดทุกครั้งที่มีข้อความใหม่
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. ฟังก์ชันกดส่งแชท
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatText.trim()) return; // ถ้าไม่ได้พิมพ์อะไร ห้ามส่ง

    try {
      const response = await api.post(`/bands/${band._id}/messages`, { text: chatText });
      // เอาข้อความใหม่ไปต่อท้ายข้อความเดิม
      setMessages((prev) => [...prev, response.data]); 
      setChatText(""); // ล้างช่องพิมพ์
    } catch (err) {
      alert("ส่งข้อความไม่ได้: " + err.message);
    }
  };

  if (isLoading) {
    return <div className="text-center font-bold py-20 uppercase animate-pulse">Loading Band Data... 🥁</div>;
  }

  return (
    <div className="max-w-3xl mx-auto font-sans pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
          <Users size={32} className="text-black" /> 
          My Band
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-4 border-red-500 rounded-xl font-bold flex items-center gap-2">
          <AlertCircle className="text-red-500" /> {error}
        </div>
      )}

    {/* ========================================== */}
    {/* กรณีที่ยังไม่มีวงดนตรี */}
    {/* ========================================== */}
      {!band && !error ? (
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 text-center animate-in fade-in">
          <h2 className="text-2xl font-black uppercase mb-4">You don't have a band yet</h2>
          <p className="text-gray-600 font-bold mb-8">
            คุณยังไม่ได้สังกัดวงดนตรีใดๆ ไปที่หน้า VibeHub เพื่อสร้างโพสต์ <span className="text-yellow-500 font-black">BandFinder</span> และตั้งวงของคุณเลย!
          </p>
          
          <button 
            // 🚨 เปลี่ยนเป้าหมายในวงเล็บ '/' เป็น path หน้า Feed ของคุณ (เช่น '/feed', '/home' หรือ '/')
            onClick={() => navigate('/hub')} 
            className="flex items-center justify-center gap-2 w-full md:w-auto mx-auto px-6 py-3 text-lg font-black uppercase transition bg-yellow-400 border-4 border-black rounded-xl hover:bg-yellow-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            <Plus size={24} /> Go to Create Post
          </button>
        </div>
      ) : band ? (
        
        /* ========================================== */
        /* กรณีที่มีวงดนตรีแล้ว โชว์ข้อมูลวงจัดเต็ม! */
        /* ========================================== */
        <div className="animate-in fade-in duration-300">
          
          {/* แถบปุ่มกดสลับวงดนตรี (จะโชว์ก็ต่อเมื่อมีมากกว่า 1 วง) */}
          {bands.length > 1 && (
            <div className="flex overflow-x-auto gap-4 mb-6 pb-4 no-scrollbar">
              {bands.map((b) => {
                // 🚨 เช็คว่าเราเป็นแค่คนรออนุมัติในวงนี้หรือเปล่า?
                const isPending = b.pendingMembers?.some(m => m._id === currentUser?._id || m === currentUser?._id);

                return (
                  <button
                    key={b._id}
                    onClick={() => !isPending && setBand(b)} // ถ้า pending อยู่ ห้ามกด!
                    disabled={isPending}
                    className={`whitespace-nowrap px-6 py-3 font-black uppercase border-4 rounded-xl transition ${
                      isPending 
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed border-dashed' // สไตล์ปุ่มตอนรออนุมัติ (สีจาง)
                        : band?._id === b._id 
                          ? 'bg-yellow-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black' 
                          : 'bg-white text-gray-400 border-gray-300 hover:border-black hover:text-black'
                    }`}
                  >
                    {b.name} {isPending && <span className="text-xs ml-2 text-yellow-600">(Pending)</span>}
                  </button>
                );
              })}
            </div>
          )}
          
          {/* Card ข้อมูลวง */}
          <div className="bg-black text-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 text-white opacity-10 rotate-12 pointer-events-none">
              <Music size={200} />
            </div>
            
            <div className="relative z-10">
              {/* 🚨 ตัวแปรเช็คว่าเป็นหัวหน้าไหม (ใส่ไว้บนสุดของกล่องนี้) */}
              {(() => {
                const isCurrentUserLeader = band.leader?._id === currentUser?._id || band.leader === currentUser?._id;
                return (
                  <>
                    <div className="flex justify-between items-start">
                      <h2 className="text-4xl md:text-6xl font-black uppercase tracking-widest mb-4 text-yellow-400">
                        {band.name}
                      </h2>
                      
                      {/* ปุ่ม Settings & Delete Band (โชว์เฉพาะ Leader) */}
                      {isCurrentUserLeader && (
                        <div className="flex gap-2">
                          <button onClick={() => { setEditData({ name: band.name, ig: band.socialLinks?.ig || "", phone: band.socialLinks?.phone || "" }); setIsEditingBand(!isEditingBand); }} className="p-2 bg-white text-black rounded-lg hover:bg-yellow-400 transition border-2 border-transparent hover:border-black">
                            {isEditingBand ? <X size={24}/> : <Settings size={24} />}
                          </button>
                          <button onClick={handleDeleteBand} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition border-2 border-transparent hover:border-black">
                            <Trash2 size={24} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ฟอร์มแก้ไขข้อมูลวง (โชว์ตอนกดปุ่ม Settings) */}
                    {isEditingBand ? (
                      <form onSubmit={handleUpdateBand} className="bg-white p-4 rounded-xl text-black border-4 border-black mb-6 animate-in fade-in">
                        <div className="grid grid-cols-1 gap-4 mb-4">
                          <input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="ชื่อวง" className="p-2 border-2 border-black rounded font-bold" />
                          <input value={editData.ig} onChange={e => setEditData({...editData, ig: e.target.value})} placeholder="Instagram URL/Username" className="p-2 border-2 border-black rounded font-bold" />
                          <input value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} placeholder="เบอร์โทรติดต่อรับงาน" className="p-2 border-2 border-black rounded font-bold" />
                        </div>
                        <button type="submit" className="w-full bg-yellow-400 font-black uppercase py-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 hover:shadow-none transition"><Save className="inline mr-2" size={18}/> บันทึกการเปลี่ยนแปลง</button>
                      </form>
                    ) : (
                      /* โชว์ข้อมูล Contact แบบเดิม */
                      <div className="flex gap-6 mt-6 pt-6 border-t-2 border-gray-800">
                        <div className="flex items-center gap-2 font-bold"><Instagram size={20} className="text-pink-500" /> {band.socialLinks?.ig || "ยังไม่ระบุ IG"}</div>
                        <div className="flex items-center gap-2 font-bold"><Phone size={20} className="text-green-500" /> {band.socialLinks?.phone || "ยังไม่ระบุเบอร์โทร"}</div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* ========================================== */}
          {/* 🚨 ส่วนจัดการคำขอเข้าวง (โชว์เฉพาะ Leader) */}
          {/* ========================================== */}
          {(() => {
            const isCurrentUserLeader = band.leader?._id === currentUser?._id || band.leader === currentUser?._id;
            
            if (isCurrentUserLeader && band.pendingMembers?.length > 0) {
              return (
                <div className="mb-8">
                  <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-yellow-400 pb-2 flex items-center gap-2 text-black">
                    Pending Requests ({band.pendingMembers.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
                    {band.pendingMembers.map((reqUser, index) => (
                      <div key={index} className="bg-yellow-50 border-4 border-dashed border-yellow-400 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 border-2 border-black rounded-full overflow-hidden shrink-0">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${reqUser.username}`} alt="Avatar" className="w-full h-full object-cover"/>
                        </div>
                        <div className="flex-1">
                          {/* 🚨 ทำให้ชื่อคลิกได้ เพื่อไปหน้า Profile */}
                          <h3 
                            onClick={() => navigate(`/profile/${reqUser._id}`)} 
                            className="font-black uppercase text-lg cursor-pointer hover:underline hover:text-blue-600 transition"
                            title="คลิกเพื่อดูโปรไฟล์"
                          >
                            {reqUser.displayName || reqUser.username}
                          </h3>
                          <span className="text-sm font-bold text-gray-500 uppercase">{reqUser.majorInstrument || "Unknown"}</span>
                        </div>
                        
                        {/* ปุ่มรับ/ปฏิเสธ */}
                        <div className="flex gap-2">
                          <button onClick={() => handleAcceptMember(reqUser._id)} className="p-2 bg-green-500 text-white rounded-lg border-2 border-black hover:bg-green-600 hover:-translate-y-1 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none" title="รับเข้าวง">
                            <Check size={20} />
                          </button>
                          <button onClick={() => handleRejectMember(reqUser._id)} className="p-2 bg-red-500 text-white rounded-lg border-2 border-black hover:bg-red-600 hover:-translate-y-1 transition shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none" title="ปฏิเสธ">
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {/* รายชื่อสมาชิก */}
          <h2 className="text-xl font-black uppercase mb-4 border-b-4 border-black pb-2 flex items-center justify-between">
            Band Members ({band.members?.length || 0})
            
            {/* ปุ่มออกจากวง */}
            <button 
              onClick={handleLeaveBand}
              className="flex items-center gap-2 text-sm font-bold bg-red-500 text-white border-2 border-black px-3 py-1 rounded-lg hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition uppercase active:translate-y-1 active:shadow-none"
            >
              <LogOut size={16} /> Leave Band
            </button>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {band.members?.map((member, index) => {
              const isLeader = member._id === (band.leader?._id || band.leader);

              return (
                <div key={index} className="bg-white text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 border-2 border-black rounded-full overflow-hidden shrink-0">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username || 'default'}`} 
                      alt="Member Avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black uppercase text-lg">
                      {member.displayName || member.username || "Unknown User"}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-500 uppercase">
                        {member.majorInstrument || "Member"}
                      </span>
                      {isLeader && (
                        <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded font-black border border-black uppercase">
                          Leader
                        </span>
                      )}
                    </div>
                  </div>
                  {/* 🚨 ปุ่มเตะสมาชิก (โชว์เมื่อเราเป็น Leader และคนๆ นี้ไม่ใช่ Leader) */}
                  {(band.leader?._id === currentUser?._id || band.leader === currentUser?._id) && !isLeader && (
                    <button 
                      onClick={() => handleKickMember(member._id)}
                      className="ml-auto p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                      title="เตะออกจากวง"
                    >
                      <UserMinus size={20} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* ========================================== */}
          {/* 🚨 ห้องแชทของวง (BAND CHAT) */}
          {/* ========================================== */}

          <div className="mt-12 bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden flex flex-col h-[500px]">
            {/* หัวกล่องแชท */}
            <div className="bg-black text-white p-4 flex items-center gap-3">
              <MessageSquare size={24} className="text-yellow-400" />
              <h2 className="text-xl font-black uppercase tracking-widest">Band Chat</h2>
            </div>

            {/* พื้นที่แสดงข้อความ */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 font-bold my-auto uppercase">
                  เริ่มคุยกับเพื่อนในวงเลย! 🎸
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender?._id === currentUser?._id;

                  return (
                    <div key={index} className={`flex gap-3 max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
                      {/* รูปโปรไฟล์คนส่ง (ถ้าเป็นเราไม่ต้องโชว์ก็ได้ หรือจะโชว์ก็สลับฝั่งเอา) */}
                      {!isMe && (
                        <div className="w-10 h-10 shrink-0 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender?.username}`} alt="Avatar" className="w-full h-full object-cover"/>
                        </div>
                      )}
                      
                      <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                        {/* ชื่อคนส่ง */}
                        {!isMe && <span className="text-xs font-bold text-gray-500 mb-1 ml-1">{msg.sender?.displayName || msg.sender?.username}</span>}
                        
                        {/* กล่องข้อความ */}
                        <div className={`px-4 py-3 rounded-2xl border-2 border-black font-medium text-black ${
                          isMe 
                            ? 'bg-yellow-400 rounded-tr-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
                            : 'bg-white rounded-tl-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              {/* จุดอ้างอิงสำหรับเลื่อนจอลงล่างสุด */}
              <div ref={messagesEndRef} /> 
            </div>

            {/* ช่องพิมพ์ข้อความ */}
            <form onSubmit={handleSendMessage} className="p-4 text-black bg-white border-t-4 border-black flex gap-3">
              <input
                type="text"
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="พิมพ์ข้อความ..."
                className="flex-1 px-4 py-3 bg-gray-100 border-2 border-black rounded-xl focus:ring-4 focus:ring-yellow-400 outline-none font-bold transition"
              />
              <button 
                type="submit"
                disabled={!chatText.trim()}
                className="bg-black text-white px-6 py-3 rounded-xl border-2 border-black hover:bg-gray-800 transition shadow-[4px_4px_0px_0px_rgba(253,224,71,1)] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        </div>
    </div> /* 🚨 ปิด div ของกล่อง animate-in ตรงนี้ครับ! */
      ) : null} 
      
    </div> /* ปิด div กล่องใหญ่สุดของหน้าเว็บ */
  );
}