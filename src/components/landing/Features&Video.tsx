"use client"
import { motion } from "framer-motion";
import { 
  CalendarDays, 
  RefreshCcw, 
  Shield, 
  Zap,
  Calendar
} from "lucide-react";
import Image from "next/image";

const features = [
  {
    icon: <CalendarDays className="h-6 w-6" />,
    title: "Cross-Platform Sync",
    description: "Seamlessly sync between Google Calendar and Microsoft Outlook calendars"
  },
  {
    icon: <RefreshCcw className="h-6 w-6" />,
    title: "Real-Time Updates",
    description: "Changes reflect instantly across all your connected calendars"
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure & Private",
    description: "Your calendar data is encrypted and never stored on our servers"
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Multiple Calendars",
    description: "Connect and sync multiple calendars from different accounts"
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "Smart Sync Rules",
    description: "Customize sync behavior with working hours and event filters"
  }
];

export default function FeaturesAndVideo() {
  return (
    <section className="py-24 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features Column */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-3xl font-bold text-gray-900 font-poppins">
                Everything you need for seamless calendar sync
              </h2>
              <p className="text-lg text-gray-600 font-poppins">
                Simple yet powerful features designed to make calendar management effortless
              </p>
            </motion.div>

            <div className="grid gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1 font-poppins">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm font-poppins">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Video Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-video rounded-2xl overflow-hidden bg-gray-100 relative group cursor-pointer">
              <iframe
                src="https://player.vimeo.com/video/1040452397?autoplay=1&muted=1"
                width="640"
                height="360"
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="How SyncMyCal Works"
              />
              <div className="absolute inset-0 group-hover:bg-black/40 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <h3 className="text-white text-xl font-semibold font-poppins">
                  See how it works
                </h3>
                <p className="text-white/80 text-sm font-poppins">
                  Watch our 2-minute demo
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}