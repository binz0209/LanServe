import { useState } from 'react'
export default function Tabs({ tabs = [], initial = 0, onChange }) {
    const [i, setI] = useState(initial)
    return (
        <div>
            <div className="flex gap-2 border-b border-slate-200">
                {tabs.map((t, idx) => (
                    <button key={t.key || idx} onClick={() => { setI(idx); onChange?.(idx) }} className={`tab ${i === idx ? 'tab-active' : ''}`}>{t.label}</button>
                ))}
            </div>
            <div className="pt-4">{tabs[i]?.content}</div>
        </div>
    )
}