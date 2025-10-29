import { Outlet, NavLink } from 'react-router-dom'
export default function FreelancerLayout() {
    const tabs = [{ to: 'intro', label: 'Giới thiệu' }, { to: 'services', label: 'Dịch vụ' }, { to: 'portfolio', label: 'Portfolio' }, { to: 'reviews', label: 'Đánh giá' }]
    return (
        <div className="container-ld py-8">
            <div className="card overflow-hidden">
                <div className="h-32 bg-[linear-gradient(45deg,#1d4ed8,#f97316)]" />
                <div className="p-5 flex items-center justify-between"><div className="text-xl font-semibold">Nguyễn Minh Anh</div><button className="btn btn-outline">Nhắn tin</button></div>
                <div className="px-5 border-t"><nav className="flex gap-2 overflow-x-auto">{tabs.map(t => <NavLink key={t.to} to={t.to} className={({ isActive }) => `tab ${isActive ? 'tab-active' : ''}`}>{t.label}</NavLink>)}</nav></div>
            </div>
            <div className="mt-6"><Outlet /></div>
        </div>
    )
}