import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Edit, 
  Eye, 
  Trash2, 
  Archive,
  TrendingUp
} from 'lucide-react'

interface Listing {
  id: string
  status: string
}

interface ListingActionsDropdownProps {
  listing: Listing
  onDelete: (listingId: string, status: string) => void
  onReactivate: (listingId: string) => void
}

export function ListingActionsDropdown({ 
  listing, 
  onDelete, 
  onReactivate 
}: ListingActionsDropdownProps) {
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