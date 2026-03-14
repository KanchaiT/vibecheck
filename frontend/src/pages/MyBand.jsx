import React from 'react';
import { Users, Star, Instagram, Phone, LogOut } from 'lucide-react';

export default function MyBand() {
  // Mock Data จำลองข้อมูลวงดนตรี
  const bandData = {
    name: "THE STATIC NOISE",
    genres: ["ALT-ROCK", "GRUNGE"],
    contact: {
      ig: "@thestaticnoise_official",
      phone: "085-417-2908" // อิงจากเบอร์ติดต่อในหน้าสไลด์ครับ
    },
    members: [
      { id: 1, username: "NIGHT_RIDER_99", role: "Lead Vocals", isLeader: true },
      { id: 2, username: "KANCHAI_VIBES", role: "Electric Guitar", isLeader: false },
      { id: 3, username: "BASS_MONSTER", role: "Bass", isLeader: false },
      { id: 4, username: "DRUM_MACHINE", role: "Drums", isLeader: false }
    ]
  };

  const handleLeaveBand = () => {
    // ฟังก์ชันจำลองการกดออกจากวง (เดี๋ยวเราค่อยเอา Axios มาต่อยิง API ไป Backend ทีหลัง)
    const confirmLeave = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากวง THE STATIC NOISE?");
    if (confirmLeave) {
      alert("คุณได้ออกจากวงเรียบร้อยแล้ว (Mock)");
    }
  };

  return (
    <div className="max-w-3xl mx-auto font-sans">
      
      {/* Header ของหน้า My Band */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b-4 border-black">
        <h1 className="text-3xl font-black uppercase tracking-widest flex items-center gap-3">
          <Users size={32} /> My Band
        </h1>
      </div>

      {/* ข้อมูลวง */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-8 mb-8">
        
        {/* ส่วนหัว: ชื่อวง แนวเพลง และช่องทางติดต่อ */}
        <div className="text-center mb-8 border-b-4 border-black pb-8">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-widest mb-4">{bandData.name}</h2>
          
          <div className="flex justify-center gap-2 mb-6">
            {bandData.genres.map((genre, index) => (
              <span key={index} className="px-3 py-1 text-sm font-bold text-black uppercase bg-yellow-400 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                #{genre}
              </span>
            ))}
          </div>

          {/* ช่องทางติดต่อวง */}
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <div className="flex items-center gap-2 font-bold text-sm bg-gray-100 px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-200 transition cursor-pointer">
              <Instagram size={18} /> {bandData.contact.ig}
            </div>
            <div className="flex items-center gap-2 font-bold text-sm bg-gray-100 px-4 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-200 transition cursor-pointer">
              <Phone size={18} /> {bandData.contact.phone}
            </div>
          </div>
        </div>

        {/* รายชื่อสมาชิก */}
        <div>
          <h3 className="text-xl font-black uppercase mb-4">Band Members</h3>
          <div className="space-y-4">
            {bandData.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 bg-gray-100 border-2 border-black rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-300 border-2 border-black rounded-full overflow-hidden shrink-0">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-black text-lg md:text-xl uppercase flex items-center gap-2">
                      {member.username} 
                      {member.isLeader && <Star size={18} className="text-yellow-500 fill-yellow-500" title="Band Leader" />}
                    </p>
                    <p className="text-sm font-bold text-gray-600 uppercase">{member.role}</p>
                  </div>
                </div>
                {member.username === "KANCHAI_VIBES" && (
                  <span className="bg-black text-white px-3 py-1 rounded-md text-xs font-bold uppercase hidden md:inline-block">You</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ปุ่ม Leave Band */}
        <div className="mt-8 pt-6 border-t-4 border-black flex justify-center">
          <button 
            onClick={handleLeaveBand}
            className="flex items-center gap-2 px-8 py-4 text-lg font-black text-white uppercase transition bg-red-500 border-4 border-black rounded-xl hover:bg-red-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none"
          >
            <LogOut size={24} /> Leave Band
          </button>
        </div>

      </div>

    </div>
  );
}