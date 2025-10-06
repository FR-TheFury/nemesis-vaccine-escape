import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  player_pseudo: string;
  message: string;
  type: string;
  created_at: string;
}

interface ChatProps {
  sessionCode: string;
  currentPlayerPseudo: string;
}

export const Chat = ({ sessionCode, currentPlayerPseudo }: ChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Charger les messages
  useEffect(() => {
    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_code', sessionCode)
        .order('created_at', { ascending: true })
        .limit(50);

      if (data) {
        setMessages(data as ChatMessage[]);
      }
    };

    loadMessages();
  }, [sessionCode]);

  // Auto-scroll vers le bas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_code: sessionCode,
          player_pseudo: currentPlayerPseudo,
          message: inputMessage,
          type: 'chat',
        });

      if (!error) {
        // Optimiste: afficher immédiatement le message localement
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            player_pseudo: currentPlayerPseudo,
            message: inputMessage,
            type: 'chat',
            created_at: new Date().toISOString(),
          } as any,
        ]);
        setInputMessage('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <div className="fixed right-2 bottom-20 sm:right-4 sm:bottom-24 z-40">
      {!isExpanded ? (
        <Button
          onClick={() => setIsExpanded(true)}
          className="rounded-full h-12 w-12 sm:h-14 sm:w-14"
          size="icon"
        >
          <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      ) : (
        <div className="bg-background/95 backdrop-blur-md border-2 border-primary rounded-lg w-[calc(100vw-1rem)] max-w-[320px] sm:w-80 shadow-lg">
          <div className="flex items-center justify-between p-2 sm:p-3 border-b border-border">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <h3 className="font-bold text-sm sm:text-base">Chat</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsExpanded(false)}
            >
              ✕
            </Button>
          </div>

          <ScrollArea className="h-48 sm:h-64 p-2 sm:p-3" ref={scrollRef}>
            {messages.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                Aucun message
              </p>
            ) : (
              <div className="space-y-1.5 sm:space-y-2">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`text-xs sm:text-sm ${
                      msg.player_pseudo === currentPlayerPseudo
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    <span className="font-semibold text-primary">
                      {msg.player_pseudo}:
                    </span>{' '}
                    <span className="text-foreground break-words">{msg.message}</span>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="p-2 sm:p-3 border-t border-border flex gap-1.5 sm:gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Message..."
              className="flex-1 text-xs sm:text-sm h-8 sm:h-10"
            />
            <Button onClick={sendMessage} size="icon" className="h-8 w-8 sm:h-10 sm:w-10">
              <Send className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
