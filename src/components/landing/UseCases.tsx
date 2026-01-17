export function UseCases() {
    return (
        <section className="py-24 bg-surface-dark border-y border-glass-border">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Use Cases */}
                    <div>
                        <h2 className="text-2xl font-bold mb-8 text-white">Who it's for</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 rounded bg-background-dark border border-white/5">
                                <h4 className="font-bold text-white mb-1">Everyday Users</h4>
                                <p className="text-xs text-gray-400">
                                    Private DM's and payments without tracking.
                                </p>
                            </div>
                            <div className="p-4 rounded bg-background-dark border border-white/5">
                                <h4 className="font-bold text-white mb-1">Creators</h4>
                                <p className="text-xs text-gray-400">
                                    Exclusive, encrypted content channels.
                                </p>
                            </div>
                            <div className="p-4 rounded bg-background-dark border border-white/5">
                                <h4 className="font-bold text-white mb-1">Teams &amp; DAOs</h4>
                                <p className="text-xs text-gray-400">
                                    Secure internal comms &amp; voting.
                                </p>
                            </div>
                            <div className="p-4 rounded bg-background-dark border border-white/5">
                                <h4 className="font-bold text-white mb-1">Traders</h4>
                                <p className="text-xs text-gray-400">
                                    OTC negotiations and copy-trade protection.
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Monetization */}
                    <div>
                        <h2 className="text-2xl font-bold mb-8 text-white">
                            Sustainable Protocol Economics
                        </h2>
                        <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary h-full">
                            <div className="mb-6">
                                <h4 className="text-lg font-bold text-white mb-2">
                                    Launch Phase
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Minimal fees on confidential settlements to deter spam and
                                    fund relayers.
                                </p>
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-white mb-2">
                                    Expansion Phase
                                </h4>
                                <p className="text-sm text-gray-400">
                                    Premium features (Premium stickers, large file storage, vanity
                                    Lynq IDs) burn token supply. Protocol revenue sharing for
                                    stakers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
