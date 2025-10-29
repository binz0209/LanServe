import Input from './ui/input'
import Button from './ui/button'
export default function SearchBar() {
    return (
        <div className="flex gap-2">
            <Input placeholder="Tìm kiếm dự án theo tên, mô tả, kỹ năng…" />
            <Button className="whitespace-nowrap">Bộ lọc</Button>
        </div>
    )
}