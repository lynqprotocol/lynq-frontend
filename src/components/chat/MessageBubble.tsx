import { cn } from "@/lib/utils";
import { Message, db } from "@/lib/db";
import { ShieldCheck, ExternalLink, Link, Lock, MoreHorizontal } from "lucide-react";
import { useState, useEffect } from "react";
import { useMessageCommitment } from "@/hooks/useMessageCommitment";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isMe = message.sender === 'me';
    const isPayment = message.metadata?.type === 'payment';
    const isVerified = !!message.commitmentSignature || !!message.metadata?.isVerified;

    const { commitMessage, verifyMessage, getCommitmentAddress } = useMessageCommitment();
    const [isCommitting, setIsCommitting] = useState(false);
    const pdaAddress = getCommitmentAddress(message);

    useEffect(() => {
        if (!isVerified && !isPayment) {
            verifyMessage(message).then((verified) => {
                if (verified) {
                    db.messages.update(message.id, {
                        metadata: {
                            ...message.metadata,
                            type: message.metadata?.type || 'text',
                            isVerified: true
                        }
                    });
                }
            });
        }
    }, [message.id, isVerified, isPayment, verifyMessage]);

    const handleVerify = async () => {
        try {
            setIsCommitting(true);
            const sig = await commitMessage(message);

            await db.messages.update(message.id, {
                commitmentSignature: sig,
                metadata: {
                    ...message.metadata,
                    type: message.metadata?.type || 'text',
                    isVerified: true,
                    verificationSig: sig
                }
            });
        } catch (e) {
            console.error("Verification failed", e);
        } finally {
            setIsCommitting(false);
        }
    };

    return (
        <div className={cn("flex w-full mb-4 group items-center", isMe ? "justify-end" : "justify-start")}>
            {/* Dropdown Menu for Actions (Outside Left) */}
            {isMe && !isPayment && !isVerified && (
                <div className="opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-full hover:bg-white/10 text-text-metal hover:text-text-starlight transition-colors">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-glass-border text-white">
                            <DropdownMenuItem onClick={handleVerify} disabled={isCommitting} className="focus:bg-white/5 cursor-pointer text-xs">
                                <Lock className="w-3 h-3 mr-2 text-brand-ultraviolet" />
                                {isCommitting ? "Committing..." : "Verify on Chain"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            <div
                className={cn(
                    "max-w-[70%] px-4 py-3 rounded-2xl text-sm shadow-sm relative",
                    isMe
                        ? isPayment
                            ? "bg-status-neon-green/10 border border-status-neon-green/30 text-status-neon-green rounded-br-none"
                            : "bg-gradient-to-br from-brand-ultraviolet to-[#6015AB] text-white rounded-br-none shadow-[0_4px_15px_rgba(138,46,255,0.15)]"
                        : isPayment
                            ? "bg-status-neon-green/10 border border-status-neon-green/30 text-status-neon-green rounded-bl-none backdrop-blur-sm"
                            : "glass-card text-white rounded-bl-none border-glass-border bg-surface-dark/60"
                )}
            >
                {/* Verified Indicator */}
                {isVerified && (
                    <div className={cn('absolute -top-2 z-10', isMe ? '-left-2' : '-right-2')}>
                        {(message.commitmentSignature || pdaAddress) ? (
                            <a
                                href={message.commitmentSignature
                                    ? `https://explorer.solana.com/tx/${message.commitmentSignature}?cluster=devnet`
                                    : `https://explorer.solana.com/address/${pdaAddress}?cluster=devnet`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-brand-cyan hover:bg-brand-cyan/80 hover:shadow-brand-cyan rounded-full p-1 border-2 border-bg-void transition-colors block shadow-[0_0_8px_var(--brand-cyan)]"
                                title="Verified on Chain (Click to View)"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ShieldCheck className="w-3 h-3 text-bg-void" />
                            </a>
                        ) : (
                            <div
                                className="bg-brand-cyan hover:shadow-brand-cyan rounded-full p-1 border-2 border-bg-void shadow-[0_0_8px_var(--brand-cyan)]"
                                title="Verified on Chain"
                            >
                                <ShieldCheck className="w-3 h-3 text-bg-void" />
                            </div>
                        )}
                    </div>
                )}

                {isPayment ? (
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            <span>{message.content}</span>
                        </div>
                        {message.metadata?.txSignature && (
                            <a
                                href={`https://explorer.solana.com/tx/${message.metadata.txSignature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-xs hover:underline mt-1 bg-status-neon-green/10 px-2 py-1 rounded w-fit transition-colors border border-status-neon-green/20"
                            >
                                <span>View Transaction</span>
                                <ExternalLink className="w-3 h-3" />
                            </a>
                        )}
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                )}

                <div className={cn("text-[10px] mt-1 opacity-70 flex items-center gap-1 font-mono", isMe ? "justify-end text-white/70" : "justify-start text-gray-400")}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {isMe && !isPayment && (
                        <span>
                            {message.status === 'sent' && '✓'}
                            {message.status === 'delivered' && '✓✓'}
                            {message.status === 'read' && '👀'}
                            {message.status === 'failed' && '❌'}
                            {message.status === 'sending' && '...'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
