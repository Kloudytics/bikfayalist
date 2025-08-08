'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { User, Mail, Phone, MapPin, Bell, Shield, Trash2, Upload, Camera } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    phone: '',
    location: '',
  })
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    messageNotifications: true,
    listingUpdates: false,
    marketingEmails: false,
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) redirect('/auth/signin')
    
    // Fetch user profile data from database
    fetchUserProfile()
  }, [session, status])

  const fetchUserProfile = async () => {
    try {
      const [profileResponse, preferencesResponse] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/profile/notifications')
      ])

      if (profileResponse.ok) {
        const data = await profileResponse.json()
        setFormData({
          name: data.user.name || '',
          email: data.user.email || '',
          bio: data.user.bio || '',
          phone: data.user.phone || '',
          location: data.user.location || '',
        })
      } else {
        toast.error('Failed to load profile data')
      }

      if (preferencesResponse.ok) {
        const prefsData = await preferencesResponse.json()
        setNotifications(prefsData.preferences)
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      toast.error('Failed to load profile')
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications({
      ...notifications,
      [key]: value,
    })
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          phone: formData.phone,
          location: formData.location,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update the session with new name
        await update({
          ...session,
          user: {
            ...session?.user,
            name: data.user.name,
          }
        })
        
        toast.success('Profile updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('File must be an image')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/profile/image', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update the session with new image
        await update({
          ...session,
          user: {
            ...session?.user,
            image: data.imageUrl,
          }
        })
        
        toast.success('Profile picture updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to upload image')
      }
    } catch (error) {
      console.error('Failed to upload image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      if (response.ok) {
        toast.success('Password changed successfully!')
        setShowPasswordDialog(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to change password')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      toast.error('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/profile/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notifications),
      })

      if (response.ok) {
        toast.success('Notification preferences updated!')
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Failed to update preferences:', error)
      toast.error('Failed to update preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      // In a real app, you'd make an API call to delete the account
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Account deletion initiated. You will be contacted via email.')
    } catch (error) {
      toast.error('Failed to delete account')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Account Settings</h1>
        <p className="text-gray-600">Manage your account preferences and profile information</p>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={(session?.user as any)?.image || ''} />
                  <AvatarFallback className="text-lg">
                    {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <>
                        <Upload className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Camera className="w-4 h-4 mr-2" />
                        Change Photo
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-1">
                    JPG, GIF or PNG. Max size of 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email cannot be changed. Contact support if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="City, State"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="emailAlerts">Email Alerts</Label>
                <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
              </div>
              <Switch
                id="emailAlerts"
                checked={notifications.emailAlerts}
                onCheckedChange={(checked) => handleNotificationChange('emailAlerts', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="messageNotifications">Message Notifications</Label>
                <p className="text-sm text-gray-500">Get notified when someone messages you about a listing</p>
              </div>
              <Switch
                id="messageNotifications"
                checked={notifications.messageNotifications}
                onCheckedChange={(checked) => handleNotificationChange('messageNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="listingUpdates">Listing Updates</Label>
                <p className="text-sm text-gray-500">Receive updates about your listing performance</p>
              </div>
              <Switch
                id="listingUpdates"
                checked={notifications.listingUpdates}
                onCheckedChange={(checked) => handleNotificationChange('listingUpdates', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketingEmails">Marketing Emails</Label>
                <p className="text-sm text-gray-500">Receive promotional emails and platform updates</p>
              </div>
              <Switch
                id="marketingEmails"
                checked={notifications.marketingEmails}
                onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
              />
            </div>

            <Button onClick={handleSaveNotifications} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Password</Label>
              <p className="text-sm text-gray-500 mb-2">
                Last changed 30 days ago
              </p>
              <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        required
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" disabled={loading}>Change Password</Button>
                      <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Separator />

            <div>
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500 mb-2">
                Add an extra layer of security to your account
              </p>
              <Button variant="outline">
                Enable 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <Trash2 className="w-5 h-5 mr-2" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
              <p className="text-sm text-red-600 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Delete Account'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}