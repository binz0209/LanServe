export default function ReviewCard({ author, role, stars, time, content }) {
    return (
        <div className="card"><div className="card-body">
            <div className="flex items-center justify-between">
                <div><div className="font-medium">{author}</div><div className="text-sm text-slate-500">{role} • {time}</div></div>
                <div>{'⭐'.repeat(stars)}</div>
            </div>
            <p className="mt-3 text-slate-700 text-sm">{content}</p>
        </div></div>
    )
}