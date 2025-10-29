export default function SkillBar({ label, value }) {
    return (
        <div>
            <div className="flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div>
            <div className="mt-1 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-brand-600" style={{ width: `${value}%` }} />
            </div>
        </div>
    )
}