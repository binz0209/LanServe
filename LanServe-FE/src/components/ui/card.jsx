export function Card({ className = '', children }) { return <div className={`card ${className}`}>{children}</div> }
export function CardBody({ className = '', children }) { return <div className={`card-body ${className}`}>{children}</div> }
export function CardHeader({ className = '', children }) { return <div className={`p-5 border-b border-slate-100 ${className}`}>{children}</div> }
export function CardFooter({ className = '', children }) { return <div className={`p-5 border-t border-slate-100 ${className}`}>{children}</div> }