import SkillBar from '../../components/SkillBar'
export default function Intro() {
    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <aside className="space-y-6">
                <div className="card p-5"><div className="font-semibold">Mức giá</div><div className="mt-2 text-2xl text-brand-700 font-semibold">500.000 đ/giờ</div><div className="text-xs text-slate-500">Giá có thể đàm phán</div></div>
                <div className="card p-5"><div className="font-semibold mb-3">Ngôn ngữ</div><div className="flex gap-2 flex-wrap"><span className="badge">Tiếng Việt</span><span className="badge">English</span><span className="badge">中</span></div></div>
                <div className="card p-5 space-y-3"><div className="font-semibold">Kỹ năng</div><SkillBar label="Figma" value={95} /><SkillBar label="Sketch" value={90} /><SkillBar label="Adobe XD" value={85} /><SkillBar label="HTML/CSS" value={75} /></div>
            </aside>
            <main className="lg:col-span-2 space-y-4"><div className="card p-5"><div className="font-semibold mb-2">Giới thiệu</div><p className="text-sm text-slate-700">Senior UI/UX Designer với 6+ năm kinh nghiệm. Ưu tiên trải nghiệm người dùng, quy trình bài bản.</p></div></main>
        </div>
    )
}