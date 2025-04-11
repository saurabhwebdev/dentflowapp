import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckCircle2, Users, Star, Shield, Sparkles, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  // Team members
  const team = [
    {
      name: 'Dr. Sarah Johnson',
      role: 'Founder & CEO',
      bio: 'Former dental practice owner with 15+ years of clinical experience. Sarah founded DentFlow Pro to solve the challenges she experienced firsthand.',
      avatar: '/team/sarah.jpg'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      bio: 'Software engineer with expertise in healthcare technology. Passionate about creating intuitive solutions for complex healthcare workflows.',
      avatar: '/team/michael.jpg'
    },
    {
      name: 'Dr. Robert Garcia',
      role: 'Clinical Advisor',
      bio: 'Practicing dentist with a specialty in prosthodontics. Ensures that DentFlow Pro meets the real-world needs of dental professionals.',
      avatar: '/team/robert.jpg'
    },
    {
      name: 'Aisha Patel',
      role: 'Head of Customer Success',
      bio: 'Former dental office manager with a deep understanding of practice operations and patient management needs.',
      avatar: '/team/aisha.jpg'
    }
  ];

  // Company values with icons
  const values = [
    {
      icon: <Heart className="h-6 w-6 text-primary" />,
      title: 'Patient-Centered',
      description: 'We believe that excellent dental software should ultimately enhance the patient experience.'
    },
    {
      icon: <Users className="h-6 w-6 text-primary" />,
      title: 'Practitioner-Focused',
      description: 'Our solutions are designed with input from practicing dental professionals to ensure real-world utility.'
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: 'Innovation-Driven',
      description: 'We continuously evolve our platform to incorporate the latest technologies and best practices.'
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: 'Security-Committed',
      description: 'We maintain the highest standards of data protection and regulatory compliance.'
    }
  ];

  // Timeline
  const timeline = [
    {
      year: '2018',
      title: 'Foundation',
      description: 'Dr. Sarah Johnson founded DentFlow Pro after experiencing the limitations of existing dental software.'
    },
    {
      year: '2019',
      title: 'First Release',
      description: 'The initial version of DentFlow Pro was launched, focusing on appointment scheduling and patient records.'
    },
    {
      year: '2020',
      title: 'Expansion',
      description: 'Added billing, insurance processing, and integrated communication features to create a complete practice solution.'
    },
    {
      year: '2022',
      title: 'Growth',
      description: 'Reached the milestone of 1,000+ dental practices using DentFlow Pro across the country.'
    },
    {
      year: '2023',
      title: 'Innovation',
      description: 'Launched advanced analytics and AI-assisted treatment planning features to further enhance practice success.'
    }
  ];

  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto mb-20 text-center">
          <div className="inline-block mb-4">
            <Badge variant="outline" className="px-4 py-1 text-primary font-medium rounded-full">
              Our Story
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
            About DentFlow Pro
          </h1>
          <p className="text-lg mb-6">
            DentFlow Pro was born from a simple idea: dental practice management should be intuitive, 
            efficient, and focused on what matters most—patient care.
          </p>
          <p className="text-muted-foreground mb-8">
            Founded in 2018 by Dr. Sarah Johnson, a practicing dentist frustrated with existing software solutions, 
            DentFlow Pro has grown to serve thousands of dental professionals across the country.
            Our mission is to simplify the business of dentistry so practitioners can focus on providing exceptional care.
          </p>
        </div>

        {/* Our Journey Timeline */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="relative">
            {/* Timeline center line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-border"></div>
            
            <div className="space-y-16">
              {timeline.map((item, index) => (
                <div key={index} className={`relative flex ${index % 2 === 0 ? 'justify-start md:justify-end' : 'justify-start'} md:px-8`}>
                  <div className={`w-full md:w-5/12 p-6 rounded-xl shadow-sm border bg-card relative ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                    {/* Year badge */}
                    <div className="absolute -top-4 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold">
                      {item.year}
                    </div>
                    {/* Timeline node */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 md:translate-x-1/2 w-4 h-4 bg-primary rounded-full border-4 border-background z-10"></div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-primary to-blue-500"></div>
                <CardContent className="pt-6">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-3 rounded-full mr-4 flex-shrink-0">
                      {value.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-2">{value.title}</h3>
                      <p className="text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Our Team */}
        <div className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, index) => (
              <div key={index} className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition-all flex items-start">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex-shrink-0 mr-4 overflow-hidden flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">{member.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-card rounded-xl p-8 md:p-12 shadow-md text-center max-w-4xl mx-auto border relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-blue-500/5"></div>
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the DentFlow Pro Community</h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-8">
              Experience a dental practice management solution built by dental professionals, for dental professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full px-8">
                <Link href="/dashboard">Start Your Journey</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8">
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 