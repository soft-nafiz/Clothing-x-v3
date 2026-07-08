import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StorefrontShell } from "@/components/layout/storefront-shell";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { ContactForm } from "@/components/storefront/contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with CLOTHING X.",
};

export default function ContactPage() {
  return (
    <StorefrontShell>
      <MaxWidthWrapper className="py-8 md:py-12">
        <header className="mb-8 border-b border-border pb-6">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Get in Touch
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight md:text-4xl">
            Contact Us
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Questions about an order, a product, or a collaboration? We&apos;re here
            to help. Reach out via the form below or through any of our direct channels.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 font-serif text-lg">
                  <MessageSquare className="h-4 w-4 text-primary" /> Send a Message
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>

          {/* Contact info */}
          <aside className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-base">Direct Contact</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                      <p>+880 1700 000000</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
                      <p>hello@clothingx.com</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Address</p>
                      <p>Gulshan, Dhaka 1212, Bangladesh</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="mt-0.5 h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Hours</p>
                      <p>Sat–Thu · 10am – 8pm</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-5">
                <h3 className="mb-1 font-serif text-base font-semibold text-primary">Agent Inquiries</h3>
                <p className="text-sm text-muted-foreground">
                  Want to become a CLOTHING X agent and earn commission on every sale?
                  Email <strong>agents@clothingx.com</strong> with your details.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </MaxWidthWrapper>
    </StorefrontShell>
  );
}
