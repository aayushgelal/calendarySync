"use client"
import React from 'react';
import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check } from 'lucide-react';
import FeaturesAndVideo from '@/components/landing/Features&Video';
import Link from 'next/link';

export default function LandingContent() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">CalSync</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="#features">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Features
              </Button>
              </Link>
              <Link href="#pricing">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                Pricing
              </Button>
              </Link>
              <Link href="#beta">
              <Button variant="outline" className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300">
                Join Beta
              </Button>
              </Link>
  
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
            The secure, easy way to:
             Sync all your calendars
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
            <p className="mt-4 text-sm text-slate-500">
              Free 30-day trial for beta testers • No credit card required
            </p>
          </motion.div>
        </div>
      </section>
      <FeaturesAndVideo />
      <PricingSection />  {/* Beta Trial Form */}
      <section className="py-20" id="beta">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-600 rounded-2xl p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Join Our Beta Program</h2>
            <p className="mb-8">
              Be among the first to try our advanced calendar synchronization features.
              Limited spots available!
            </p>
            <form className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full p-3 rounded-lg text-slate-900"
              />
              <Button size="lg" variant="secondary" className="w-full">
                Join Beta
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">CalSync</h3>
              <p className="text-slate-400">
                Seamless calendar synchronization for busy professionals.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Beta Program</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Blog</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Privacy</li>
                <li>Terms</li>
                <li>Security</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>© 2024 CalSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
  

      {/* Rest of your landing page sections... */}
    </div>
  );
}

// ... (previous imports and code remain the same)

const PricingSection = () => {
  const plans = [
    {
      name: "Beta Trial",
      price: "Free",
      duration: "30 Days",
      forBeta: true,
      features: [
        "Full Access to All Features",
        "Unlimited Calendar Connections",
        "Real-time Sync",
        "Google Calendar Support",
        "Outlook Calendar Support",
        "Priority Support During Beta",
        "Help Shape the Product"
      ],
      buttonText: "Join Beta Program",
      highlight: true
    },
    {
      name: "Premium",
      price: "$5",
      duration: "per month",
      yearlyPrice: "$40/year",
      features: [
        "Full Access to All Features",
        "Unlimited Calendar Connections",
        "Real-time Sync",
        "Google Calendar Support",
        "Outlook Calendar Support",
        "Priority Support",
        "7-Day Free Trial"
      ],
      buttonText: "Get Started",
      highlight: false
    }
  ];

  return (
    <section className="py-20 bg-slate-50" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Start with our extended Beta trial or jump right in with our Premium plan. 
            No hidden fees, no complicated tiers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className={`
                rounded-2xl p-8 
                ${plan.highlight 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white'
                }
                ${plan.highlight 
                  ? 'shadow-lg shadow-blue-200' 
                  : 'shadow-lg'
                }
              `}
            >
              {plan.forBeta && (
                <span className="inline-block px-4 py-1 rounded-full bg-blue-500 text-white text-sm font-medium mb-4">
                  Limited Time Offer
                </span>
              )}
              
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-lg ml-1">/{plan.duration}</span>
                {plan.yearlyPrice && (
                  <p className="text-sm mt-1 opacity-90">or {plan.yearlyPrice} (save ~33%)</p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className={`h-5 w-5 mt-0.5 ${plan.highlight ? 'text-white' : 'text-blue-600'}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full ${
                  plan.highlight
                    ? 'bg-white text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
                size="lg"
              >
                {plan.buttonText}
              </Button>

              {plan.forBeta ? (
                <p className="text-sm mt-4 text-center opacity-90">
                  Limited spots available for beta testing
                </p>
              ) : (
                <p className="text-sm mt-4 text-center text-slate-600">
                  No credit card required for trial
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600">
            All plans include full access to all features. 
            Pricing is per user. Need more information? {" "}
            <a href="#contact" className="text-blue-600 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};


