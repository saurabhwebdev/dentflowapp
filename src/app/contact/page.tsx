"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Mail, Phone, MapPin, Clock, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

// Create form schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().optional(),
  subject: z.string().min(5, { message: 'Subject must be at least 5 characters.' }),
  message: z.string().min(10, { message: 'Message must be at least 10 characters.' }),
});

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      phone: '',
      subject: '',
      message: '',
    },
  });

  // Contact information
  const contactInfo = [
    {
      icon: <Mail className="h-5 w-5" />,
      title: 'Email Us',
      details: 'info@dentflowpro.com',
      description: 'For general inquiries and information'
    },
    {
      icon: <Phone className="h-5 w-5" />,
      title: 'Call Us',
      details: '(123) 456-7890',
      description: 'Monday-Friday, 9AM-5PM EST'
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: 'Office Location',
      details: '1234 Dental Avenue, Suite 567',
      description: 'New York, NY 10001'
    },
    {
      icon: <Clock className="h-5 w-5" />,
      title: 'Support Hours',
      details: '24/7 Technical Support',
      description: 'Business hours for general inquiries'
    }
  ];

  // Form submission handler
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Save to Firebase
      await addDoc(collection(db, 'contact_messages'), {
        ...values,
        userId: user?.uid || null,
        createdAt: serverTimestamp(),
        status: 'new'
      });

      toast({
        title: "Message Sent!",
        description: "We've received your message and will respond shortly.",
      });
      form.reset();
    } catch (error) {
      console.error("Error saving contact message:", error);
      toast({
        title: "Error",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">Contact Us</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions about DentFlow Pro? We're here to help. Reach out to our team for support,
          sales inquiries, or to schedule a demo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <Card className="shadow-lg border-0 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-blue-500"></div>
          <CardHeader>
            <CardTitle>Send Us a Message</CardTitle>
            <CardDescription>
              Fill out the form below and we'll get back to you as soon as possible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Your email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Message subject" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="How can we help you?" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : 'Send Message'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div>
          <h2 className="text-xl font-bold mb-6 text-primary">Get in Touch</h2>
          <div className="grid grid-cols-1 gap-6">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-start bg-card p-4 rounded-lg shadow-sm transition-all hover:shadow-md">
                <div className="bg-primary/10 p-3 rounded-full mr-4">
                  <div className="text-primary">{item.icon}</div>
                </div>
                <div>
                  <h3 className="font-medium text-lg">{item.title}</h3>
                  <p className="font-medium">{item.details}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-card p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4 text-primary">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h3 className="font-medium">How do I schedule a demo?</h3>
                <p className="text-sm text-muted-foreground">
                  You can schedule a personalized demo by contacting our sales team via the form or calling us directly.
                </p>
              </div>
              <div className="border-b pb-2">
                <h3 className="font-medium">Is technical support included?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, all plans include 24/7 technical support to ensure your practice runs smoothly.
                </p>
              </div>
              <div>
                <h3 className="font-medium">Do you offer training?</h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we provide comprehensive onboarding and training for all team members.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 