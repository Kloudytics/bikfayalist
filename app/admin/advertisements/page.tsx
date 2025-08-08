'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Eye, 
  MousePointer, 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface Advertisement {
  id: string
  company: string
  headline: string
  description: string
  ctaText: string
  ctaUrl: string
  backgroundImage?: string
  backgroundColor: string
  textColor: string
  isActive: boolean
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  startDate?: string
  endDate?: string
  budget?: number
  targetAudience?: string
  clickCount: number
  impressionCount: number
  createdAt: string
  updatedAt: string
  createdBy: {
    id: string
    name: string
    email: string
  }
}

interface FormData {
  company: string
  headline: string
  description: string
  ctaText: string
  ctaUrl: string
  backgroundImage: string
  backgroundColor: string
  textColor: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  startDate: string
  endDate: string
  budget: string
  targetAudience: string
  isActive: boolean
}

const initialFormData: FormData = {
  company: '',
  headline: '',
  description: '',
  ctaText: '',
  ctaUrl: '',
  backgroundImage: '',
  backgroundColor: 'from-blue-600 to-purple-600',
  textColor: 'text-white',
  priority: 'MEDIUM',
  startDate: '',
  endDate: '',
  budget: '',
  targetAudience: '',
  isActive: true
}

const backgroundOptions = [
  { value: 'from-blue-600 to-purple-600', label: 'Blue to Purple' },
  { value: 'from-green-500 to-teal-600', label: 'Green to Teal' },
  { value: 'from-orange-500 to-red-500', label: 'Orange to Red' },
  { value: 'from-pink-500 to-purple-600', label: 'Pink to Purple' },
  { value: 'from-gray-600 to-gray-800', label: 'Gray to Dark' },
  { value: 'from-indigo-500 to-blue-600', label: 'Indigo to Blue' },
  { value: 'from-yellow-400 to-orange-500', label: 'Yellow to Orange' }
]

