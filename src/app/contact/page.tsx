"use client"
import React, { useState } from 'react';
import { Mail, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ContactPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const companyEmail = 'aayushgelal4@gmail.com';

  const handleEmailOpen = () => {
    const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${companyEmail}`;
    window.open(gmailComposeUrl, '_blank');
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    // In a real app, you'd implement form submission logic here
    console.log('Form submitted', { name, email, message });
    // Potential form submission to backend
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center">
            <Mail className="mr-3" /> Contact SyncMyCalendar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                Your Message
              </label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here"
                rows={4}
                required
              />
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-grow">
                <Send className="mr-2" /> Send Message
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleEmailOpen}
                className="flex-grow"
              >
                Open Gmail
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Direct Email: <a 
                href={`mailto:${companyEmail}`} 
                className="text-blue-600 hover:underline"
              >
                {companyEmail}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactPage;