import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-xl text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <Card>
            <CardHeader>
              <CardTitle>1. Introduction</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Welcome to BikfayaList ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our classified listings platform and services. By accessing or using BikfayaList, you agree to be bound by these Terms.
              </p>
              <p>
                BikfayaList is a marketplace platform that connects buyers and sellers for various goods and services. We provide the platform and tools to facilitate these connections but are not a party to any transactions between users.
              </p>
            </CardContent>
          </Card>

          {/* Beta Version Notice */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm mr-2">BETA</span>
                Beta Version Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-blue-100 p-4 rounded-lg border border-blue-300 mb-4">
                <p className="text-blue-800 mb-3">
                  <strong>Important:</strong> This is the first beta implementation of BikfayaList. We are continuously working to improve the platform and add new features.
                </p>
                <h4 className="font-semibold mb-2 text-blue-800">What to Expect:</h4>
                <ul className="list-disc ml-6 space-y-1 text-blue-800">
                  <li>The platform is fully functional but may have occasional issues</li>
                  <li>New features and improvements will be added regularly</li>
                  <li>Some advanced features are planned for future releases</li>
                  <li>User feedback is highly valued and helps shape development</li>
                  <li>Performance optimizations are ongoing</li>
                </ul>
                <p className="text-blue-800 mt-3">
                  We appreciate your patience and feedback as we continue to enhance BikfayaList to better serve the Bikfaya community.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Account Creation</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must be at least 18 years old to create an account</li>
                <li>One account per person - multiple accounts are not permitted</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Account Responsibilities</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>You are responsible for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Keep your contact information current and accurate</li>
              </ul>
            </CardContent>
          </Card>

          {/* Listing Rules */}
          <Card>
            <CardHeader>
              <CardTitle>4. Listing Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Permitted Items</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Legal goods and services only</li>
                <li>Items you own or have authorization to sell</li>
                <li>Accurate descriptions and current photos</li>
                <li>Fair and reasonable pricing</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Prohibited Items</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Illegal items, weapons, or controlled substances</li>
                <li>Stolen or counterfeit goods</li>
                <li>Adult content or services</li>
                <li>Live animals (except through approved pet rehoming)</li>
                <li>Items that violate intellectual property rights</li>
                <li>Misleading or fraudulent listings</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Listing Quality</h4>
              <p>All listings must include:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Clear, accurate descriptions</li>
                <li>Current photos of the actual item</li>
                <li>Honest condition assessments</li>
                <li>Proper categorization</li>
                <li>Reasonable pricing</li>
              </ul>
            </CardContent>
          </Card>

          {/* User Conduct */}
          <Card>
            <CardHeader>
              <CardTitle>5. User Conduct</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Acceptable Behavior</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Communicate respectfully with other users</li>
                <li>Complete transactions in good faith</li>
                <li>Provide honest feedback and reviews</li>
                <li>Follow through on commitments</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Prohibited Conduct</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Harassment, threats, or abusive behavior</li>
                <li>Spam, scams, or fraudulent activities</li>
                <li>Impersonating other users or entities</li>
                <li>Attempting to bypass platform fees or systems</li>
                <li>Collecting user data for unauthorized purposes</li>
                <li>Using automated tools to scrape or manipulate the platform</li>
              </ul>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>6. Transactions and Payments</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Platform Role</h4>
              <p>
                BikfayaList is a marketplace platform that facilitates connections between buyers and sellers. We are not a party to any transactions and do not handle payments directly. All transactions are between users.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Transaction Safety</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Meet in safe, public locations for item exchanges</li>
                <li>Inspect items before payment</li>
                <li>Use secure payment methods</li>
                <li>Keep records of all communications and transactions</li>
                <li>Report suspicious activity immediately</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Disputes</h4>
              <p>
                While we provide tools for communication, users are responsible for resolving transaction disputes among themselves. We may provide assistance in extreme cases but are not obligated to mediate disputes.
              </p>
            </CardContent>
          </Card>

          {/* Privacy and Data */}
          <Card>
            <CardHeader>
              <CardTitle>7. Privacy and Data Use</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Your privacy is important to us. Our use of your personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>We collect and use data as described in our Privacy Policy</li>
                <li>You consent to our data practices by using the platform</li>
                <li>We implement security measures to protect your information</li>
                <li>You can request data deletion as outlined in our Privacy Policy</li>
              </ul>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card>
            <CardHeader>
              <CardTitle>8. Intellectual Property</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Platform Content</h4>
              <p>
                BikfayaList and its content, features, and functionality are owned by us and protected by intellectual property laws.
              </p>

              <h4 className="font-semibold mb-2 mt-4">User Content</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>You retain ownership of content you post</li>
                <li>You grant us a license to use, display, and distribute your content on the platform</li>
                <li>You are responsible for ensuring you have rights to any content you post</li>
                <li>We may remove content that violates these Terms</li>
              </ul>
            </CardContent>
          </Card>

          {/* Disclaimers */}
          <Card>
            <CardHeader>
              <CardTitle>9. Disclaimers and Limitations</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Platform Availability</h4>
              <p>
                We strive to keep BikfayaList available 24/7, but we do not guarantee uninterrupted service. We may temporarily suspend service for maintenance, updates, or other operational reasons.
              </p>

              <h4 className="font-semibold mb-2 mt-4">User-Generated Content</h4>
              <p>
                We do not pre-screen all listings or user content. While we have policies and may remove violating content, we cannot guarantee the accuracy, legality, or quality of listings.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Third-Party Services</h4>
              <p>
                Our platform may integrate with third-party services. We are not responsible for the availability, accuracy, or content of such services.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>10. Account Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Termination by You</h4>
              <p>
                You may terminate your account at any time through your account settings or by contacting us.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Termination by Us</h4>
              <p>We may suspend or terminate accounts that:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Violate these Terms of Service</li>
                <li>Engage in prohibited conduct</li>
                <li>Post illegal or harmful content</li>
                <li>Attempt to manipulate or abuse the platform</li>
                <li>Have been inactive for extended periods</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Effect of Termination</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Your access to the platform will be revoked</li>
                <li>Your listings will be removed</li>
                <li>Some data may be retained as required by law</li>
                <li>Outstanding obligations remain in effect</li>
              </ul>
            </CardContent>
          </Card>

          {/* Legal */}
          <Card>
            <CardHeader>
              <CardTitle>11. Legal Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Governing Law</h4>
              <p>
                These Terms are governed by and construed in accordance with applicable local laws. Any disputes will be resolved in the appropriate courts.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Changes to Terms</h4>
              <p>
                We may update these Terms from time to time. We will notify users of significant changes via email or platform notifications. Continued use constitutes acceptance of updated Terms.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Severability</h4>
              <p>
                If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Contact Information</h4>
              <p>
                For questions about these Terms, please contact us at:
              </p>
              <ul className="list-none ml-0 space-y-1">
                <li><strong>Email:</strong> legal@bikfayalist.com</li>
                <li><strong>Address:</strong> BikfayaList Legal Department</li>
                <li><strong>Response Time:</strong> We aim to respond within 48 hours</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12" />

        <div className="text-center text-sm text-gray-500">
          <p>
            By using BikfayaList, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
          </p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleDateString()} | Version 1.0
          </p>
        </div>
      </div>
    </div>
  )
}