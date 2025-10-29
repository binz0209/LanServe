export default function StatCard({ icon, label, value }) {
    return (
        <div className="card p-4 flex items-center gap-3">
            <div className="h-10 w-10 grid place-items-center rounded-xl bg-slate-100 text-xl">{icon}</div>
            <div>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-lg font-semibold">{value}</div>
            </div>
        </div>
    )
}