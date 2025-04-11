"use client";

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Scale, Clock, CreditCard, AlertCircle, Users, MessageSquare } from 'lucide-react';

export default function TermsOfServicePage() {
  const lastUpdated = "April 1, 2023";
  
  // Sections of the terms of service
  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <FileText className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">By accessing or using DentFlow Pro's website, services, or applications, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you must not access or use our services.</p>
          <p className="mb-3">These Terms of Service apply to all visitors, users, and others who access or use our services. By accessing or using any part of our services, you agree to be bound by these Terms of Service.</p>
          <p>You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change, or replace any part of these Terms of Service by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.</p>
        </>
      ),
    },
    {
      id: "account",
      title: "Account Registration and Security",
      icon: <Users className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">To access certain features of our services, you may be required to register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
          <p className="mb-3">You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer or device. You agree to accept responsibility for all activities that occur under your account or password.</p>
          <p>If you suspect any unauthorized use of your account or security breach, you should notify us immediately. We reserve the right to refuse service, terminate accounts, or remove or edit content in our sole discretion.</p>
        </>
      ),
    },
    {
      id: "subscription",
      title: "Subscription and Payments",
      icon: <CreditCard className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">Some aspects of our services may be provided for a fee. You will be required to select a payment plan and provide accurate payment information. By submitting such information, you grant us the right to provide the information to third parties for purposes of facilitating payment.</p>
          <p className="mb-3">The subscription fee will be billed on a recurring basis according to the billing cycle you select when purchasing a subscription. Subscription fees are non-refundable except as required by law or as explicitly stated in these Terms of Service.</p>
          <p className="mb-3">We may change subscription fees at any time, but will provide you with advance notice before changes take effect. If you do not agree with the fee changes, you have the right to reject the change by cancelling your subscription before the fee change takes effect.</p>
          <p>You may cancel your subscription at any time through your account settings or by contacting our customer support team. If you cancel, you will still have access to your subscription until the end of your current billing period, but you will not receive a refund for the current billing period.</p>
        </>
      ),
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property Rights",
      icon: <Scale className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">The content, features, and functionality of our services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are owned by DentFlow Pro, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          <p className="mb-3">These Terms of Service permit you to use our services for your personal, non-commercial use only. You must not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our services.</p>
          <p>You must not access or use for any commercial purposes any part of our services or any materials available through our services.</p>
        </>
      ),
    },
    {
      id: "prohibited-uses",
      title: "Prohibited Uses",
      icon: <AlertCircle className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">You may use our services only for lawful purposes and in accordance with these Terms of Service. You agree not to use our services:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>For the purpose of exploiting, harming, or attempting to exploit or harm minors in any way.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate DentFlow Pro, a DentFlow Pro employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of our services, or which may harm DentFlow Pro or users of our services or expose them to liability.</li>
          </ul>
          <p>Additionally, you agree not to:</p>
          <ul className="list-disc pl-6 space-y-2 mb-3">
            <li>Use our services in any manner that could disable, overburden, damage, or impair the site or interfere with any other party's use of our services.</li>
            <li>Use any robot, spider, or other automatic device, process, or means to access our services for any purpose, including monitoring or copying any of the material on our services.</li>
            <li>Use any manual process to monitor or copy any of the material on our services or for any other unauthorized purpose without our prior written consent.</li>
            <li>Use any device, software, or routine that interferes with the proper working of our services.</li>
            <li>Introduce any viruses, Trojan horses, worms, logic bombs, or other material that is malicious or technologically harmful.</li>
            <li>Attempt to gain unauthorized access to, interfere with, damage, or disrupt any parts of our services, the server on which our services is stored, or any server, computer, or database connected to our services.</li>
            <li>Attack our services via a denial-of-service attack or a distributed denial-of-service attack.</li>
          </ul>
        </>
      ),
    },
    {
      id: "termination",
      title: "Termination",
      icon: <Clock className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">We may terminate or suspend your account and access to our services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms of Service.</p>
          <p className="mb-3">Upon termination, your right to use our services will immediately cease. If you wish to terminate your account, you may simply discontinue using our services or contact us to request account deletion.</p>
          <p>All provisions of the Terms of Service which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
        </>
      ),
    },
    {
      id: "contact-us",
      title: "Contact Us",
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      content: (
        <>
          <p className="mb-3">If you have any questions about these Terms of Service, please contact us at:</p>
          <address className="not-italic">
            <p>DentFlow Pro</p>
            <p>1234 Dental Avenue, Suite 567</p>
            <p>New York, NY 10001</p>
            <p>Email: <a href="mailto:legal@dentflowpro.com" className="text-primary hover:underline">legal@dentflowpro.com</a></p>
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
            Terms of Service
          </h1>
          <p className="text-muted-foreground">
            Last Updated: {lastUpdated}
          </p>
          <p className="mt-4 text-lg max-w-3xl mx-auto">
            These Terms of Service ("Terms") govern your access to and use of DentFlow Pro's website, 
            services, and applications. Please read these Terms carefully before using our services.
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

        {/* Terms Sections */}
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
                <Link href="/privacy">Privacy Policy</Link>
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