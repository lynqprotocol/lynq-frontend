import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function EncryptionModal() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Confirm Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Encryption</DialogTitle>
                    <DialogDescription>
                        Enter your transaction details to proceed safely.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            defaultValue="0.00 SOL"
                            className="col-span-3 text-right font-mono"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="recipient" className="text-right">
                            Key
                        </Label>
                        <Input
                            id="recipient"
                            defaultValue="0x3f...8a"
                            className="col-span-3 text-right font-mono text-text-metal"
                            readOnly
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="secondary" className="border-text-metal text-text-starlight hover:border-brand-cyan hover:text-brand-cyan">Cancel</Button>
                    <Button className="bg-brand-cyan text-bg-void hover:bg-brand-cyan/80">Confirm Transaction</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
