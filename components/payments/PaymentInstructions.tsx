import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign,
  Smartphone,
  Phone,
  MapPin,
  Clock,
  AlertCircle
} from 'lucide-react'

export function PaymentInstructions() {
  return (
    <Card className="mb-8 bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-6 w-6 text-blue-600 mr-2" />
          Payment Methods
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cash Payment */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-3">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Cash Payment</h3>
                <Badge variant="secondary" className="mt-1">Preferred</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Pay in cash when we collect from your location or when you visit our partner locations.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex items-center">
                <MapPin className="w-3 h-3 mr-1" />
                <span>Pickup available in Bikfaya area</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                <span>Same day activation</span>
              </div>
            </div>
          </div>

          {/* Whish Transfer */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-3">
              <Smartphone className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Whish Transfer</h3>
                <Badge variant="outline">Instant</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Send money via Whish mobile app to our registered number.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium">To: +961 70 977 351</p>
              <p>Please include your payment ID in the message</p>
            </div>
          </div>

          {/* OMT Transfer */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center mb-3">
              <Phone className="h-8 w-8 text-orange-600 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">OMT Transfer</h3>
                <Badge variant="outline">Secure</Badge>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Transfer money through OMT branches or mobile app.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium text-orange-600">Coming Soon</p>
              <p>OMT transfers will be available shortly</p>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-yellow-800 mb-2">Important Payment Notes</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Always include your payment reference number when making transfers</li>
                <li>• Cash payments require arrangement for pickup or drop-off</li>
                <li>• Featured listings are activated immediately after payment confirmation</li>
                <li>• Contact us via WhatsApp for payment assistance: +961 70 977 351</li>
                <li>• Payment processing typically takes 1-2 hours during business hours</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}