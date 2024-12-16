"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import FeaturesAndVideo from '@/components/landing/Features&Video';
import Link from 'next/link';
import { Star } from 'lucide-react';

export default function LandingContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center w-48">
              <Image src="/logo.png" alt="SyncMyCal" className="object-contain" width={192} height={32} />
            </div>
            <div className="flex items-center gap-3">
              <Link href="#features">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Features
                </Button>
              </Link>
              <a 
                href="https://www.buymeacoffee.com/aayushgelat" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="text-yellow-600 hover:text-yellow-700 border-yellow-200 hover:border-yellow-300">
                  <Image 
                    src="/bmc-logo.png" 
                    alt="Buy Me a Coffee" 
                    width={20} 
                    height={20} 
                    className="mr-2"
                  />
                  Buy Me a Coffee
                </Button>
              </a>
            </div>
          </div>
        </div>
      </nav>
        {/* Reviews Section */}
      


      {/* Hero Section */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-14 lg:px-8">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-slate-500 text-center text-sm italic max-w-2xl mx-auto">
            "Finally, a simple solution that just works! SyncMyCal has made managing my multiple calendars effortless."
          </p>
          <p className="text-slate-400 text-center mt-2">- John D., Product Manager</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              The secure, easy way to sync all your calendars
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Connect and sync your Google and Microsoft calendars effortlessly.
              Perfect for managing multiple calendars across different platforms.
            </p>
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                size="lg"
                className="flex items-center gap-2"
              >
                <Image
                  src="/google.png"
                  alt="Google"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                Start with Google
              </Button>
              <Button
                onClick={() => signIn("azure-ad", { callbackUrl: "/dashboard" })}
                size="lg"
                variant="outline"
                className="flex items-center gap-2"
              >
                <Image
                  src="/microsoft.png"
                  alt="Microsoft"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                Start with Microsoft
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <FeaturesAndVideo />
 {/* Support Section */}
 <section id="support" className="py-20 bg-slate-800">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-b from-yellow-400/10 to-transparent p-8 rounded-2xl border border-yellow-400/20">
            <h2 className="text-3xl font-bold text-white mb-4">Support This Project</h2>
            <div className="mb-8 text-slate-300">
              <p className="mb-4">
                Hi! I'm a 19-year-old developer from Nepal, and this is my third SaaS project. 
                I'm building this tool to help people manage their calendars more effectively.
              </p>
              <p>
                As a developer from a country with limited payment integration options, 
                your support through Buy Me a Coffee would mean the world to me and help 
                keep this project running.
              </p>
            </div>
            <a 
              href="https://www.buymeacoffee.com/aayushgelat" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Button size="lg" className="bg-yellow-400 text-slate-900 hover:bg-yellow-300 flex items-center gap-2">
                <Image 
                  src="/bmc-logo.png" 
                  alt="Buy Me a Coffee" 
                  width={24} 
                  height={24} 
                />
                Buy Me a Coffee
              </Button>
            </a>
          </div>
        </div>
        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2024 SyncMyCal. All rights reserved.</p>
          </div>
      </section>

      {/* Footer */}
  
      
        
    </div>
  );
}