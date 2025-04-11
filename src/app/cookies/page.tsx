"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cookie, Settings, FileText, Check, X, Mail } from 'lucide-react';

export default function CookiePolicyPage() {
  const lastUpdated = "April 1, 2023";
  
  // Cookie types with examples
  const cookieTypes = [
    {
      id: "essential",
      title: "Essential Cookies",
      required: true,
      description: "These cookies are necessary for the website to function and cannot be switched off in our systems.",
      examples: [
        { name: "session_id", purpose: "Manages user session" },
        { name: "csrf_token", purpose: "Prevents cross-site request forgery" },
        { name: "auth_token", purpose: "Maintains authentication state" },
      ]
    },
    {
      id: "functional",
      title: "Functional Cookies",
      required: false,
      description: "These cookies enable the website to provide enhanced functionality and personalization.",
      examples: [
        { name: "language_preference", purpose: "Remembers your preferred language" },
        { name: "ui_theme", purpose: "Stores your interface preferences" },
        { name: "recently_viewed", purpose: "Remembers features you've viewed" },
      ]
    },
    {
      id: "performance",
      title: "Performance & Analytics Cookies",
      required: false,
      description: "These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.",
      examples: [
        { name: "_ga", purpose: "Google Analytics - Distinguishes users" },
        { name: "_gid", purpose: "Google Analytics - Identifies user session" },
        { name: "_hjid", purpose: "Hotjar - Anonymous user identification" },
      ]
    },
    {
      id: "targeting",
      title: "Targeting Cookies",
      required: false,
      description: "These cookies may be set through our site by our advertising partners to build a profile of your interests.",
      examples: [
        { name: "_fbp", purpose: "Facebook - Advertising delivery and analysis" },
        { name: "_gcl_au", purpose: "Google Ads - Conversion linking" },
        { name: "IDE", purpose: "DoubleClick - Ad personalization" },
      ]
    },
  ];
  
  // Sections of the cookie policy
  const sections = [
    {
      id: "what-are-cookies",
      title: "What Are Cookies",
      icon: <Cookie className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used in order to make websites work more efficiently, as well as to provide information to the owners of the site.</p>
          <p className="mb-3">Cookies help us provide you with a better online experience by enabling us to monitor which pages you find useful and which you do not. A cookie does not give us access to your computer or any information about you, other than the data you choose to share with us.</p>
          <p>Cookies set by the website owner (in this case, DentFlow Pro) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (such as advertising, interactive content, and analytics).</p>
        </>
      ),
    },
    {
      id: "how-we-use-cookies",
      title: "How We Use Cookies",
      icon: <Settings className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">We use cookies for a variety of reasons detailed below. Unfortunately, in most cases, there are no industry standard options for disabling cookies without completely disabling the functionality and features they add to this site.</p>
          <p className="mb-3">It is recommended that you leave on all cookies if you are not sure whether you need them or not, in case they are used to provide a service that you use.</p>
          <div className="bg-muted p-4 rounded-lg mt-6 mb-6">
            <h3 className="font-bold mb-2">Types of Cookies We Use</h3>
            <div className="space-y-4">
              {cookieTypes.map((type) => (
                <div key={type.id} className="border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{type.title}</h4>
                    <div className="flex items-center">
                      {type.required ? (
                        <Badge variant="secondary">Required</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm mb-2">{type.description}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium mb-1">Examples:</p>
                    <ul className="text-xs space-y-1">
                      {type.examples.map((example, index) => (
                        <li key={index} className="flex items-start">
                          <code className="bg-muted-foreground/20 px-1 rounded text-xs mr-2">{example.name}</code>
                          <span className="text-muted-foreground">{example.purpose}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      id: "managing-cookies",
      title: "Managing Cookies",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.</p>
          <p className="mb-6">Most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set and how to manage and delete them, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.allaboutcookies.org</a>.</p>
          
          <h3 className="font-bold mb-3">How to manage cookies in major browsers:</h3>
          <ul className="list-disc pl-6 space-y-2 mb-6">
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
            <li><strong>Edge:</strong> Settings → Cookies and site permissions → Cookies and site data</li>
          </ul>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-bold flex items-center mb-3">
              <Check className="h-4 w-4 mr-2 text-green-500" />
              Our Cookie Preferences Tool
            </h3>
            <p className="mb-3">You can also manage your cookie preferences specifically for our website by using our cookie preferences tool, which can be accessed by clicking the "Cookie Settings" button in the footer of our website.</p>
            <p>This tool allows you to selectively enable or disable non-essential cookies used by our website.</p>
          </div>
        </>
      ),
    },
    {
      id: "third-party-cookies",
      title: "Third-Party Cookies",
      icon: <X className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">In some special cases, we also use cookies provided by trusted third parties. The following section details which third-party cookies you might encounter through this site.</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>This site uses Google Analytics, one of the most widespread and trusted analytics solutions on the web, to help us understand how you use the site and ways that we can improve your experience. These cookies may track things such as how long you spend on the site and the pages that you visit so we can continue to produce engaging content.</li>
            <li>We also use social media buttons and/or plugins on this site that allow you to connect with your social network in various ways. For these to work, social media sites including Facebook, Twitter, and LinkedIn, will set cookies through our site which may be used to enhance your profile on their site or contribute to the data they hold for various purposes outlined in their respective privacy policies.</li>
            <li>We use advertising services that use cookies to help us deliver personalized content and ads that are relevant to your interests. These cookies may also be used for remarketing purposes and to track website conversions.</li>
          </ul>
          <p>For more information on Google Analytics cookies, see the official <a href="https://developers.google.com/analytics/devguides/collection/analyticsjs/cookie-usage" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Analytics page</a>.</p>
        </>
      ),
    },
    {
      id: "contact-us",
      title: "Contact Us",
      icon: <Mail className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">If you have any questions about our Cookie Policy, please contact us at:</p>
          <address className="not-italic">
            <p>DentFlow Pro</p>
            <p>1234 Dental Avenue, Suite 567</p>
            <p>New York, NY 10001</p>
            <p>Email: <a href="mailto:privacy@dentflowpro.com" className="text-primary hover:underline">privacy@dentflowpro.com</a></p>
            <p>Phone: (123) 456-7890</p>
          </address>
        </>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="px-4 py-1 text-primary font-medium rounded-full">
              Legal
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Cookie Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
          <p className="mt-4 text-lg max-w-3xl mx-auto">
            This Cookie Policy explains how DentFlow Pro uses cookies and similar technologies
            to recognize you when you visit our website. It explains what these technologies are
            and why we use them, as well as your rights to control our use of them.
          </p>
        </div>

        {/* Table of Contents */}
        <Card className="mb-10 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-blue-500"></div>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              {sections.map((section) => (
                <li key={section.id}>
                  <a 
                    href={`#${section.id}`} 
                    className="text-primary hover:underline flex items-center"
                  >
                    <span className="mr-2">&bull;</span>
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Policy Sections */}
        <div className="space-y-12">
          {sections.map((section) => (
            <div key={section.id} id={section.id} className="scroll-mt-24">
              <Card className="overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-blue-500"></div>
                <CardContent className="pt-6">
                  <div className="flex items-start mb-4">
                    <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                      {section.icon}
                    </div>
                    <h2 className="text-2xl font-bold pt-2">{section.title}</h2>
                  </div>
                  <div className="text-muted-foreground">
                    {section.content}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Cookie Settings Button */}
        <div className="mt-12 flex justify-center">
          <Button className="rounded-full">
            Cookie Settings
          </Button>
        </div>

        {/* Other Legal Documents */}
        <Card className="mt-16 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-blue-500"></div>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Related Legal Documents</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/privacy">Privacy Policy</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/terms">Terms of Service</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}