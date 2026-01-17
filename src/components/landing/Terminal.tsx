export function TerminalWithSpecs() {
    return (
        <section className="py-24 px-4 bg-bg-obsidian border-y border-[#2A2A35]">
            <div className="max-w-3xl mx-auto">
                <div className="bg-[#0A0A0A] rounded-lg border border-[#333] p-1 shadow-2xl">
                    {/* Terminal Header */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333] bg-[#111] rounded-t-md">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        <div className="ml-auto text-[10px] text-zinc-500 font-mono">zsh — lynq-protocol-v1</div>
                    </div>
                    {/* Terminal Content */}
                    <div className="p-6 font-mono text-sm leading-relaxed">
                        <p className="text-green-500 mb-2">{`> INITIALIZING LYNQ PROTOCOL...`}</p>
                        <div className="space-y-1 pl-4 text-green-400/80">
                            <p>{`> NETWORK: Solana (SPL Token-2022)`}</p>
                            <p>{`> SIGNALLING: E2EE + ZK-Verified On-Chain Signals`}</p>
                            <p>{`> KEY_EXCHANGE: Wallet-Based Secure Exchange`}</p>
                            <p>{`> PAYMENTS: Non-Linkable P2P Transactions`}</p>
                        </div>
                        <p className="text-green-500 mt-2 animate-pulse">{`> _`}</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
