export function FAQ() {
    return (
        <section className="py-24" id="faq">
            <div className="max-w-3xl mx-auto px-6">
                <h2 className="text-3xl font-bold mb-12 text-center text-white">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    <details className="group bg-surface-dark rounded-lg border border-glass-border open:border-primary/50 transition-colors">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-white">
                            <span>Is Lynq built on Solana?</span>
                            <span className="transition group-open:rotate-180">
                                <span className="material-symbols-outlined">expand_more</span>
                            </span>
                        </summary>
                        <div className="text-gray-400 text-sm mt-0 px-6 pb-6 leading-relaxed">
                            Yes. Lynq leverages Solana's high speed and low cost for the
                            transport layer, and utilizes the SPL Token-2022 extension for
                            native confidential transfers.
                        </div>
                    </details>
                    <details className="group bg-surface-dark rounded-lg border border-glass-border open:border-primary/50 transition-colors">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-white">
                            <span>What is private by default?</span>
                            <span className="transition group-open:rotate-180">
                                <span className="material-symbols-outlined">expand_more</span>
                            </span>
                        </summary>
                        <div className="text-gray-400 text-sm mt-0 px-6 pb-6 leading-relaxed">
                            All message content and metadata (sender/receiver) are encrypted
                            end-to-end. Payment amounts can be obfuscated using Confidential
                            Transfers.
                        </div>
                    </details>
                    <details className="group bg-surface-dark rounded-lg border border-glass-border open:border-primary/50 transition-colors">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none p-6 text-white">
                            <span>What features come after Alpha?</span>
                            <span className="transition group-open:rotate-180">
                                <span className="material-symbols-outlined">expand_more</span>
                            </span>
                        </summary>
                        <div className="text-gray-400 text-sm mt-0 px-6 pb-6 leading-relaxed">
                            Following the alpha, we will roll out group chats, mobile apps
                            (iOS/Android), and the Lynq ID reputation system.
                        </div>
                    </details>
                </div>
            </div>
        </section>
    );
}
