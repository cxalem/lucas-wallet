import { Avatar } from "@/components/ui/avatar";
import type { Message } from "@ai-sdk/react";
import { useEffect, useState } from "react";
import { MentionTooltip } from "@/components/contacts/mention-tooltip";
import { Contact } from "@/types";
import { getContacts } from "@/components/contacts/actions";
import { useUser } from "@/context/user-context";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [parsedContent, setParsedContent] = useState<React.ReactNode[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    const fetchContacts = async () => {
      const contactsData = await getContacts(user);
      setContacts(contactsData);
    };
    
    fetchContacts();
  }, [user]);

  useEffect(() => {
    if (!message.parts || contacts.length === 0) return;

    // Parse message text to find mentions
    message.parts.forEach((part, idx) => {
      if (part.type === "text") {
        const nodes: React.ReactNode[] = [];
        const text = part.text || "";
        
        // Match @username pattern
        const regex = /@([a-zA-Z0-9_]+)/g;
        let lastIndex = 0;
        let match;
        
        while ((match = regex.exec(text)) !== null) {
          const mentionName = match[1];
          const matchedContact = contacts.find(contact => 
            (contact.user_name && contact.user_name.toLowerCase() === mentionName.toLowerCase()) ||
            ((contact.first_name || '') + (contact.last_name || '')).toLowerCase().replace(/\s+/g, '') === mentionName.toLowerCase()
          );
          
          // Add text before the mention
          if (match.index > lastIndex) {
            nodes.push(text.substring(lastIndex, match.index));
          }
          
          // Add the mention with tooltip if contact found
          if (matchedContact) {
            nodes.push(
              <MentionTooltip key={`mention-${idx}-${match.index}`} contact={matchedContact}>
                {match[0]}
              </MentionTooltip>
            );
          } else {
            nodes.push(match[0]);
          }
          
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
          nodes.push(text.substring(lastIndex));
        }
        
        setParsedContent(nodes);
      }
    });
  }, [message.parts, contacts]);

  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`flex gap-3 max-w-[80%] ${
          message.role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <Avatar
          className={`h-8 w-8 flex items-center justify-center text-zinc-100 ${
            message.role === "user" ? "bg-blue-500" : "bg-neutral-700"
          }`}
        >
          {message.role === "user" ? (
            <span className="text-xs font-medium">You</span>
          ) : (
            <span className="text-xs font-medium">AI</span>
          )}
        </Avatar>

        <div
          className={`p-3 rounded-lg ${
            message.role === "user"
              ? "bg-blue-600 text-white rounded-tr-none"
              : "bg-neutral-700 text-zinc-100 rounded-tl-none"
          }`}
        >
          {message.parts?.map((part, i) => {
            switch (part.type) {
              case "text":
                return (
                  <div
                    key={`${message.id}-${i}`}
                    className="whitespace-pre-wrap"
                  >
                    {parsedContent.length > 0 ? parsedContent : part.text}
                  </div>
                );
              default:
                return null;
            }
          })}
          <div className="text-xs opacity-70 mt-1 text-right">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
