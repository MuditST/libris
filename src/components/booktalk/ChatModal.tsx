"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { X, BookIcon, Send, Loader2, Trash2 } from "lucide-react";
import { BookItem } from "@/lib/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatModalProps {
  book: BookItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatModal({ book, isOpen, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      const storedChat = localStorage.getItem(`booktalk-chat-${book.id}`);
      if (storedChat) {
        setMessages(JSON.parse(storedChat) as Message[]);
      } else {
        const bookTitle = book.volumeInfo.title;
        const bookAuthor = book.volumeInfo.authors?.[0] || "Unknown";

        setMessages([
          {
            role: "assistant",
            content: `Hi there! I'm your AI book companion for "${bookTitle}" by ${bookAuthor}. What would you like to know about this book?`,
          },
        ]);
      }

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, book.id, book.volumeInfo.title, book.volumeInfo.authors]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

    if (messages.length > 0) {
      localStorage.setItem(
        `booktalk-chat-${book.id}`,
        JSON.stringify(messages)
      );
    }
  }, [messages, book.id]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("/api/booktalk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          book: {
            id: book.id,
            title: book.volumeInfo.title,
            authors: book.volumeInfo.authors || [],
            description: book.volumeInfo.description || "",
            categories: book.volumeInfo.categories || [],
            publishedDate: book.volumeInfo.publishedDate,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      setMessages([
        ...updatedMessages,
        { role: "assistant", content: data.response },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get a response. Please try again.");

      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "I'm sorry, I encountered an error. Please try asking again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    if (window.confirm("Are you sure you want to clear this chat history?")) {
      localStorage.removeItem(`booktalk-chat-${book.id}`);
      setMessages([
        {
          role: "assistant",
          content: `Hi there! I'm your AI book companion for "${
            book.volumeInfo.title
          }" by ${
            book.volumeInfo.authors?.[0] || "Unknown"
          }. What would you like to know about this book?`,
        },
      ]);
      toast.success("Chat history cleared.");
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    if (!isLoading) {
      setInput(prompt);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col z-50 p-4 sm:p-8 md:p-12"
    >
      <div className="relative flex flex-col w-full max-w-6xl h-full mx-auto bg-card border rounded-lg shadow-xl overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-[1.125rem] right-4 z-10 text-muted-foreground hover:bg-accent h-8 w-8"
          aria-label="Close"
        >
          <X size={18} />
        </Button>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-0 h-full overflow-hidden">
          <div className="hidden md:flex flex-col  items-center border-r p-6 md:p-8 lg:p-10 bg-muted/30 overflow-y-auto">
            <div className="w-full flex-shrink-0 flex items-center justify-center my-4">
              <div className="relative aspect-[2/3] w-full max-w-[150px] lg:max-w-[180px] rounded overflow-hidden shadow-md bg-muted">
                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <Image
                    src={book.volumeInfo.imageLinks.thumbnail.replace(
                      "http:",
                      "https:"
                    )}
                    alt={book.volumeInfo.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 150px, 180px"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookIcon size={60} className="text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </div>
            <div className="text-center mt-6 mb-6 w-full max-w-xs">
              <h2 className="text-lg font-semibold font-sans text-foreground">
                {book.volumeInfo.title}
              </h2>
              {book.volumeInfo.authors && (
                <p className="text-muted-foreground text-sm mt-1 font-mono">
                  {book.volumeInfo.authors.join(", ")}
                </p>
              )}
            </div>
            {book.volumeInfo.description && (
              <p className="text-xs font-mono text-muted-foreground line-clamp-4 mt-4 border-t pt-4 w-full max-w-xs">
                {book.volumeInfo.description}
              </p>
            )}
          </div>

          <div className="flex flex-col h-full col-span-1 md:col-span-2 p-4 md:p-6 overflow-hidden">
            <div className="pb-3 mb-4 flex justify-between items-center flex-shrink-0 pr-14 md:pr-16">
              <div>
                <p className="text-sm font-sans text-muted-foreground">
                  Ask AI about "{book.volumeInfo.title}"
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearChat}
                className="text-xs text-muted-foreground hover:text-destructive h-8 flex items-center"
              >
                <Trash2 size={14} className="mr-1" /> Clear Chat
              </Button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
              {["Summarize", "Characters", "Themes", "Worth Reading?"].map(
                (prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleQuickPrompt(
                        prompt === "Summarize"
                          ? "Can you summarize this book for me?"
                          : prompt === "Characters"
                          ? "Who are the main characters in this book?"
                          : prompt === "Themes"
                          ? "What are the main themes in this book?"
                          : "Is this book worth reading?"
                      )
                    }
                    disabled={isLoading}
                    className="text-xs font-sans h-8"
                  >
                    {prompt}
                  </Button>
                )
              )}
            </div>

            <ScrollArea className="flex-grow mb-4 pr-3 -mr-3">
              <div className="space-y-4">
                {messages.map((message, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex",
                      message.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-lg px-3 py-2 text-sm font-sans",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      )}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 text-sm font-sans text-muted-foreground animate-pulse">
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="mt-auto flex-shrink-0 pt-4 border-t">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question... (Ctrl+Enter to send)"
                  className="flex-grow resize-none min-h-[40px] max-h-[150px] text-sm font-sans bg-background"
                  disabled={isLoading}
                  rows={1}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() || isLoading}
                  className="h-10 w-10 flex-shrink-0"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
