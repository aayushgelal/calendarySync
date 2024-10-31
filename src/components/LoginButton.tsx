'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { Button } from './ui/button';

export function LoginButton() {
  const handleMicrosoftLogin = async () => {
    await signIn('azure-ad',{callbackUrl:'/dashboard'});
  }
  const handleGoogleLogin = async () => {
    await signIn('google', {
      callbackUrl: '/dashboard'
    });
  };

  return (
    <div className="space-y-4">
      <Button 
        onClick={handleMicrosoftLogin}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Continue with Microsoft
      </Button>

      <Button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Continue with Google
      </Button>
    </div>
  );
}