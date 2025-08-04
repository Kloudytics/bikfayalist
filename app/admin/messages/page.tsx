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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  const [messages, setMessages] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalMessages: 0,
    activeConversations: 0,
    flaggedMessages: 0,
  })
  const [selectedConversation, setSelectedConversation] = useState<any>(null)
  const [conversationMessages, setConversationMessages] = useState<any[]>([])
  const [conversationLoading, setConversationLoading] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      redirect('/')
    }
    
    fetchMessages()
    fetchStats()
  }, [session, status])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchMessages()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const fetchMessages = async () => {
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      
      const response = await fetch(`/api/admin/messages?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages || [])
      } else {
        toast.error('Failed to load messages')
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/messages/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }


  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setMessages(messages.filter((message: any) => message.id !== messageId))
        toast.success('Message deleted successfully')
        // Refresh stats
        fetchStats()
      } else {
        toast.error('Failed to delete message')
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      toast.error('Failed to delete message')
    }
  }

  const handleFlagMessage = async (messageId: string) => {
    try {
      const currentMessage = messages.find((m: any) => m.id === messageId)
      if (!currentMessage) return

      const response = await fetch(`/api/admin/messages/${messageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ flagged: !currentMessage.flagged })
      })
      
      if (response.ok) {
        const updatedMessage = await response.json()
        setMessages(messages.map((message: any) => 
          message.id === messageId ? updatedMessage : message
        ))
        toast.success('Message flag status updated')
        // Refresh stats
        fetchStats()
      } else {
        toast.error('Failed to update message')
      }
    } catch (error) {
      console.error('Failed to update message:', error)
      toast.error('Failed to update message')
    }
  }

  const handleViewConversation = async (message: any) => {
    setSelectedConversation(message)
    setConversationLoading(true)
    
    try {
      const response = await fetch(`/api/admin/messages/conversation?listingId=${message.listing.id}&fromUserId=${message.fromUser.id}`)
      if (response.ok) {
        const data = await response.json()
        setConversationMessages(data.messages || [])
      } else {
        toast.error('Failed to load conversation')
      }
    } catch (error) {
      console.error('Failed to fetch conversation:', error)
      toast.error('Failed to load conversation')
    } finally {
      setConversationLoading(false)
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
                {messages.map((message: any) => (
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
                          <DropdownMenuItem onClick={() => handleViewConversation(message)}>
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

      {/* Conversation Modal */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Conversation about: {selectedConversation?.listing?.title}
            </DialogTitle>
          </DialogHeader>
          
          {conversationLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2">Loading conversation...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Between: <strong>{selectedConversation?.fromUser?.name}</strong> and{' '}
                <strong>{selectedConversation?.listing?.user?.name}</strong>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {conversationMessages.map((msg: any) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.fromUser.image || ''} />
                      <AvatarFallback>
                        {msg.fromUser.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-sm">{msg.fromUser.name}</span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                        </span>
                        {msg.flagged && (
                          <Badge variant="destructive" className="text-xs">Flagged</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {conversationMessages.length === 0 && (
                <p className="text-center text-gray-500 py-4">No messages found in this conversation.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}