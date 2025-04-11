import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Calendar,
  Users,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart2,
  Settings,
  Shield,
  ArrowRight,
  Check
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ServicesPage() {
  // Services data
  const services = [
    {
      icon: <Calendar className="h-8 w-8" />,
      title: "Appointment Management",
      description: "Streamline scheduling with an intuitive calendar interface. Reduce no-shows with automated reminders and allow online booking for your patients.",
      features: ["Online booking", "Automated reminders", "Calendar integration", "Schedule optimization"]
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Patient Records",
      description: "Maintain comprehensive digital records. Store patient history, treatment plans, and notes securely in one centralized location.",
      features: ["Digital charting", "Treatment history", "Document storage", "Quick search"]
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Treatment Planning",
      description: "Create detailed treatment plans with visual tooth charts. Track progress and maintain a complete history of patient care.",
      features: ["Visual tooth charts", "Treatment sequencing", "Cost estimates", "Progress tracking"]
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Billing & Insurance",
      description: "Streamline financial operations with integrated billing. Process insurance claims efficiently and offer flexible payment options.",
      features: ["Insurance verification", "Claims processing", "Payment plans", "Automated billing"]
    },
    {
      icon: <MessageSquare className="h-8 w-8" />,
      title: "Patient Communication",
      description: "Enhance engagement with automated appointment reminders, follow-ups, and personalized messages to improve the patient experience.",
      features: ["Text messaging", "Email campaigns", "Recall notifications", "Review requests"]
    },
    {
      icon: <BarChart2 className="h-8 w-8" />,
      title: "Reports & Analytics",
      description: "Gain valuable insights with comprehensive practice analytics. Track performance metrics and identify growth opportunities.",
      features: ["Revenue reporting", "Patient statistics", "Treatment analysis", "Growth tracking"]
    }
  ];

  // Specialized solutions
  const specializedSolutions = [
    {
      title: "For Solo Practitioners",
      features: ["Streamlined workflows", "Cost-effective solutions", "Easy implementation", "All-in-one platform"]
    },
    {
      title: "For Group Practices",
      features: ["Multi-location management", "Provider scheduling", "Unified patient records", "Performance tracking"]
    },
    {
      title: "For Specialists",
      features: ["Specialty-specific workflows", "Referral management", "Advanced charting", "Integration with GP systems"]
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 relative">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="px-4 py-1 text-primary font-medium rounded-full">
              Comprehensive Solution
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            Our Services
          </h1>
          <p className="text-lg text-muted-foreground">
            DentFlow Pro offers a comprehensive suite of tools designed specifically for dental practices,
            helping you streamline operations, enhance patient care, and grow your practice.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {services.map((service, index) => (
            <div key={index} className="group rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-10 -mt-10 transition-all group-hover:bg-primary/10"></div>
              <div className="text-primary mb-4">{service.icon}</div>
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-muted-foreground mb-6">{service.description}</p>
              
              <div className="mt-6 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                <ul className="space-y-1">
                  {service.features.map((feature, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <Check className="h-4 w-4 text-primary mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Button variant="ghost" size="sm" className="mt-4 group-hover:text-primary transition-colors flex items-center">
                Learn more <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Specialized Solutions */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Specialized Solutions</h2>
            <p className="text-muted-foreground mt-2">Tailored to your specific practice needs</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {specializedSolutions.map((solution, index) => (
              <div key={index} className="rounded-xl bg-card border p-6 hover:border-primary transition-colors">
                <h3 className="text-xl font-bold mb-4">{solution.title}</h3>
                <ul className="space-y-3">
                  {solution.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <div className="bg-primary/10 p-1 rounded-full mr-3">
                        <Check className="h-4 w-4 text-primary" />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-card rounded-xl p-8 md:p-12 shadow-md text-center max-w-4xl mx-auto border">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your dental practice?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Join thousands of dental professionals who trust DentFlow Pro to manage their practice efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link href="/dashboard">Get Started Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8">
              <Link href="/contact">Schedule a Demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 