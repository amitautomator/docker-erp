"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

export default function Page() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      emoji: "/google.svg",
      title: "Google Workspace",
      desc: "Automate your Sheets, Docs, Drive, and Gmail to work smarter, not harder",
      gradient: "from-red-600 to-yellow-500",
    },
    {
      emoji: "/WhatsApp.svg",
      title: "WhatsApp Integration",
      desc: "Connect your business with customers through automated WhatsApp workflows",
      gradient: "from-teal-500 to-yellow-500",
    },
    {
      emoji: "/gmail.svg",
      title: "Email Automation",
      desc: "Streamline communication with intelligent email automation and tracking",
      gradient: "from-yellow-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-red-900/20 via-yellow-900/20 to-teal-900/20"></div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px)`,
          backgroundSize: "100px 100px",
        }}
      ></div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-linear-to-r from-red-600 to-yellow-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-r from-yellow-500 to-teal-500 rounded-full blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      {/* Mouse follower gradient */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none transition-all duration-300 ease-out"
        style={{
          background:
            "radial-gradient(circle, rgba(220,38,38,0.15) 0%, transparent 70%)",
          left: mousePosition.x - 300,
          top: mousePosition.y - 300,
        }}
      ></div>

      <div className="relative z-10 container mx-auto px-8 py-12">
        {/* Header */}
        <nav className="flex justify-between items-center mb-20">
          <div className="text-3xl font-black tracking-tight bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent flex items-center gap-4">
            <Image
              width={20}
              height={20}
              src="/Logo.png"
              alt="Logo"
              className="w-10 h-10"
            />
            Automate Ideas
          </div>
          <button className="group relative px-8 py-3 bg-white text-black rounded-full font-bold overflow-hidden">
            <span className="relative z-10">Contact Us</span>
            <div className="absolute inset-0 bg-linear-to-r from-red-600 to-yellow-500 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              Let&apos;s Talk ✨
            </span>
          </button>
        </nav>

        {/* Hero Section */}
        <div className="text-center max-w-6xl mx-auto mb-32">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full bg-linear-to-r from-red-600/20 to-yellow-500/20 border border-red-600/30 text-sm font-semibold backdrop-blur-sm">
              🚀 The Future of Business Automation
            </span>
          </div>

          <h1 className="text-7xl md:text-9xl font-black mb-8 leading-[0.9] tracking-tight">
            <span className="bg-linear-to-r from-white via-yellow-200 to-red-200 bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="bg-linear-to-r from-red-500 via-yellow-500 to-teal-500 bg-clip-text text-transparent animate-pulse">
              Business
            </span>
          </h1>

          <p className="text-2xl md:text-3xl mb-12 text-gray-400 max-w-4xl mx-auto font-light leading-relaxed">
            Streamline your workflow with{" "}
            <span className="text-white font-semibold">
              powerful automation
            </span>{" "}
            for Google Workspace, WhatsApp, and Email
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <button className="group relative px-12 py-6 bg-linear-to-r from-red-600 to-yellow-500 rounded-full font-bold text-xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-[0_0_50px_rgba(220,38,38,0.4)] hover:shadow-[0_0_80px_rgba(220,38,38,0.6)]">
              <span className="relative z-10 flex items-center justify-center gap-2">
                Get Started Free
                <span className="group-hover:translate-x-2 transition-transform duration-300">
                  →
                </span>
              </span>
            </button>
            <button className="group px-12 py-6 bg-white/5 backdrop-blur-sm border-2 border-white/20 rounded-full font-bold text-xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 transform hover:scale-105">
              <span className="flex items-center justify-center gap-2">
                Watch Demo
                <span className="group-hover:scale-110 transition-transform duration-300">
                  ▶
                </span>
              </span>
            </button>
          </div>

          {/* Floating stats cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-32">
            {[
              {
                value: "10x",
                label: "Faster Workflows",
                color: "from-red-600 to-yellow-500",
              },
              {
                value: "95%",
                label: "Time Saved",
                color: "from-yellow-500 to-teal-500",
              },
              {
                value: "24/7",
                label: "Always Running",
                color: "from-teal-500 to-red-600",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-110 cursor-pointer"
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-linear-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>
                <div
                  className={`text-6xl font-black mb-2 bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-7xl mx-auto mb-32">
          <h2 className="text-5xl font-black text-center mb-16">
            <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Powerful Features
            </span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group relative p-10 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 hover:-translate-y-4 cursor-pointer overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                ></div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-7xl mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                    <Image
                      width={40}
                      height={40}
                      src={feature.emoji}
                      alt={feature.title}
                      className="w-16 h-16 inline-block animate-pulse"
                    />
                  </div>
                  <h3
                    className={`text-3xl font-bold mb-4 bg-linear-to-r ${feature.gradient} bg-clip-text text-transparent`}
                  >
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {feature.desc}
                  </p>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000">
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-5xl mx-auto mb-20">
          <div className="relative p-16 rounded-3xl bg-linear-to-br from-red-600/20 to-teal-500/20 backdrop-blur-sm border border-red-600/30 overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
            {/* Animated gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-r from-red-600/0 via-yellow-500/20 to-red-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

            <div className="relative z-10 text-center">
              <h2 className="text-5xl font-black mb-6 bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Automate Your Ideas?
              </h2>
              <p className="text-2xl mb-10 text-gray-300 max-w-2xl mx-auto">
                Let&apos;s discuss how we can transform your business processes
              </p>
              <button className="group px-12 py-6 bg-white text-black rounded-full font-bold text-xl transform hover:scale-110 transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:shadow-[0_0_80px_rgba(255,255,255,0.5)]">
                <span className="flex items-center justify-center gap-2">
                  Schedule a Consultation
                  <span className="group-hover:translate-x-2 transition-transform duration-300">
                    ✨
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center text-gray-600 py-12 border-t border-white/10">
        <p>© 2025 Automate Ideas. All rights reserved.</p>
      </footer>
    </div>
  );
}
