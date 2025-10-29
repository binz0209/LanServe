export default function Badge({ children, color = 'info' }) {
    const map = { success: 'badge-success', warning: 'badge-warning', info: 'badge-info' }
    return <span className={`badge ${map[color]}`}>{children}</span>
}