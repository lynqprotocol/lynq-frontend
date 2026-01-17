export function Comparison() {
    return (
        <section className="py-24 bg-surface-dark border-y border-glass-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16">
                    <div>
                        <h2 className="text-4xl font-bold mb-6 text-white">
                            The Transparency <br />
                            <span className="text-warning">Dilemma</span>
                        </h2>
                        <p className="text-lg text-gray-400 leading-relaxed mb-8">
                            Decentralization currently demands a total loss of privacy. Your
                            on-chain footprint reveals a complete history of your messages,
                            balances, and social connections to the entire world.
                        </p>
                        <div className="p-4 border border-warning/20 bg-warning/5 rounded-lg">
                            <p className="text-warning font-mono text-sm">
                                &gt; WARNING: Your current wallet metadata is public.
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {/* Exposure Item */}
                        <div className="bg-background-dark p-6 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-colors group">
                            <span className="material-symbols-outlined text-red-500 mb-3 group-hover:scale-110 transition-transform">
                                visibility
                            </span>
                            <h3 className="text-white font-bold mb-1">Messages</h3>
                            <p className="text-xs text-gray-500 font-mono">
                                PLAIN TEXT EXPOSURE
                            </p>
                        </div>
                        <div className="bg-background-dark p-6 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-colors group">
                            <span className="material-symbols-outlined text-red-500 mb-3 group-hover:scale-110 transition-transform">
                                account_balance_wallet
                            </span>
                            <h3 className="text-white font-bold mb-1">Balances</h3>
                            <p className="text-xs text-gray-500 font-mono">PUBLIC LEDGER</p>
                        </div>
                        <div className="bg-background-dark p-6 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-colors group">
                            <span className="material-symbols-outlined text-red-500 mb-3 group-hover:scale-110 transition-transform">
                                share
                            </span>
                            <h3 className="text-white font-bold mb-1">Social Graphs</h3>
                            <p className="text-xs text-gray-500 font-mono">NETWORK MAPPING</p>
                        </div>
                        <div className="bg-background-dark p-6 rounded-lg border border-red-500/20 hover:border-red-500/50 transition-colors group">
                            <span className="material-symbols-outlined text-red-500 mb-3 group-hover:scale-110 transition-transform">
                                candlestick_chart
                            </span>
                            <h3 className="text-white font-bold mb-1">Trading Strategy</h3>
                            <p className="text-xs text-gray-500 font-mono">COPY-TRADABLE</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
