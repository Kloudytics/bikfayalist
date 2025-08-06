import { Badge } from '@/components/ui/badge'

interface ListingStatusBadgeProps {
  status: string
  showDescription?: boolean
}

export function ListingStatusBadge({ status, showDescription = false }: ListingStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'default' // Green
      case 'PENDING':
        return 'secondary' // Yellow/Orange
      case 'ARCHIVED':
        return 'outline' // Gray
      case 'FLAGGED':
        return 'destructive' // Red
      default:
        return 'secondary'
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Visible to public'
      case 'PENDING':
        return 'Awaiting admin approval'
      case 'ARCHIVED':
        return 'Hidden from public view'
      case 'FLAGGED':
        return 'Flagged for review'
      default:
        return ''
    }
  }

  if (showDescription) {
    return (
      <div className="space-y-1">
        <Badge variant={getStatusColor(status) as any}>
          {status}
        </Badge>
        <p className="text-xs text-gray-500">
          {getStatusDescription(status)}
        </p>
      </div>
    )
  }

  return (
    <Badge variant={getStatusColor(status) as any}>
      {status}
    </Badge>
  )
}