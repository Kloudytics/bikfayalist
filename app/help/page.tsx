'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  HelpCircle, 
  Shield, 
  CreditCard, 
  Users, 
  Settings
} from 'lucide-react'
import { toast } from 'sonner'

interface FAQ {
  question: string
  answer: string
}

interface FAQCategory {
  id: string
  title: string
  icon: React.ComponentType<any>
  faqs: FAQ[]
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Your message has been sent! We\'ll get back to you soon.')
    setContactForm({ name: '', email: '', subject: '', message: '' })
  }

  const faqCategories: FAQCategory[] = [
    {
      id: 'beta-information',
      title: 'Beta Version Information',
      icon: HelpCircle,
      faqs: [
        {
          question: 'What does "Beta Version" mean?',
          answer: 'BikfayaList is currently in beta testing phase. This means we\'re actively testing features and making improvements based on user feedback before our full launch.'
        },
        {
          question: 'How many posts can I create during beta?',
          answer: 'During our beta period, each account is limited to 5 posts. This helps us maintain quality while we test the platform. This limit will be increased after the beta period ends.'
        },
        {
          question: 'Why is there a post limit during beta?',
          answer: 'The 5-post limit per account (household) helps us maintain platform quality, prevent spam, and gather focused feedback while we perfect the user experience for our Bikfaya community.'
        },
        {
          question: 'When will the beta period end?',
          answer: 'We don\'t have a specific end date yet. The beta period will conclude once we\'ve implemented core features and addressed community feedback. All users will be notified when we transition to full launch.'
        },
        {
          question: 'Will I lose my posts after beta?',
          answer: 'No! All your listings and account data will be preserved when we transition from beta to full launch. Your posts will remain active and accessible.'
        }
      ]
    },
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Users,
      faqs: [
        {
          question: 'How do I create an account?',
          answer: 'Click the "Sign Up" button in the top right corner, fill in your details, and verify your email address.'
        },
        {
          question: 'How do I post my first listing?',
          answer: 'After signing in, click "Post Ad" in the navigation bar, fill in your item details, add photos, and publish your listing.'
        },
        {
          question: 'Is it free to post listings?',
          answer: 'Yes! Basic listings are completely free. We offer premium features for enhanced visibility.'
        }
      ]
    },
    {
      id: 'buying-selling',
      title: 'Buying & Selling',
      icon: CreditCard,
      faqs: [
        {
          question: 'How do I contact a seller?',
          answer: 'Click on any listing and use the "Contact Seller" form to send a message directly to the seller.'
        },
        {
          question: 'How do I edit or delete my listing?',
          answer: 'Go to your Dashboard, find your listing, and use the actions menu to edit or delete it.'
        },
        {
          question: 'What payment methods are accepted?',
          answer: 'Payment is arranged directly between buyers and sellers. We recommend cash transactions for in-person meetings or secure bank transfers.'
        }
      ]
    },
    {
      id: 'safety',
      title: 'Safety & Security',
      icon: Shield,
      faqs: [
        {
          question: 'How do I stay safe when meeting buyers/sellers?',
          answer: 'Always meet in public places, bring a friend, inspect items carefully, and trust your instincts.'
        },
        {
          question: 'How do I report suspicious activity?',
          answer: 'Use the "Report" button on any listing or contact our support team immediately.'
        },
        {
          question: 'What should I do if I\'m scammed?',
          answer: 'Report the incident to us immediately and consider contacting local authorities if money was involved.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account Management',
      icon: Settings,
      faqs: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Dashboard > Settings > Security and click "Change Password".'
        },
        {
          question: 'How do I delete my account?',
          answer: 'In your account settings, scroll to the "Danger Zone" section and follow the account deletion process.'
        },
        {
          question: 'Can I change my email address?',
          answer: 'Currently, email addresses cannot be changed. Please contact support if you need assistance.'
        }
      ]
    }
  ]

  const filteredFaqs = faqCategories.map(category => ({
    ...category,
    faqs: category.faqs.filter(faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.faqs.length > 0)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Help Center</h1>
        <p className="text-gray-600">Find answers to common questions or get in touch with our support team</p>
      </div>

      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-14 text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-gray-600 mb-4">Get instant help from our support team</p>
            <Button className="w-full">Start Chat</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Email Support</h3>
            <p className="text-sm text-gray-600 mb-4">Send us a detailed message</p>
            <Button variant="outline" className="w-full">Send Email</Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-gray-600 mb-4">Call us during business hours</p>
            <Button variant="outline" className="w-full">Call Now</Button>
          </CardContent>
        </Card>
      </div>

      {/* Coverage Areas Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Current Coverage Areas of BikfayaList
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6">
            BikfayaList currently covers listings across the following towns, villages, and nearby areas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Main Villages & Towns Covered:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Bikfaya (بكفيا)</li>
                <li>• Mazraat Yachou (مزرعة يشوع)</li>
                <li>• Ain Aar (عين عار)</li>
                <li>• Qornet El Hamra (قرنة الحمرا)</li>
                <li>• Beit Chabeb (بيت شباب)</li>
                <li>• Hemlaya (حملايا)</li>
                <li>• Abou Mizan (أبو ميزان)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Additional Areas:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Douar (دوار)</li>
                <li>• Mar Moussa El Douar (مار موسى الدوار)</li>
                <li>• Dahr El Souane (ضهر الصوان)</li>
                <li>• Baabdat (بعبدات)</li>
                <li>• Zaraoun (زرعون)</li>
                <li>• Dhour El Choueir (ضهور الشوير)</li>
                <li>• Bois de Boulogne (غابة بولونيا)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Expansion Areas:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Mar Moussa (مار موسى)</li>
                <li>• Mtein (المتين)</li>
                <li>• Mrouj (المروج)</li>
              </ul>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  📍 We plan to expand gradually, covering additional surrounding villages and towns.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Frequently Asked Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {searchQuery && filteredFaqs.length === 0 ? (
                <div className="text-center py-8">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                  <p className="text-gray-600">Try different search terms or browse categories below.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {(searchQuery ? filteredFaqs : faqCategories).map((category) => (
                    <div key={category.id}>
                      <div className="flex items-center mb-4">
                        <category.icon className="w-5 h-5 text-blue-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                        <Badge variant="secondary" className="ml-2">
                          {category.faqs.length}
                        </Badge>
                      </div>
                      
                      <Accordion type="single" collapsible className="space-y-2">
                        {category.faqs.map((faq, index) => (
                          <AccordionItem key={index} value={`${category.id}-${index}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                      
                      {category !== faqCategories[faqCategories.length - 1] && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <Input
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <Input
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <Textarea
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Other Ways to Reach Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">support@bikfayalist.com</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-gray-600">+961 4 987-654</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-gray-600">Mon-Fri: 9AM-6PM EET</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}