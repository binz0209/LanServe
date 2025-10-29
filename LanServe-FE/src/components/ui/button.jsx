import { clsx } from 'clsx'
export default function Button({ as: Tag = 'button', variant = 'primary', className = '', ...props }) {
    const base = 'btn'; const map = { primary: 'btn-primary', outline: 'btn-outline', ghost: 'btn-ghost' }
    return <Tag className={clsx(base, map[variant], className)} {...props} />
}