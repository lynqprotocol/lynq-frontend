export function Features() {
    return (
        <section className="py-24 relative overflow-hidden" id="product">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-linear-to-l from-primary/5 to-transparent pointer-events-none"></div>
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h2 className="text-3xl font-bold mb-6 text-white">
                        A Unified Privacy Ecosystem
                    </h2>
                    <p className="text-gray-400 text-lg">
                        Lynq is the privacy superlayer for Solana. Starting as a secure
                        communication protocol with confidential payments, it evolves in
                        phases to support zero-knowledge identity, darkpool trading, and
                        encrypted workspaces.
                    </p>
                </div>
                <div className="mb-10 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                            <span className="text-primary text-4xl">01</span>
                            Deployment 1: The Private Interaction Core
                        </h3>
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Card A: Messenger */}
                    <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-[50px] group-hover:bg-primary/30 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-2xl">
                                        chat
                                    </span>
                                </div>
                                <span className="font-mono text-xs border border-primary/30 px-2 py-1 rounded text-primary">
                                    ALPHA
                                </span>
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-white">
                                Lynq Messenger
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm mt-1">
                                        check_circle
                                    </span>
                                    <span className="text-gray-300 text-sm">
                                        <strong className="text-white">Secure Signaling:</strong>{" "}
                                        Encrypted transport layer for wallet-to-wallet comms.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm mt-1">
                                        check_circle
                                    </span>
                                    <span className="text-gray-300 text-sm">
                                        <strong className="text-white">Metadata Protection:</strong>{" "}
                                        Obfuscated sender/receiver headers.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-sm mt-1">
                                        check_circle
                                    </span>
                                    <span className="text-gray-300 text-sm">
                                        <strong className="text-white">Immutable Signal:</strong>{" "}
                                        Decentralized message storage options.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    {/* Card B: Pay */}
                    <div className="glass-card p-8 rounded-2xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-secondary/20 rounded-full blur-[50px] group-hover:bg-secondary/30 transition-colors"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-8">
                                <div className="size-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                                    <span className="material-symbols-outlined text-2xl">
                                        currency_exchange
                                    </span>
                                </div>
                                <span className="font-mono text-xs border border-secondary/30 px-2 py-1 rounded text-secondary">
                                    ALPHA
                                </span>
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-white">Lynq Pay</h4>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-secondary text-sm mt-1">
                                        check_circle
                                    </span>
                                    <span className="text-gray-300 text-sm">
                                        <strong className="text-white">
                                            Token-2022 Integration:
                                        </strong>{" "}
                                        Native confidential transfers on Solana.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-secondary text-sm mt-1">
                                        check_circle
                                    </span>
                                    <span className="text-gray-300 text-sm">
                                        <strong className="text-white">In-Chat Settlement:</strong>{" "}
                                        Send crypto directly within encrypted chats.
                                    </span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-secondary text-sm mt-1">
                                        check_circle
                                    </span>
                                    <span className="text-gray-300 text-sm">
                                        <strong className="text-white">Trustless Validation:</strong>{" "}
                                        Zero-knowledge proofs for balance sufficiency.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
