'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  MousePointer, 
  DollarSign, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3
} from 'lucide-react'
import { Advertisement } from '@/types/advertising'

// Mock data - in real app this would come from database
const mockAds: Advertisement[] = [
  {
    id: 'ad-1',
    company: 'TechZone Electronics',
    headline: 'Mega Electronics Sale - 50% Off',
    description: 'Latest smartphones, laptops, and gadgets at unbeatable prices.',
    ctaText: 'Shop Now',
    ctaUrl: 'https://example.com/electronics-sale',
    backgroundColor: 'from-blue-600 to-purple-600',
    textColor: 'text-white',
    isActive: true,
    clickCount: 247,
    impressionCount: 12450,
    priority: 'high'
  },
  {
    id: 'ad-2',
    company: 'SecureAuto Insurance',
    headline: 'Premium Car Insurance from $299/year',
    description: 'Comprehensive coverage with 24/7 support.',
    ctaText: 'Get Quote',
    ctaUrl: 'https://example.com/car-insurance',
    backgroundColor: 'from-green-500 to-teal-600',
    textColor: 'text-white',
    isActive: false,
    clickCount: 89,
    impressionCount: 5670,
    priority: 'medium'
  }
]

export default function AdvertisingManager() {
  const [ads, setAds] = useState<Advertisement[]>(mockAds)
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const toggleAdStatus = (adId: string) => {
    setAds(ads.map(ad => 
      ad.id === adId ? { ...ad, isActive: !ad.isActive } : ad
    ))
  }

  const calculateCTR = (clicks: number, impressions: number) => {
    return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : '0.00'
  }

  const totalStats = ads.reduce((acc, ad) => ({
    impressions: acc.impressions + ad.impressionCount,
    clicks: acc.clicks + ad.clickCount,
    revenue: acc.revenue + (ad.clickCount * 2.5) // $2.50 per click example
  }), { impressions: 0, clicks: 0, revenue: 0 })

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advertising Manager</h2>
          <p className="text-gray-600">Manage premium advertising banners</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
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
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${totalStats.revenue.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ads List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Active Advertisements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ads.map((ad) => (
              <div key={ad.id} className="border rounded-lg p-4 space-y-3">
                {/* Ad Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={ad.isActive}
                        onCheckedChange={() => toggleAdStatus(ad.id)}
                      />
                      <span className="text-sm font-medium">
                        {ad.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>
                    <Badge variant={ad.priority === 'high' ? 'default' : ad.priority === 'medium' ? 'secondary' : 'outline'}>
                      {ad.priority} priority
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Ad Content Preview */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">{ad.company}</h4>
                    <h3 className="text-lg font-bold">{ad.headline}</h3>
                    <p className="text-gray-600 text-sm">{ad.description}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        CTA: {ad.ctaText}
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
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Ad Form Modal */}
      {showCreateForm && (
        <Card className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Create New Advertisement</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowCreateForm(false)}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company Name</Label>
                  <Input id="company" placeholder="Your Company" />
                </div>
                <div>
                  <Label htmlFor="priority">Priority Level</Label>
                  <select className="w-full px-3 py-2 border rounded-md">
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="headline">Advertisement Headline</Label>
                <Input id="headline" placeholder="Eye-catching headline" />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief, compelling description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta">Call-to-Action Text</Label>
                  <Input id="cta" placeholder="Shop Now" />
                </div>
                <div>
                  <Label htmlFor="url">Target URL</Label>
                  <Input id="url" placeholder="https://example.com" />
                </div>
              </div>

              <div>
                <Label htmlFor="background">Background Gradient</Label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option value="from-blue-600 to-purple-600">Blue to Purple</option>
                  <option value="from-green-500 to-teal-600">Green to Teal</option>
                  <option value="from-orange-500 to-red-500">Orange to Red</option>
                  <option value="from-pink-500 to-purple-600">Pink to Purple</option>
                  <option value="from-gray-600 to-gray-800">Gray to Dark</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button className="flex-1">Create Advertisement</Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </div>
        </Card>
      )}
    </div>
  )
}