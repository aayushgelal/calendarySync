import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Privacy Policy for SyncMyCalendar</CardTitle>
        </CardHeader>
        <CardContent>
          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold mb-2">Google OAuth Integration</h2>
              <p className="text-gray-700">
                Our application uses Google OAuth to allow you to sync your calendars. This integration provides the following privacy guarantees:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>We only request access to view and manage your calendars as necessary for the app's functionality.</li>
                <li>We do not store or share your Google account credentials beyond the OAuth token required for calendar synchronization.</li>
                <li>You can revoke our app's access to your Google account at any time through your Google Account settings.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Data Collection and Usage</h2>
              <p className="text-gray-700">
                When you use our calendar sync application with Google OAuth:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>We collect only the minimum necessary information to provide calendar synchronization services.</li>
                <li>Calendar event metadata may be temporarily cached to improve app performance.</li>
                <li>We do not sell or share your personal calendar data with third parties.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">User Consent and Control</h2>
              <p className="text-gray-700">
                By connecting your Google Calendar, you agree to the following:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>You explicitly consent to our application accessing your calendar data.</li>
                <li>You can disconnect the app and revoke access at any time.</li>
                <li>We will request only the minimal necessary scopes for calendar synchronization.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">Security Measures</h2>
              <p className="text-gray-700">
                We implement industry-standard security practices to protect your data:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-600">
                <li>OAuth tokens are encrypted and securely stored.</li>
                <li>We use HTTPS for all data transmissions.</li>
                <li>Access to user data is strictly limited to authorized personnel.</li>
              </ul>
            </div>

            <div className="mt-4 text-center">
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Us for Any Privacy Concerns
              </Link>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPolicy;