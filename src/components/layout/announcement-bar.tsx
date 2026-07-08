"use client";

import { useEffect, useState } from "react";
import { Truck, X } from "lucide-react";
import { MaxWidthWrapper } from "@/components/shared/max-width-wrapper";
import { Button } from "@/components/ui/button";

const DEFAULT_ANNOUNCEMENT = "Free delivery inside Dhaka on orders over 5,000 taka — COD nationwide across 64 districts";

interface CMSAnnouncement {
  announcement: string;
  announcementActive: boolean;
}

/** Top announcement strip — reads from Supabase CMS via API */
export function AnnouncementBar() {
  const [data, setData] = useState<CMSAnnouncement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/cms")
      .then((r) => r.json())
      .then((result) => {
        if (result.data) {
           
          setData({
            announcement: result.data.announcement ?? DEFAULT_ANNOUNCEMENT,
            announcementActive: result.data.announcementActive ?? true,
          });
        } else {
           
          setData({ announcement: DEFAULT_ANNOUNCEMENT, announcementActive: true });
        }
      })
      .catch(() => {
         
        setData({ announcement: DEFAULT_ANNOUNCEMENT, announcementActive: true });
      });
  }, []);

  if (!data || !data.announcementActive || dismissed) return null;

  return (
    <div className="bg-primary/10 py-2">
      <MaxWidthWrapper>
        <div className="flex items-center justify-center gap-2">
          <Truck className="h-3.5 w-3.5 shrink-0 text-primary" />
          <p className="text-center text-xs font-medium tracking-wide text-primary">
            {data.announcement}
          </p>
          <Button
            onClick={() => setDismissed(true)}
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1 h-6 w-6 text-primary/60 hover:text-primary"
            aria-label="Dismiss"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
