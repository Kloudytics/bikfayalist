import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Archive,
  TrendingUp,
  Star,
  Zap,
  Crown
} from 'lucide-react'

interface Listing {
  id: string
  status: string
  isFeatured?: boolean
  featured?: boolean
  featuredUntil?: string
}

interface ListingActionsDropdownProps {
  listing: Listing
  onDelete: (listingId: string, status: string) => void
  onReactivate: (listingId: string) => void
  onPromote?: (listingId: string, type: 'FEATURED_WEEK' | 'BUMP_TO_TOP') => void
}

export function ListingActionsDropdown({ 
  listing, 
  onDelete, 
  onReactivate,
  onPromote
}: ListingActionsDropdownProps) {
  const isCurrentlyFeatured = listing.isFeatured || listing.featured
  const isExpired = listing.featuredUntil ? new Date(listing.featuredUntil) <= new Date() : false
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/listing/${listing.id}`}>
            <Eye className="w-4 h-4 mr-2" />
            View
          </Link>
        </DropdownMenuItem>
        
        {/* Only allow editing for PENDING and ACTIVE listings */}
        {(listing.status === 'PENDING' || listing.status === 'ACTIVE') && (
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/edit/${listing.id}`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        
        {/* Promotion options for ACTIVE listings */}
        {listing.status === 'ACTIVE' && onPromote && (
          <>
            <DropdownMenuSeparator />
            
            {/* Featured Listing option */}
            {!isCurrentlyFeatured || isExpired ? (
              <DropdownMenuItem 
                onClick={() => onPromote(listing.id, 'FEATURED_WEEK')}
                className="text-yellow-600"
              >
                <Star className="w-4 h-4 mr-2" />
                Make Featured ($5/week)
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem disabled className="text-gray-400">
                <Crown className="w-4 h-4 mr-2" />
                Already Featured
              </DropdownMenuItem>
            )}
            
            {/* Bump to Top option */}
            <DropdownMenuItem 
              onClick={() => onPromote(listing.id, 'BUMP_TO_TOP')}
              className="text-blue-600"
            >
              <Zap className="w-4 h-4 mr-2" />
              Bump to Top ($1)
            </DropdownMenuItem>
          </>
        )}
        
        {/* Reactivate option for ARCHIVED listings */}
        {listing.status === 'ARCHIVED' && (
          <DropdownMenuItem 
            onClick={() => onReactivate(listing.id)}
            className="text-green-600"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Reactivate
          </DropdownMenuItem>
        )}
        
        {/* Delete/Archive action with smart logic */}
        <DropdownMenuItem 
          onClick={() => onDelete(listing.id, listing.status)}
          className={listing.status === 'ACTIVE' ? "text-orange-600" : "text-red-600"}
        >
          {listing.status === 'ACTIVE' ? (
            <>
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}