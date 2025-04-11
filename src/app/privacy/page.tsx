"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, Server, Mail, FileText } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const lastUpdated = "April 1, 2023";
  
  // Sections of the privacy policy
  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Eye className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">We collect several types of information from and about users of our website and services, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li><strong>Personal Information:</strong> Name, email address, telephone number, postal address, and other identifiers that you voluntarily provide when using our services.</li>
            <li><strong>Practice Information:</strong> Information about your dental practice, including staff names, roles, certifications, and business details.</li>
            <li><strong>Patient Information:</strong> Information about your patients that you input into our system, including treatment history, appointment records, and payment information.</li>
            <li><strong>Technical Information:</strong> Internet protocol (IP) address, browser type, operating system, device information, and usage details.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website, services, and applications.</li>
          </ul>
          <p>We collect this information directly from you when you provide it to us, automatically as you navigate through the site, and from third parties, such as business partners or analytics providers.</p>
        </>
      ),
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: <Server className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">We use the information we collect about you or that you provide to us, including any personal information:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>To provide, maintain, and improve our services.</li>
            <li>To process and complete transactions, and send related information including confirmations and invoices.</li>
            <li>To provide customer support and respond to your requests, comments, or questions.</li>
            <li>To send administrative information such as changes to our terms, conditions, and policies.</li>
            <li>To personalize your experience and deliver content and product features relevant to your interests.</li>
            <li>To monitor and analyze usage, trends, and activities to improve our website and services.</li>
          </ul>
          <p>We may also use your information in any other way we may describe when you provide the information or for any other purpose with your consent.</p>
        </>
      ),
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: <Lock className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">We may disclose personal information that we collect or you provide as described in this privacy policy:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li><strong>Service Providers:</strong> To contractors, service providers, and other third parties we use to support our business and who are bound by contractual obligations to keep personal information confidential.</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of all or a portion of our assets, personal information may be transferred to the acquiring entity.</li>
            <li><strong>Legal Requirements:</strong> To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
            <li><strong>Protection:</strong> To enforce or apply our terms of use and other agreements, or to protect the rights, property, or safety of our company, our customers, or others.</li>
          </ul>
          <p>We do not sell, trade, or otherwise transfer your personal information to outside parties for marketing purposes without your consent.</p>
        </>
      ),
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Shield className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">We implement a variety of security measures to maintain the safety of your personal information, including:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>All sensitive information is transmitted via Secure Socket Layer (SSL) technology.</li>
            <li>All patient data is encrypted both in transit and at rest.</li>
            <li>Regular security audits and assessments.</li>
            <li>Access controls, including multi-factor authentication for staff accessing sensitive data.</li>
            <li>Regular backups to prevent data loss.</li>
            <li>Staff training on data protection and security practices.</li>
          </ul>
          <p>Despite our efforts, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.</p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">Depending on your location, you may have certain rights regarding your personal information, which may include:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>The right to access and receive a copy of your personal information.</li>
            <li>The right to rectify or update your personal information.</li>
            <li>The right to restrict or object to the processing of your personal information.</li>
            <li>The right to data portability (receiving your personal information in a structured, commonly used format).</li>
            <li>The right to withdraw consent where processing is based on consent.</li>
            <li>The right to erasure (also known as the "right to be forgotten").</li>
          </ul>
          <p>To exercise these rights, please contact us using the contact information provided below.</p>
        </>
      ),
    },
    {
      id: "contact-us",
      title: "Contact Us",
      icon: <Mail className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">If you have any questions about this Privacy Policy, please contact us at:</p>
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
          <p className="mt-4 text-lg max-w-3xl mx-auto">
            At DentFlow Pro, we are committed to protecting your privacy and the security of your personal information. 
            This Privacy Policy explains how we collect, use, disclose, and safeguard your information.
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

        {/* Back to Top */}
        <div className="mt-12 flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
            className="rounded-full"
          >
            Back to Top
          </Button>
        </div>

        {/* Other Legal Documents */}
        <Card className="mt-16 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-blue-500"></div>
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold mb-4">Related Legal Documents</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/terms">Terms of Service</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/cookies">Cookie Policy</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 