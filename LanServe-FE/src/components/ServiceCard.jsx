import Button from './ui/button'
export default function ServiceCard({ name, price, days, edits }) {
    return (
        <div className="card">
            <div className="card-body space-y-2">
                <div className="font-semibold">{name}</div>
                <div className="text-sm text-slate-500">{days} • {edits}</div>
                <div className="text-right text-brand-700 font-semibold text-lg">{price.toLocaleString('vi-VN')} đ</div>
                <Button className="w-full">Đặt dịch vụ</Button>
            </div>
        </div>
    )
}