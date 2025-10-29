import { portfolios } from '../../lib/mock'
import PortfolioCard from '../../components/PortfolioCard'
export default function Portfolio() { return <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{portfolios.map(p => <PortfolioCard key={p.id} {...p} />)}</div> }