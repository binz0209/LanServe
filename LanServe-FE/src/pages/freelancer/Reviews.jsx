import { reviews } from '../../lib/mock'
import ReviewCard from '../../components/ReviewCard'
export default function Reviews(){ return <div className="space-y-4">{reviews.map(r=> <ReviewCard key={r.id} {...r}/>)}</div> }