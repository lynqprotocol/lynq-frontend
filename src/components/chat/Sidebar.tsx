import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Settings, Copy, Check, MessageSquarePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { serializePublicBundle, PreKeyBundlePublic } from "@/lib/crypto/KeyBundle";
import { Input } from "@/components/ui/input";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Label } from "@/components/ui/label";
import Link from "next/link";

interface SidebarProps {
    currentRecipient: string | null;
    onSelectRecipient: (address: string) => void;
    myBundlePublic: PreKeyBundlePublic | null;
}

export function Sidebar({ currentRecipient, onSelectRecipient, myBundlePublic }: SidebarProps) {
    const { publicKey } = useWallet();
    const [copied, setCopied] = useState(false);
    const [addressCopied, setAddressCopied] = useState(false);

    // Live Query to automatically update when new messages arrive
    const conversations = useLiveQuery(
        () => db.conversations.orderBy('lastMessageTimestamp').reverse().toArray()
    );

    const handleCopyBundle = () => {
        if (!myBundlePublic) return;
        const json = JSON.stringify(serializePublicBundle(myBundlePublic));
        navigator.clipboard.writeText(json);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full md:w-80 h-full bg-transparent flex flex-col">
            <div className="p-5 border-b border-glass-border flex justify-between items-center bg-transparent backdrop-blur-sm sticky top-0 z-10">
                <Link href="/" className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                        <BrandLogo iconSize={24} textSize={{ width: 50, height: 20 }} />
                        <span className="text-xs font-medium text-white/80 tracking-wide">Messenger</span>
                        <span className="text-[8px] bg-brand-cyan/10 text-brand-cyan px-1.5 py-0.5 rounded w-fit font-mono border border-brand-cyan/20 ml-1">
                            ALPHA
                        </span>
                    </div>
                </Link>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-text-metal hover:text-brand-cyan hover:bg-gradient-to-br from-brand-ultraviolet to-[#6015AB]">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-lg glass-card border-glass-border text-white">
                        <DialogHeader>
                            <DialogTitle>My Identity</DialogTitle>
                            <DialogDescription className="text-text-metal">Share your Public Bundle so others can message you.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Wallet Address Section */}
                            <div className="grid gap-2">
                                <Label className="text-text-starlight">Your Wallet Address</Label>
                                <div className="relative">
                                    <Input
                                        readOnly
                                        value={publicKey ? publicKey.toBase58() : "Not Connected"}
                                        className="bg-black/20 border-glass-border text-white pr-10 font-mono text-xs"
                                    />
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="absolute right-0 top-0 h-10 w-10 text-text-metal hover:text-brand-cyan hover:bg-gradient-to-br from-brand-ultraviolet to-[#6015AB]"
                                        onClick={() => {
                                            if (publicKey) {
                                                navigator.clipboard.writeText(publicKey.toBase58());
                                                setAddressCopied(true);
                                                setTimeout(() => setAddressCopied(false), 2000);
                                            }
                                        }}
                                    >
                                        {addressCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            {/* Public Bundle Section */}
                            <div className="grid gap-2">
                                <Label className="text-text-starlight">Public Bundle JSON</Label>
                                <div className="relative">
                                    <div className="w-full rounded-md border border-glass-border bg-black/20 px-3 py-2 text-[10px] text-gray-300 font-mono h-32 overflow-y-auto break-all">
                                        {myBundlePublic ? JSON.stringify(serializePublicBundle(myBundlePublic)) : "Loading Identity..."}
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="link"
                                        className="absolute top-2 right-2 h-6 px-2 text-[10px] text-gray-400 bg-surface-dark/50 border border-glass-border hover:text-brand-cyan hover:bg-linear-to-br from-brand-ultraviolet to-[#6015AB]"
                                        onClick={handleCopyBundle}
                                    >
                                        {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                                        {copied ? "Copied" : "Copy"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <ScrollArea className="flex-1">
                <div className="flex flex-col p-2 gap-1">
                    {!conversations || conversations.length === 0 && (
                        <div className="text-text-metal/50 text-center text-sm py-10 flex flex-col items-center gap-2">
                            <MessageSquarePlus className="w-8 h-8 opacity-20" />
                            <span>No chats yet</span>
                        </div>
                    )}

                    {conversations?.map((conv) => (
                        <button
                            key={conv.walletAddress}
                            onClick={() => onSelectRecipient(conv.walletAddress)}
                            className={cn(
                                "relative flex items-center gap-3 p-3 rounded-lg w-full transition-all text-left group overflow-hidden",
                                currentRecipient === conv.walletAddress
                                    ? "bg-linear-to-r from-brand-ultraviolet/20 to-transparent border-l-2 border-brand-ultraviolet"
                                    : "hover:bg-white/5 border-l-2 border-transparent"
                            )}
                        >
                            {/* Active Indicator Strip */}
                            {currentRecipient === conv.walletAddress && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-full w-full bg-brand-ultraviolet/5 -z-10" />
                            )}

                            <Avatar className="h-10 w-10 border border-white/10 shrink-0 ml-1">
                                <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${conv.walletAddress}`} />
                                <AvatarFallback className="bg-surface-dark text-gray-400 text-xs">{conv.walletAddress.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <span className={cn(
                                        "font-medium text-sm truncate pr-2 font-mono",
                                        currentRecipient === conv.walletAddress ? "text-brand-ultraviolet" : "text-text-starlight"
                                    )}>
                                        {conv.name || conv.walletAddress.slice(0, 4) + '...' + conv.walletAddress.slice(-4)}
                                    </span>
                                    <span className="text-[10px] text-text-metal">
                                        {new Date(conv.lastMessageTimestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className={cn(
                                    "text-xs truncate",
                                    conv.unreadCount > 0 ? "text-text-starlight font-medium" : "text-text-metal/70",
                                    "group-hover:text-text-starlight transition-colors"
                                )}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                            {conv.unreadCount > 0 && (
                                <div className="min-w-[18px] h-[18px] px-1 rounded-full bg-brand-cyan text-[10px] flex items-center justify-center text-bg-void font-bold shadow-[0_0_8px_var(--brand-cyan)]">
                                    {conv.unreadCount}
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
