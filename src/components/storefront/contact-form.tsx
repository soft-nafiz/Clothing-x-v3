"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  function submit() {
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message");
      return;
    }
    toast.success("Message sent", {
      description: "We'll get back to you within 24 hours.",
    });
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="c-name" className="mb-1.5 block text-xs uppercase tracking-wider">Name</Label>
          <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="c-email" className="mb-1.5 block text-xs uppercase tracking-wider">Email</Label>
          <Input id="c-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <Label htmlFor="c-subject" className="mb-1.5 block text-xs uppercase tracking-wider">Subject</Label>
        <Input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="How can we help?" />
      </div>
      <div>
        <Label htmlFor="c-msg" className="mb-1.5 block text-xs uppercase tracking-wider">Message</Label>
        <Textarea id="c-msg" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
      </div>
      <Button onClick={submit} size="lg" className="gap-2 uppercase tracking-wider">
        <Send className="h-4 w-4" /> Send Message
      </Button>
    </div>
  );
}
