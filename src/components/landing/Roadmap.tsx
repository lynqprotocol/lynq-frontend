export function Roadmap() {
    return (
        <section className="py-24 relative" id="roadmap">
            {/* Decoration */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/10 rounded-full blur-[80px]"></div>
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-16 text-center text-white">
                    Four Phases of <span className="text-gradient">Privacy</span>
                </h2>
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-primary via-secondary to-accent opacity-30"></div>
                    <div className="space-y-12">
                        {/* Phase 1 */}
                        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                                    Phase 1: Interaction Core
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Launch of Lynq Messenger Alpha and Lynq Pay Alpha. Basic
                                    wallet-to-wallet encryption and confidential transfer mainnet
                                    beta.
                                </p>
                                <span className="inline-block mt-3 px-2 py-1 text-[10px] font-bold bg-primary/20 text-primary rounded font-mono">
                                    CURRENT
                                </span>
                            </div>
                            <div className="z-10 bg-background-dark p-2 border-2 border-primary rounded-full order-1 md:order-2">
                                <span className="material-symbols-outlined text-primary">
                                    rocket_launch
                                </span>
                            </div>
                            <div className="md:w-1/2 md:pl-12 order-3"></div>
                        </div>
                        {/* Phase 2 */}
                        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1"></div>
                            <div className="z-10 bg-background-dark p-2 border-2 border-gray-700 rounded-full group-hover:border-secondary transition-colors order-1 md:order-2">
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-secondary">
                                    group
                                </span>
                            </div>
                            <div className="md:w-1/2 md:pl-12 order-3">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-secondary transition-colors">
                                    Phase 2: Group &amp; Social
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Encrypted group chats, community channels, and private DAO
                                    governance voting modules.
                                </p>
                            </div>
                        </div>
                        {/* Phase 3 */}
                        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-accent transition-colors">
                                    Phase 3: Identity &amp; Access
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Lynq ID integration for zero-knowledge proofs of humanity and
                                    reputation without doxxing.
                                </p>
                            </div>
                            <div className="z-10 bg-background-dark p-2 border-2 border-gray-700 rounded-full group-hover:border-accent transition-colors order-1 md:order-2">
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-accent">
                                    badge
                                </span>
                            </div>
                            <div className="md:w-1/2 md:pl-12 order-3"></div>
                        </div>
                        {/* Phase 4 */}
                        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start group">
                            <div className="md:w-1/2 md:text-right md:pr-12 order-2 md:order-1"></div>
                            <div className="z-10 bg-background-dark p-2 border-2 border-gray-700 rounded-full group-hover:border-warning transition-colors order-1 md:order-2">
                                <span className="material-symbols-outlined text-gray-500 group-hover:text-warning">
                                    domain
                                </span>
                            </div>
                            <div className="md:w-1/2 md:pl-12 order-3">
                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-warning transition-colors">
                                    Phase 4: The Enterprise Layer
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    Encrypted workspaces, compliant darkpool trading integrations,
                                    and institutional APIs.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
