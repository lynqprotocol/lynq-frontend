import { useRef, useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { MessageBubble } from "./MessageBubble";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon, MoreVertical, Trash2, ShieldCheck, ArrowLeft, Zap } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaymentModal } from "../PaymentModal";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


interface ChatWindowProps {
    recipient: string | null;
    onSendMessage: (text: string) => Promise<void>;
    onSendPayment?: (signature: string) => Promise<void>;
    myPublicKey?: string | null; // For identifying "me" strictly if needed, though we use role 'me' in DB
    isConnected: boolean;
    onDeleteConversation?: () => void;
    onBack?: () => void;
}

export function ChatWindow({ recipient, onSendMessage, onSendPayment, isConnected, onDeleteConversation, onBack }: ChatWindowProps) {
    const [inputText, setInputText] = useState("");
    const [zkMode, setZkMode] = useState(false); // ZK-Stealth Mode State
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Fetch messages for this recipient
    const messages = useLiveQuery(
        () => recipient
            ? db.messages
                .where('conversationId')
                .equals(recipient)
                .sortBy('timestamp')
            : Promise.resolve([] as import("@/lib/db").Message[]),
        [recipient]
    );

    // Auto-scroll to bottom
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const text = inputText;
        setInputText(""); // Optimistic clear

        await onSendMessage(text);
    };

    const handlePaymentSuccess = async (signature?: string) => {
        if (!recipient) return;
        try {
            // 1. Persist locally (for me)
            await db.messages.add({
                conversationId: recipient,
                sender: 'me',
                content: 'Confidential Transfer Sent',
                timestamp: Date.now(),
                status: 'sent',
                metadata: {
                    type: 'payment',
                    txSignature: signature
                }
            });

            // 2. Send via Socket (for recipient)
            if (signature && onSendPayment) {
                await onSendPayment(signature);
            }

        } catch (error) {
            console.error("Failed to save payment message", error);
        }
    };

    if (!recipient) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-700">
                <div className="relative w-32 h-32 mb-8">
                    <div className="absolute inset-0 border border-brand-cyan/30 rounded-full animate-signal text-brand-cyan"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck className="w-12 h-12 text-brand-cyan/50" />
                    </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">Lynq Messenger</h3>
                <p className="text-gray-400 max-w-sm">
                    Select a conversation or find a user to start chatting securely.
                </p>
            </div>
        );
    }

    return (
        <div className={cn("flex-1 flex flex-col h-full overflow-hidden relative", zkMode ? "shadow-[inset_0_0_100px_rgba(0,240,255,0.05)]" : "")}>
            {/* Header */}
            <div className={cn("h-16 border-b border-glass-border flex items-center px-4 md:px-6 justify-between shrink-0 gap-3 bg-surface-dark/40 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300",
                zkMode ? "border-brand-cyan/20" : "")
            }>
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Back Button (Mobile Only) */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden -ml-2 text-text-metal"
                        onClick={onBack}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <Avatar className={cn("h-9 w-9 border shrink-0 transition-colors", zkMode ? "border-brand-cyan shadow-[0_0_8px_var(--brand-cyan)]" : "border-gray-700")}>
                        <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${recipient}`} />
                        <AvatarFallback className="bg-bg-obsidian text-text-starlight">??</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h3 className={cn("text-white font-medium text-sm truncate font-mono tracking-tight transition-colors", zkMode ? "text-brand-cyan" : "")}>
                            {recipient.slice(0, 6)}...{recipient.slice(-4)}
                        </h3>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1 md:gap-2 shrink-0">

                    {/* ZK-Stealth Mode Toggle */}
                    {/* <div className="flex items-center gap-2 mr-2 md:mr-4 border-r border-[#2A2A35] pr-4">
                        <span className={cn("text-[10px] font-mono uppercase tracking-wider transition-colors hidden md:inline-block", zkMode ? "text-brand-cyan shadow-brand-cyan/50 text-shadow-sm" : "text-text-metal")}>
                            {zkMode ? "ZK-Stealth Active" : "ZK-Stealth Off"}
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setZkMode(!zkMode)}
                            className={cn("h-8 px-2 rounded-full border transition-all duration-300",
                                zkMode
                                    ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan hover:bg-brand-cyan/20 shadow-[0_0_10px_var(--brand-cyan)]"
                                    : "bg-transparent border-gray-700 text-text-metal hover:text-white"
                            )}
                        >
                            <Zap className={cn("h-4 w-4", zkMode ? "fill-brand-cyan" : "")} />
                        </Button>
                    </div> */}


                    {recipient && (
                        <PaymentModal
                            prefilledRecipient={recipient}
                            onSuccess={handlePaymentSuccess}
                            trigger={
                                <Button variant="ghost" size="icon" className="text-text-metal hover:text-brand-cyan hover:bg-gradient-to-br from-brand-ultraviolet to-[#6015AB]" title="Send Private Payment">
                                    <ShieldCheck className="h-5 w-5" />
                                </Button>
                            }
                        />
                    )}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-text-metal hover:text-brand-cyan hover:bg-gradient-to-br from-brand-ultraviolet to-[#6015AB]">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-bg-obsidian border-[#2A2A35] text-text-starlight">
                            <DropdownMenuItem onClick={onDeleteConversation} className="text-status-crimson focus:text-status-crimson focus:bg-status-crimson/10 cursor-pointer">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Chat
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
                <style jsx>{`
                    /* Custom Scrollbar for Chat Window */
                    div::-webkit-scrollbar {
                        width: 6px;
                    }
                    div::-webkit-scrollbar-track {
                        background: transparent;
                    }
                    div::-webkit-scrollbar-thumb {
                        background-color: #2A2A35;
                        border-radius: 20px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                        background-color: #3F3F4E;
                    }
                `}</style>
                <div className="flex flex-col justify-end min-h-full">
                    {messages?.map(msg => (
                        <MessageBubble key={msg.id} message={msg} />
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input */}
            <div className="p-4 shrink-0 pb-6">
                <div className="flex gap-2 items-end max-w-4xl mx-auto glass-card rounded-2xl p-2 pr-2 pl-4 border-glass-border shadow-2xl backdrop-blur-xl">
                    <div className="flex-1 flex items-center transition-colors">
                        <Input
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                            placeholder={isConnected ? "Type a secret message..." : "Connecting secure line..."}
                            disabled={!isConnected}
                            className="border-0 bg-transparent focus:shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-500 py-3 shadow-none h-auto max-h-32 text-base"
                        />
                    </div>
                    <Button
                        onClick={handleSend}
                        className={cn(
                            "rounded-full h-11 w-11 shrink-0 transition-all duration-300 shadow-lg group",
                            zkMode
                                ? "bg-brand-cyan hover:bg-brand-cyan/80 shadow-[0_0_15px_var(--brand-cyan)]"
                                : "bg-brand-ultraviolet hover:bg-brand-ultraviolet/80 shadow-[0_0_15px_var(--brand-ultraviolet)]"
                        )}
                        size="icon"
                        disabled={!inputText.trim() || !isConnected}
                    >
                        <SendIcon className={cn("h-5 w-5 text-white transition-transform group-hover:scale-110", zkMode ? "text-bg-void" : "")} />
                    </Button>
                </div>
            </div>
        </div>
    );
}