export default function AdvertisementsManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  // Fetch advertisements
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchAdvertisements()
    }
  }, [session])

  const fetchAdvertisements = async () => {
    try {
      const response = await fetch('/api/admin/advertisements')
      if (response.ok) {
        const data = await response.json()
        setAdvertisements(data.advertisements)
      } else {
        toast.error('Failed to fetch advertisements')
      }
    } catch (error) {
      toast.error('Error fetching advertisements')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData: any = { ...formData }
      
      // Clean up empty fields
      if (!submitData.backgroundImage) delete submitData.backgroundImage
      if (!submitData.startDate) delete submitData.startDate
      if (!submitData.endDate) delete submitData.endDate
      if (!submitData.budget) delete submitData.budget
      if (!submitData.targetAudience) delete submitData.targetAudience
      
      // Convert budget to number if provided
      if (submitData.budget) {
        submitData.budget = parseFloat(submitData.budget)
      }

      const isEditing = editingId !== null
      const url = isEditing ? `/api/admin/advertisements/${editingId}` : '/api/admin/advertisements'
      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })

      if (response.ok) {
        toast.success(`Advertisement ${isEditing ? 'updated' : 'created'} successfully`)
        setFormData(initialFormData)
        setEditingId(null)
        setIsDialogOpen(false)
        fetchAdvertisements()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to save advertisement')
      }
    } catch (error) {
      toast.error('Error saving advertisement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (ad: Advertisement) => {
    setFormData({
      company: ad.company,
      headline: ad.headline,
      description: ad.description,
      ctaText: ad.ctaText,
      ctaUrl: ad.ctaUrl,
      backgroundImage: ad.backgroundImage || '',
      backgroundColor: ad.backgroundColor,
      textColor: ad.textColor,
      priority: ad.priority,
      startDate: ad.startDate ? ad.startDate.split('T')[0] : '',
      endDate: ad.endDate ? ad.endDate.split('T')[0] : '',
      budget: ad.budget ? ad.budget.toString() : '',
      targetAudience: ad.targetAudience || '',
      isActive: ad.isActive
    })
    setEditingId(ad.id)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return

    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Advertisement deleted successfully')
        fetchAdvertisements()
      } else {
        toast.error('Failed to delete advertisement')
      }
    } catch (error) {
      toast.error('Error deleting advertisement')
    }
  }

  const toggleAdStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/advertisements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus })
      })

      if (response.ok) {
        toast.success(`Advertisement ${!currentStatus ? 'activated' : 'deactivated'}`)
        fetchAdvertisements()
      } else {
        toast.error('Failed to update advertisement status')
      }
    } catch (error) {
      toast.error('Error updating advertisement status')
    }
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'
  }

  const totalStats = advertisements.reduce((acc, ad) => ({
    impressions: acc.impressions + ad.impressionCount,
    clicks: acc.clicks + ad.clickCount,
    revenue: acc.revenue + (ad.clickCount * 2.5) // $2.50 per click example
  }), { impressions: 0, clicks: 0, revenue: 0 })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session || session.user?.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header & Stats */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Advertisement Management</h1>
            <p className="text-gray-600 mt-2">Manage premium advertising banners displayed across the platform</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Advertisement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Edit Advertisement' : 'Create New Advertisement'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company Name *</Label>
                    <Input 
                      id="company"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Company Name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority Level</Label>
                    <select 
                      id="priority"
                      className="w-full px-3 py-2 border rounded-md"
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="headline">Advertisement Headline *</Label>
                  <Input 
                    id="headline"
                    value={formData.headline}
                    onChange={(e) => setFormData({...formData, headline: e.target.value})}
                    placeholder="Eye-catching headline"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief, compelling description"
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ctaText">Call-to-Action Text *</Label>
                    <Input 
                      id="ctaText"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                      placeholder="Shop Now"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="ctaUrl">Target URL *</Label>
                    <Input 
                      id="ctaUrl"
                      type="url"
                      value={formData.ctaUrl}
                      onChange={(e) => setFormData({...formData, ctaUrl: e.target.value})}
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundImage">Background Image URL (Optional)</Label>
                  <Input 
                    id="backgroundImage"
                    type="url"
                    value={formData.backgroundImage}
                    onChange={(e) => setFormData({...formData, backgroundImage: e.target.value})}
                    placeholder="https://images.pexels.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Background Gradient</Label>
                  <select 
                    className="w-full px-3 py-2 border rounded-md"
                    value={formData.backgroundColor}
                    onChange={(e) => setFormData({...formData, backgroundColor: e.target.value})}
                  >
                    {backgroundOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date (Optional)</Label>
                    <Input 
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (Optional)</Label>
                    <Input 
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget">Budget (Optional)</Label>
                  <Input 
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    placeholder="1000.00"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label>Active Advertisement</Label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Saving...' : editingId ? 'Update Advertisement' : 'Create Advertisement'}
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    onClick={() => {
                      setFormData(initialFormData)
                      setEditingId(null)
                      setIsDialogOpen(false)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                  <p className="text-2xl font-bold">{totalStats.impressions.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                  <p className="text-2xl font-bold">{totalStats.clicks.toLocaleString()}</p>
                </div>
                <MousePointer className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average CTR</p>
                  <p className="text-2xl font-bold">
                    {calculateCTR(totalStats.clicks, totalStats.impressions)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Est. Revenue</p>
                  <p className="text-2xl font-bold">${totalStats.revenue.toFixed(0)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advertisements List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Active Advertisements ({advertisements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {advertisements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No advertisements created yet.</p>
                <p className="text-sm">Create your first advertisement to start earning revenue!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {advertisements.map((ad) => (
                  <div key={ad.id} className="border rounded-lg p-6 space-y-4">
                    {/* Ad Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={ad.isActive}
                          onCheckedChange={() => toggleAdStatus(ad.id, ad.isActive)}
                        />
                        <span className="text-sm font-medium">
                          {ad.isActive ? 'Active' : 'Paused'}
                        </span>
                        <Badge 
                          variant={ad.priority === 'HIGH' ? 'default' : ad.priority === 'MEDIUM' ? 'secondary' : 'outline'}
                        >
                          {ad.priority} priority
                        </Badge>
                        {ad.startDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(ad.startDate).toLocaleDateString()}
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(ad)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(ad.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Ad Content Preview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <h4 className="font-semibold text-gray-900 mb-1">{ad.company}</h4>
                        <h3 className="text-lg font-bold mb-2">{ad.headline}</h3>
                        <p className="text-gray-600 text-sm mb-3">{ad.description}</p>
                        <div className="flex space-x-2">
                          <Badge variant="outline" className="text-xs">
                            CTA: {ad.ctaText}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ad.backgroundColor.replace('from-', '').replace('to-', ' → ')}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Impressions</p>
                          <p className="font-bold text-blue-600">{ad.impressionCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Clicks</p>
                          <p className="font-bold text-green-600">{ad.clickCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">CTR</p>
                          <p className="font-bold text-purple-600">
                            {calculateCTR(ad.clickCount, ad.impressionCount)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-gray-500 border-t pt-3">
                      Created by {ad.createdBy.name} on {new Date(ad.createdAt).toLocaleDateString()}
                      {ad.budget && <span className="ml-4">Budget: ${ad.budget}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}