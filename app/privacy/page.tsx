import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
                At BikfayaList, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our classified listings platform.
              </p>
              <p>
                By using BikfayaList, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our services.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card>
            <CardHeader>
              <CardTitle>2. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Personal Information</h4>
              <p>We collect personal information that you voluntarily provide to us:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Account Information:</strong> Name, email address, phone number, location</li>
                <li><strong>Profile Information:</strong> Bio, profile picture, preferences</li>
                <li><strong>Listing Information:</strong> Product details, descriptions, photos, pricing</li>
                <li><strong>Communication Data:</strong> Messages between users, support inquiries</li>
                <li><strong>Payment Information:</strong> Billing details (processed by third-party providers)</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Automatically Collected Information</h4>
              <p>We automatically collect certain information when you use our platform:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Usage Data:</strong> Pages visited, time spent, clicks, search queries</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Location Data:</strong> General location based on IP address</li>
                <li><strong>Cookies and Tracking:</strong> Session data, preferences, analytics</li>
                <li><strong>Log Information:</strong> Server logs, error reports, performance data</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Third-Party Information</h4>
              <p>We may receive information from third parties:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Social media platforms (if you connect your accounts)</li>
                <li>Authentication providers</li>
                <li>Analytics services</li>
                <li>Public databases and directories</li>
              </ul>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card>
            <CardHeader>
              <CardTitle>3. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Platform Operations</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Create and manage your account</li>
                <li>Process and display your listings</li>
                <li>Facilitate communication between users</li>
                <li>Provide customer support</li>
                <li>Process transactions and payments</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Platform Improvement</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Analyze usage patterns and trends</li>
                <li>Improve our services and features</li>
                <li>Personalize your experience</li>
                <li>Develop new products and services</li>
                <li>Test and optimize platform performance</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Safety and Security</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Detect and prevent fraud or abuse</li>
                <li>Enforce our Terms of Service</li>
                <li>Protect user safety and security</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and issues</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Communications</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Send transactional emails (account updates, receipts)</li>
                <li>Provide customer support responses</li>
                <li>Send marketing communications (with consent)</li>
                <li>Notify you of platform updates and changes</li>
                <li>Send security alerts and notifications</li>
              </ul>
            </CardContent>
          </Card>

          {/* Message Monitoring and Content Moderation */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-yellow-800">4. Message Monitoring and Content Moderation</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="bg-yellow-100 p-4 rounded-lg border border-yellow-300 mb-4">
                <h4 className="font-semibold mb-2 text-yellow-800">Important Notice</h4>
                <p className="text-yellow-800">
                  To ensure user safety and maintain platform quality, BikfayaList reserves the right to monitor and review user communications and content.
                </p>
              </div>

              <h4 className="font-semibold mb-2">Message Monitoring</h4>
              <p>BikfayaList may monitor user conversations in the following circumstances:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Safety and Security:</strong> When necessary to protect user safety or platform security</li>
                <li><strong>Abuse Prevention:</strong> To detect and prevent fraud, scams, harassment, or other harmful activities</li>
                <li><strong>Flagged Content:</strong> When messages are reported by users or flagged by our automated systems</li>
                <li><strong>Legal Compliance:</strong> When required by law enforcement or legal processes</li>
                <li><strong>Terms Enforcement:</strong> To investigate potential violations of our Terms of Service</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Content Moderation</h4>
              <p>All platform content is subject to our community guidelines and moderation:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Listing Review:</strong> All new listings undergo review before becoming publicly visible</li>
                <li><strong>Message Review:</strong> Flagged or reported messages are reviewed by our moderation team</li>
                <li><strong>Automated Detection:</strong> We use automated systems to detect potentially harmful content</li>
                <li><strong>User Reports:</strong> Users can report inappropriate content or behavior</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Actions We May Take</h4>
              <p>Based on our review, we may take various actions:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Remove or hide inappropriate content</li>
                <li>Flag messages or listings for further review</li>
                <li>Issue warnings to users</li>
                <li>Temporarily or permanently suspend accounts</li>
                <li>Report illegal activities to law enforcement</li>
                <li>Preserve evidence for legal proceedings</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Privacy Protection</h4>
              <p>While we reserve the right to monitor communications when necessary, we are committed to:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Only accessing conversations when there is a legitimate safety, security, or legal need</li>
                <li>Using the minimum necessary access to address the specific concern</li>
                <li>Protecting user privacy in our moderation processes</li>
                <li>Training our moderation team on privacy best practices</li>
                <li>Maintaining confidentiality of reviewed communications</li>
              </ul>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-300 mt-4">
                <h4 className="font-semibold mb-2 text-blue-800">Your Responsibility</h4>
                <p className="text-blue-800">
                  By using BikfayaList, you agree to use our messaging system responsibly and acknowledge that your communications may be subject to monitoring as described above. Always follow our community guidelines and treat other users with respect.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card>
            <CardHeader>
              <CardTitle>5. How We Share Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Public Information</h4>
              <p>Certain information is publicly visible on our platform:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Your listings and item descriptions</li>
                <li>Public profile information (name, bio, general location)</li>
                <li>User ratings and reviews</li>
                <li>Activity that you choose to make public</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Service Providers</h4>
              <p>We share information with trusted third-party service providers:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Hosting and cloud storage providers</li>
                <li>Payment processors</li>
                <li>Email and communication services</li>
                <li>Analytics and advertising platforms</li>
                <li>Customer support tools</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Legal Requirements</h4>
              <p>We may disclose information when required by law:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>To comply with legal processes or government requests</li>
                <li>To protect our rights and property</li>
                <li>To ensure user safety and security</li>
                <li>To investigate potential violations</li>
                <li>In connection with legal proceedings</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Business Transfers</h4>
              <p>
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity, subject to the same privacy protections.
              </p>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card>
            <CardHeader>
              <CardTitle>6. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Security Measures</h4>
              <p>We implement various security measures to protect your information:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure servers and databases</li>
                <li>Regular security audits and updates</li>
                <li>Access controls and authentication</li>
                <li>Employee training and confidentiality agreements</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">User Responsibilities</h4>
              <p>You can help protect your information by:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Using strong, unique passwords</li>
                <li>Keeping your login credentials secure</li>
                <li>Logging out of shared devices</li>
                <li>Reporting suspicious activity immediately</li>
                <li>Keeping your contact information current</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Data Breach Response</h4>
              <p>
                In the unlikely event of a data breach, we will notify affected users and relevant authorities as required by law, typically within 72 hours of discovery.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>7. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Access and Control</h4>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your information</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Communication Preferences</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Opt out of marketing communications</li>
                <li>Control notification settings</li>
                <li>Manage email preferences</li>
                <li>Update communication channels</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Account Management</h4>
              <ul className="list-disc ml-6 space-y-1">
                <li>Update your profile information</li>
                <li>Control listing visibility</li>
                <li>Manage privacy settings</li>
                <li>Delete your account</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Exercising Your Rights</h4>
              <p>
                To exercise any of these rights, contact us at privacy@bikfayalist.com. We will respond to your request within 30 days and may require identity verification.
              </p>
            </CardContent>
          </Card>

          {/* Cookies and Tracking */}
          <Card id="cookies">
            <CardHeader>
              <CardTitle>8. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Types of Cookies</h4>
              <p>We use several types of cookies and similar technologies:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Performance Cookies:</strong> Help us analyze platform usage</li>
                <li><strong>Functional Cookies:</strong> Remember your preferences</li>
                <li><strong>Marketing Cookies:</strong> Used for advertising and personalization</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Third-Party Tracking</h4>
              <p>We may use third-party analytics and advertising services:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Google Analytics for usage analytics</li>
                <li>Social media pixels for advertising</li>
                <li>Marketing automation tools</li>
                <li>Performance monitoring services</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Managing Cookies</h4>
              <p>
                You can control cookies through your browser settings or our cookie preferences center. Note that disabling certain cookies may limit platform functionality.
              </p>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle>9. Data Retention</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Retention Periods</h4>
              <p>We retain your information for different periods based on the type of data:</p>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Account Data:</strong> Until account deletion + 30 days</li>
                <li><strong>Listing Data:</strong> 2 years after listing expiration</li>
                <li><strong>Communication Data:</strong> 3 years for support purposes</li>
                <li><strong>Transaction Data:</strong> 7 years for legal compliance</li>
                <li><strong>Analytics Data:</strong> 2 years in aggregated form</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Deletion Process</h4>
              <p>
                When you delete your account, we will remove your personal information within 30 days, except where retention is required by law or for legitimate business purposes.
              </p>
            </CardContent>
          </Card>

          {/* International Transfers */}
          <Card>
            <CardHeader>
              <CardTitle>10. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                Your information may be processed and stored in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Standard contractual clauses</li>
                <li>Adequacy decisions by relevant authorities</li>
                <li>Certification schemes</li>
                <li>Binding corporate rules</li>
              </ul>
            </CardContent>
          </Card>

          {/* Children's Privacy */}
          <Card>
            <CardHeader>
              <CardTitle>11. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                BikfayaList is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will take steps to delete such information promptly.
              </p>
              <p>
                If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Policy */}
          <Card>
            <CardHeader>
              <CardTitle>12. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. We will:
              </p>
              <ul className="list-disc ml-6 space-y-1">
                <li>Post the updated policy on our platform</li>
                <li>Update the "last modified" date</li>
                <li>Notify users of significant changes via email</li>
                <li>Provide notice through platform notifications</li>
              </ul>
              <p className="mt-3">
                Continued use of our services after policy changes constitutes acceptance of the updated policy.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>13. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h4 className="font-semibold mb-2">Privacy Questions</h4>
              <p>For questions about this Privacy Policy or our data practices, contact us:</p>
              <ul className="list-none ml-0 space-y-1">
                <li><strong>Email:</strong> privacy@bikfayalist.com</li>
                <li><strong>Mail:</strong> BikfayaList Privacy Officer</li>
                <li><strong>Response Time:</strong> We respond to privacy inquiries within 30 days</li>
              </ul>

              <h4 className="font-semibold mb-2 mt-4">Data Protection Officer</h4>
              <p>
                If you are in a region with data protection laws, you may contact our Data Protection Officer at dpo@bikfayalist.com for specific privacy concerns.
              </p>

              <h4 className="font-semibold mb-2 mt-4">Regulatory Authorities</h4>
              <p>
                You have the right to lodge a complaint with relevant data protection authorities if you believe your privacy rights have been violated.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-12" />

        <div className="text-center text-sm text-gray-500">
          <p>
            By using BikfayaList, you acknowledge that you have read and understood this Privacy Policy and consent to our data practices as described.
          </p>
          <p className="mt-2">
            Last updated: {new Date().toLocaleDateString()} | Version 1.0
          </p>
        </div>
      </div>
    </div>
  )
}