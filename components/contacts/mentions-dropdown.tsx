import Image from "next/image";
import { Contact } from "@/types";

interface MentionsDropdownProps {
  contacts: Contact[];
  searchTerm: string;
  onSelect: (contact: Contact) => void;
  isOpen: boolean;
  caretAtMention: boolean;
}

export function MentionsDropdown({
  contacts,
  searchTerm,
  onSelect,
  isOpen,
  caretAtMention,
}: MentionsDropdownProps) {
  if (!isOpen) return null;

  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.first_name || ''} ${contact.last_name || ''}`.toLowerCase();
    const username = (contact.user_name || '').toLowerCase();
    const filter = searchTerm.toLowerCase();
    
    return fullName.includes(filter) || username.includes(filter);
  });

  // Show "No users found" only when specific conditions are met
  const showNoUsersFound = 
    caretAtMention && 
    searchTerm.length > 0 && 
    filteredContacts.length === 0;

  if (filteredContacts.length === 0) {
    // Only show the "No users found" message when all conditions are met
    if (showNoUsersFound) {
      return (
        <div className="absolute bottom-full mb-2 w-full bg-neutral-800 rounded-lg border border-neutral-700 shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 text-neutral-400 text-sm">No users found</div>
        </div>
      );
    }
    // Otherwise don't show anything
    return null;
  }

  const getAvatarLetters = (contact: Contact) => {
    // Try to get initials from username first
    if (contact.user_name) {
      return contact.user_name.substring(0, 2).toUpperCase();
    }
    // If no username, try first letter of first and last name
    else if (contact.first_name || contact.last_name) {
      const firstInitial = contact.first_name ? contact.first_name[0] : '';
      const lastInitial = contact.last_name ? contact.last_name[0] : '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    // If no name information at all, use email
    else if (contact.email) {
      return contact.email.substring(0, 2).toUpperCase();
    }
    // Fallback to default
    return 'U';
  };

  return (
    <div className="absolute bottom-full mb-2 w-full bg-neutral-800 rounded-lg border border-neutral-700 shadow-lg max-h-60 overflow-y-auto z-10">
      <ul className="py-1">
        {filteredContacts.map((contact) => (
          <li 
            key={contact.id}
            onClick={() => onSelect(contact)}
            className="px-3 py-2 hover:bg-neutral-700 cursor-pointer flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full bg-neutral-600 flex-shrink-0 overflow-hidden">
              {contact.avatarUrl ? (
                <Image 
                  src={contact.avatarUrl} 
                  alt={`${contact.first_name || ''} ${contact.last_name || ''}`}
                  width={32}
                  height={32}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-300 font-medium text-xs">
                  {getAvatarLetters(contact)}
                </div>
              )}
            </div>
            <div>
              <div className="font-medium text-neutral-200">{contact.first_name || ''} {contact.last_name || ''}</div>
              {(contact.user_name || contact.email) && (
                <div className="text-xs text-neutral-400">
                  {contact.user_name || contact.email}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
} 