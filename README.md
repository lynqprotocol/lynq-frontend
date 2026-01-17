# Lynq | The Private Communication Layer

![Lynq Banner](./public/logo_text.png)

Lynq is a decentalized, private communication layer built on **Solana**. It enables wallet-to-wallet encrypted messaging and confidential payments using Zero-Knowledge Proofs, providing a seamless and secure experience for Web3 users.

> **Status:** Alpha

## 🌟 Key Features

*   **🔒 End-to-End Encryption:** All messages are encrypted using the Signal Protocol (X3DH + Double Ratchet), ensuring only the intended recipient can read them. Relayers cannot access message content.
*   **💸 Confidential Payments:** Leveraging Solana's SPL Token-2022 Transfer Hook and Confidential Transfer extensions to enable private value transfer. (Coming Soon)
*   **🆔 Wallet Identity:** Log in securely with your Solana wallet. No emails, no passwords.
*   **⚡ Real-Time Messaging:** Powered by a high-performance WebSocket architecture.
*   **🎨 Premium UI:** A modern, glassmorphism-inspired interface built with Tailwind CSS.

## 🛠 Tech Stack

*   **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS + CSS Variables (`globals.css`)
*   **State & Key Management:** RxJS / React Hooks
*   **Local Persistence:** Dexie.js (IndexedDB wrapper)
*   **Blockchain Interaction:** `@solana/web3.js`, `@solana/wallet-adapter`
*   **Cryptography:** `@noble/curves` (Ed25519, X25519), `@noble/hashes` (SHA-512)

## 🗺 Roadmap

*   **Phase 1: Interaction Core (Current)**
    *   Lynq Messenger Alpha Launch
    *   Wallet-to-Wallet Encryption
    *   Confidential Transfer Beta

*   **Phase 2: Group & Social**
    *   Encrypted Group Chats
    *   Community Channels
    *   DAO Governance Voting Modules

*   **Phase 3: Identity & Access**
    *   Lynq ID Integration (ZK Proof of Humanity)
    *   Reputation Systems

*   **Phase 4: The Enterprise Layer**
    *   Encrypted Workspaces
    *   Compliant Darkpool Trading
    *   Institutional APIs

## 🤝 Contributing

We welcome contributions! Please feel free to check the issues page or submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
