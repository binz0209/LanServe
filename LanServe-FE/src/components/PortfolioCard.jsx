export default function PortfolioCard({ title, views, likes }) {
    return (
        <div className="card overflow-hidden">
            <div className="h-40 bg-slate-200" />
            <div className="card-body">
                <div className="font-medium">{title}</div>
                <div className="text-sm text-slate-500 mt-1">👁️ {views} • ❤️ {likes}</div>
            </div>
        </div>
    )
}