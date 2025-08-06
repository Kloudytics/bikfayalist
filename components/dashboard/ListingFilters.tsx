import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface ListingFiltersProps {
  searchQuery: string
  statusFilter: string
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: string) => void
}

export function ListingFilters({
  searchQuery,
  statusFilter,
  onSearchChange,
  onStatusFilterChange
}: ListingFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search your listings..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="flex gap-2">
        {['all', 'active', 'pending', 'archived', 'flagged'].map((status) => (
          <Button
            key={status}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => onStatusFilterChange(status)}
            className="capitalize"
          >
            {status}
          </Button>
        ))}
      </div>
    </div>
  )
}