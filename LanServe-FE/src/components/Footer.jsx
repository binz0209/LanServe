export default function Footer() {
    return (
        <footer className="mt-16 bg-slate-900 text-slate-200">
            <div className="container-ld grid md:grid-cols-4 gap-8 py-12">
                <div>
                    <div className="text-lg font-semibold">LanServe</div>
                    <p className="mt-3 text-sm text-slate-400">Nền tảng kết nối freelancer & khách hàng. Xây dựng sự nghiệp tự do và tìm kiếm dự án phù hợp.</p>
                    <div className="mt-4 flex gap-3 text-xl"><span>🐦</span><span>💼</span><span>🔗</span></div>
                </div>
                <div>
                    <div className="font-semibold">Liên kết nhanh</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        <li>Trang chủ</li><li>Tìm Freelancer</li><li>Đăng dự án</li><li>Cách hoạt động</li><li>Về chúng tôi</li>
                    </ul>
                </div>
                <div>
                    <div className="font-semibold">Hỗ trợ</div>
                    <ul className="mt-3 space-y-2 text-sm text-slate-300">
                        <li>Trung tâm trợ giúp</li><li>Liên hệ</li><li>Điều khoản</li><li>Bảo mật</li><li>FAQ</li>
                    </ul>
                </div>
                <div className="md:text-right text-sm text-slate-400 flex items-end">© 2024 LanServe.</div>
            </div>
        </footer>
    )
}