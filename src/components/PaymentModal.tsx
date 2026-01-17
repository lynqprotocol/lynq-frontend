"use client";

import { useState, ReactNode } from "react";
import {
    Button
} from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface PaymentModalProps {
    prefilledRecipient?: string;
    trigger?: ReactNode;
    onSuccess?: (signature?: string) => void;
}

export function PaymentModal({ trigger }: PaymentModalProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (
                    <Button variant="secondary" className="bg-purple-600 hover:bg-purple-700 text-white">
                        Secret Transfer
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md glass-card border-glass-border">
                <DialogHeader className="flex flex-col items-center justify-center py-6 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-brand-ultraviolet/10 flex items-center justify-center border border-brand-ultraviolet/20">
                            <span className="text-2xl">💸</span>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-brand-ultraviolet to-[#9D4EDD]">
                            Lynq Pay
                        </DialogTitle>
                        <p className="text-text-metal text-sm max-w-[280px] mx-auto leading-relaxed">
                            Confidential payments with zero-knowledge proofs are coming soon.
                        </p>
                    </div>

                    <div className="mt-2">
                        <span className="text-xs bg-brand-cyan/10 text-brand-cyan px-3 py-1 rounded-full font-mono border border-brand-cyan/20">
                            COMING SOON
                        </span>
                    </div>
                </DialogHeader>

                <div className="flex justify-center pb-4">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="text-text-metal hover:text-white"
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
