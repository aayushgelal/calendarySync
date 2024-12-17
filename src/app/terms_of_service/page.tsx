import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Terms of Service for SyncMyCalendar</CardTitle>
        </CardHeader>
        <CardContent>
          <section className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
              <p className="text-gray-700">
                By accessing or using SyncMyCalendar, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">2. Service Description</h2>
              <p className="text-gray-700">
                SyncMyCalendar is a calendar synchronization service that allows users to integrate and manage multiple calendar sources using Google OAuth.
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>We provide calendar synchronization and management tools</li>
                <li>The service is provided "as is" without guarantees of continuous or uninterrupted operation</li>
                <li>Features may be modified, updated, or discontinued at our discretion</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">3. User Responsibilities</h2>
              <p className="text-gray-700">
                By using SyncMyCalendar, you agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>Provide accurate and current information</li>
                <li>Maintain the confidentiality of your account credentials</li>
                <li>Not use the service for any illegal or unauthorized purpose</li>
                <li>Not attempt to circumvent our security measures</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">4. Google OAuth Integration</h2>
              <p className="text-gray-700">
                Our service uses Google OAuth for authentication and calendar access:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>You grant temporary, revocable permission to access your Google Calendar</li>
                <li>You can remove app access at any time through Google Account settings</li>
                <li>We comply with Google's OAuth policies and best practices</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
              <p className="text-gray-700">
                SyncMyCalendar is not liable for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>Any loss of data or interruption of service</li>
                <li>Any errors or inaccuracies in calendar synchronization</li>
                <li>Indirect, incidental, or consequential damages</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">6. Termination</h2>
              <p className="text-gray-700">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>Suspend or terminate your account at our discretion</li>
                <li>Refuse service to anyone for any reason</li>
                <li>Modify or discontinue the service with or without notice</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">7. Modifications to Terms</h2>
              <p className="text-gray-700">
                We may update these Terms of Service at any time. Continued use of the service constitutes acceptance of the updated terms.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Us for Questions About These Terms
              </Link>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;