import Button from './ui/button'
export default function EmptyState({ title = 'Không có dữ liệu', actionLabel, onAction }) {
    return (
        <div className="card"><div className="card-body text-center py-16">
            <div className="text-2xl font-semibold">{title}</div>
            {actionLabel && <Button className="mt-4" onClick={onAction}>{actionLabel}</Button>}
        </div></div>
    )
}