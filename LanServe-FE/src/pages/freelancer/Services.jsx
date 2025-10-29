import { services } from '../../lib/mock'
import ServiceCard from '../../components/ServiceCard'
export default function Services() { return <div className="grid md:grid-cols-2 gap-5">{services.map(s => <ServiceCard key={s.id} {...s} />)}</div> }