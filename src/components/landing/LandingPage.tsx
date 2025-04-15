import React, { ReactNode } from "react";
import { ArrowRight, Zap, Key, Github, MessageSquare } from "lucide-react";
import {
  SignInButton,
  SignUpButton,
  useSignIn,
} from "@clerk/tanstack-react-start";
import { Button } from "~/components/Button";
// import FAQ from "@/components/FAQ";

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

const HeroImage = () => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-100 rounded-3xl transform rotate-3 scale-95 opacity-50"></div>
      <div className="relative bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <div className="text-xs text-gray-500 grow text-center">
            Replichat
          </div>
        </div>
        <div className="p-4 h-64 md:h-80 flex flex-col gap-4 overflow-y-auto">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-indigo-600">AI</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-sm">
              Hello! How can I assist you today?
            </div>
          </div>
          <div className="flex gap-3 items-start flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">You</span>
            </div>
            <div className="bg-indigo-500 text-white rounded-2xl rounded-tr-none p-3 text-sm">
              Can you explain how local-first architecture works?
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-indigo-600">AI</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-sm">
              Local-first architecture prioritizes storing and processing data
              on your device first. This creates instant UI responses while
              still syncing with the server in the background. The benefits
              include faster performance, offline capabilities, and improved
              privacy since your data primarily stays on your device.
            </div>
          </div>
          <div className="flex gap-3 items-start flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-xs font-medium text-white">You</span>
            </div>
            <div className="bg-indigo-500 text-white rounded-2xl rounded-tr-none p-3 text-sm">
              That sounds great! And it's completely open source?
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-indigo-600">AI</span>
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-none p-3 text-sm animate-pulse">
              Yes! The entire codebase is available on GitHub so you can review
              it, contribute, or even fork it for your own projects.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LandingPage = () => {
  const signIn = useSignIn();
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <header className="container mx-auto py-6 px-4 md:px-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold">Replichat</span>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton>
              <Button variant="secondary">Sign In</Button>
            </SignInButton>
            <SignUpButton>
              <Button>Sign Up</Button>
            </SignUpButton>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
              Advanced AI chat with total control and privacy
            </h1>
            <p className="text-xl text-gray-600">
              Experience instant responses with our local-first architecture.
              Bring your own API key and maintain complete privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <SignUpButton>
                <Button size="lg">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </SignUpButton>
              <Button size="lg" variant="secondary">
                <a
                  href="http://github.com/antoinechalifour/replichat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> View on GitHub
                </a>
              </Button>
            </div>
          </div>
          <div className="order-first md:order-last">
            <HeroImage />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Replichat?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Built with performance and privacy in mind, bringing the power of AI
            to your fingertips.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-indigo-500" />}
            title="Lightning Fast"
            description="Local-first architecture provides instant UI responses without waiting for server roundtrips."
          />
          <FeatureCard
            icon={<Key className="h-10 w-10 text-indigo-500" />}
            title="Your API Key"
            description="Use your own OpenAI API key for complete control over your usage and costs."
          />
          <FeatureCard
            icon={<Github className="h-10 w-10 text-indigo-500" />}
            title="Open Source"
            description="Fully transparent codebase that you can inspect, modify, and contribute to."
          />
        </div>
      </section>

      {/* Open Source Section */}
      <section className="bg-indigo-50 py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">
                Open Source & Community Driven
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                We believe in transparency and collaboration. Replichat is fully
                open source, allowing developers to inspect the code, contribute
                improvements, and build upon our foundation.
              </p>
              <Button>
                <a
                  href="http://github.com/antoinechalifour/replichat/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" /> Star on GitHub
                </a>
              </Button>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg overflow-hidden">
              <pre className="text-xs md:text-sm text-gray-800 overflow-x-auto">
                <code>
                  {`git clone https://github.com/antoinechalifour/replichat.git
cd replichat
npm install
npm start`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to know about Replichat
          </p>
        </div>

        <div className="max-w-3xl mx-auto">{/*<FAQ />*/}</div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-indigo-500 to-purple-600 py-16">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to experience the future of AI chat?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have already made the switch to a
            faster, more private AI chat experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton>
              <Button
                size="lg"
                className="bg-white/90 text-indigo-800 !border-indigo-600"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton>
              <Button
                size="lg"
                className="bg-white text-indigo-800 !border-indigo-600 font-semibold"
              >
                Create Account
              </Button>
            </SignUpButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              <span className="text-lg font-bold">Replichat</span>
            </div>
            <div className="flex gap-6">
              <a
                href="http://github.com/antoinechalifour/replichat/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
            <p>© {new Date().getFullYear()} Replichat. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
