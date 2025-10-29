import Button from '../components/ui/button'
export default function HowItWorks() {
    return (
        <div>
            <section className="bg-gradient-to-r from-blue-50 to-orange-50 border-b">
                <div className="container-ld py-16 text-center">
                    <h1 className="text-4xl font-bold">Cách hoạt động của <span className="text-brand-700">LanServe</span></h1>
                    <p className="mt-3 text-slate-600">Quy trình đơn giản 3 bước để hoàn thành dự án hiệu quả.</p>
                    <Button className="mt-6">Bắt đầu dự án ngay</Button>
                </div>
            </section>
            <section className="container-ld py-12 grid md:grid-cols-3 gap-5">
                {[{ t: 'Đăng dự án', d: ['Tạo brief rõ ràng', 'Gợi ý ngân sách', 'Chọn kỹ năng liên quan'] }, { t: 'Chọn freelancer', d: ['Xem hồ sơ & review', 'Trao đổi trước khi chốt', 'Ký điều khoản'] }, { t: 'Nhận sản phẩm', d: ['Theo dõi tiến độ', 'Review & phản hồi', 'Thanh toán an toàn'] }].map(b => (
                    <div key={b.t} className="card p-6">
                        <div className="text-3xl">🧩</div>
                        <div className="mt-3 font-semibold">{b.t}</div>
                        <ul className="mt-2 text-sm text-slate-600 list-disc list-inside space-y-1">{b.d.map(x => <li key={x}>{x}</li>)}</ul>
                    </div>
                ))}
            </section>
        </div>
    )
}