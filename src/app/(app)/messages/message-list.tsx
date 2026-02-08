"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { Message } from "@/lib/types";

interface MessageListProps {
  messages: Message[];
  childMap: Record<string, string>;
}

export function MessageList({ messages, childMap }: MessageListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {messages.map((msg) => {
        const isExpanded = expandedId === msg.id;
        return (
          <Card
            key={msg.id}
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => setExpandedId(isExpanded ? null : msg.id)}
          >
            <CardContent className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-sm truncate ${
                        !msg.read ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {msg.title}
                    </span>
                    {!msg.read && (
                      <Badge className="text-[10px] px-1.5 py-0">Neu</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    {msg.sender && <span>{msg.sender}</span>}
                    {msg.sender && <span>·</span>}
                    <span>
                      {new Date(msg.date).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    {Object.keys(childMap).length > 1 && (
                      <>
                        <span>·</span>
                        <span>{childMap[msg.child_id]}</span>
                      </>
                    )}
                  </div>
                  {isExpanded && msg.body && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm whitespace-pre-line">
                      {msg.body}
                    </div>
                  )}
                </div>
                <div className="shrink-0 pt-0.5 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
