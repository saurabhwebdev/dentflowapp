"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Loader2, MessageSquare } from 'lucide-react';

export function Footer() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFeedbackSubmit = async () => {
    if (!user || !feedback.trim()) return;

    setIsSending(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userEmail: user.email,
        message: feedback,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Thank you for your feedback",
        description: "We appreciate your input!",
      });

      setFeedback('');
      setIsOpen(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Full footer for non-authenticated users
  if (!user) {
    return (
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-10 md:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">DentFlow Pro</h3>
              <p className="text-sm text-muted-foreground">
                Transforming dental practice management with innovative solutions designed for modern dental professionals.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Services
                  </a>
                </li>
                <li>
                  <a href="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="not-italic">
                <p className="text-sm text-muted-foreground mb-2">
                  1234 Dental Avenue<br />
                  Suite 567<br />
                  New York, NY 10001
                </p>
                <p className="text-sm text-muted-foreground mb-2">
                  Email: <a href="mailto:info@dentflowpro.com" className="hover:text-foreground transition-colors">info@dentflowpro.com</a>
                </p>
                <p className="text-sm text-muted-foreground">
                  Phone: <a href="tel:+12345678901" className="hover:text-foreground transition-colors">(123) 456-7890</a>
                </p>
              </address>
            </div>
          </div>
          
          <div className="border-t mt-10 pt-6">
            <p className="text-center text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} DentFlow Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    );
  }

  // Minimal footer for authenticated users
  return (
    <footer className="border-t bg-background py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} DentFlow Pro. All rights reserved.
        </p>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>Feedback</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Share your feedback</DialogTitle>
              <DialogDescription>
                We'd love to hear your thoughts on how we can improve DentFlow Pro.
              </DialogDescription>
            </DialogHeader>
            
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please share your experience, suggestions, or report any issues..."
              className="min-h-[150px]"
            />
            
            <DialogFooter>
              <Button 
                onClick={handleFeedbackSubmit} 
                disabled={isSending || !feedback.trim()}
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : 'Submit Feedback'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </footer>
  );
} 