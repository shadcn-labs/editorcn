import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";

export const Announcement = () => (
  <Badge asChild variant="secondary" className="bg-transparent">
    <Link
      href="https://ui.shadcn.com"
      target="_blank"
      rel="noreferrer"
      prefetch={false}
    >
      <span className="flex size-2 rounded-full bg-blue-500" title="New" />
      Built with shadcn registry <ArrowRightIcon />
    </Link>
  </Badge>
);
