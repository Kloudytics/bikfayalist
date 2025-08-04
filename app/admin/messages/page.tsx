'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Search, 
  MessageCircle, 
  MoreHorizontal, 
  Eye, 
  Trash2, 
  Flag,
  Calendar,
  Users
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'

export default function AdminMessagesPage() {
  const { data: session, status } = useSession()
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    flaggedMessages: 0,
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/')
    }
    
    fetchMessages()
    fetchStats()
  }, [session, status])

  useEffect(() => {
    filterMessages()
  }, [messages, searchQuery])

  const fetchMessages = async () => {
    try {
      // For now, we'll use mock data since we need to create an admin endpoint
      // In a real implementation, you'd have /api/admin/messages
      const mockMessages = [
        {
          id: '1',
          content: 'Hi! Is this iPhone still available?',
          fromUser: { id: '2', name: 'John Doe', image: null },
          listing: { id: '1', title: 'iPhone 14 Pro Max', user: { name: 'Jane Smith' } },
          createdAt: new Date(Date.now() - 1000 * 60 * 30),
          flagged: false
        },
        {
          id: '2',
          content: 'Yes, it is! Are you interested in seeing it?',
          fromUser: { id: '3', name: 'Jane Smith', image: null },
          listing: { id: '1', title: 'iPhone 14 Pro Max', user: { name: 'Jane Smith' } },
          createdAt: new Date(Date.now() - 1000 * 60 * 15),
          flagged: false
        },
        {
          id: '3',
          content: 'This is a suspicious message that might be spam',
          fromUser: { id: '4', name: 'Suspicious User', image: null },
          listing: { id: '2', title: 'MacBook Pro', user: { name: 'John Doe' } },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          flagged: true
        }
      ]
      setMessages(mockMessages)
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Mock stats - in real app, would fetch from /api/admin/messages/stats
      setStats({
        totalMessages: 156,
        activeConversations: 42,
        flaggedMessages: 3,
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const filterMessages = () => {
    let filtered = messages

    if (searchQuery) {
      filtered = filtered.filter((message: any) =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.fromUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        message.listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredMessages(filtered)
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      // In a real app, you'd call the API to delete the message
      setMessages(messages.filter((message: any) => message.id !== messageId))
      toast.success('Message deleted successfully')
    } catch (error) {
      toast.error('Failed to delete message')
    }
  }

  const handleFlagMessage = async (messageId: string) => {
    try {
      // In a real app, you'd call the API to flag/unflag the message
      setMessages(messages.map((message: any) => 
        message.id === messageId 
          ? { ...message, flagged: !message.flagged }
          : message
      ))
      toast.success('Message flag status updated')
    } catch (error) {
      toast.error('Failed to update message')
    }
  }

  if (status === 'loading') {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Message Management</h1>
        <p className="text-gray-600">Monitor and moderate platform messages</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeConversations}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Messages</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.flaggedMessages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Messages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMessages.map((message: any) => (
                  <TableRow key={message.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.fromUser.image || ''} />
                          <AvatarFallback>
                            {message.fromUser.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{message.fromUser.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="truncate max-w-[300px]">{message.content}</p>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">{message.listing.title}</p>
                        <p className="text-sm text-gray-500">by {message.listing.user.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </div>
                    </TableCell>
                    <TableCell>
                      {message.flagged ? (
                        <Badge variant="destructive">Flagged</Badge>
                      ) : (
                        <Badge variant="secondary">Normal</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Conversation
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleFlagMessage(message.id)}>
                            <Flag className="w-4 h-4 mr-2" />
                            {message.flagged ? 'Unflag' : 'Flag'} Message
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteMessage(message.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Message
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}