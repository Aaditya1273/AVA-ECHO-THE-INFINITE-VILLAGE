# Ava-Echo: The Infinite Mystery Engine

An AI-native mystery adventure built on an **Avalanche L1**, leveraging **Avalanche 9000** for sub-second finality and interchain asset mobility.

---

## 1. The Vision

**Ava-Echo** isn't just a game; it is an on-chain content engine. By combining Large Language Models (LLMs) with Avalanche’s high-performance infrastructure, we solve the "retention problem" in Web3. Every session is unique, every clue is verifiable, and every asset is a part of a larger, persistent economy.

Traditional games run out of content. **Ava-Echo never does.**

---

## 2. Key Pillars & Innovation

### AI-Generated "Ground Truth"
Every game session, an LLM (Google Gemini) generates a unique secret—a location, a culprit, and a motive. This "Ground Truth" is hashed and stored on your **Avalanche L1**, making the solution immutable but hidden.

### The "Invisible" Blockchain
Using Account Abstraction, players sign in with social accounts. Gas fees are paid by the game (sponsored transactions), providing a Web2-like experience with Web3 ownership.

### Dynamic Conversations (AI + TTS)
Interact with villagers through voice. Their responses are generated in real-time by the LLM and spoken via Text-to-Speech. You don't just "click" dialogue; you negotiate.

### On-Chain Investigation Assets (Dynamic NFTs)
Items you find (e.g., Shattered Locket, Ancient Key) are Dynamic NFTs on your Avalanche L1. They carry "Investigation Weight"—the more items you have, the more the AI villagers trust you with deeper secrets.

### The Trade Economy
"Greedy" villagers will only reveal clues in exchange for these items. These trades are settled in under 1 second using Avalanche’s sub-second finality, making the economy feel like a real-time marketplace.

---

## 3. Technical Stack: The Avalanche Advantage

To deliver this experience, we leverage the best of **Avalanche 9000**:

*   **Custom L1 (Subnet)**: Ava-Echo runs on its own dedicated L1, ensuring zero congestion and custom gas logic.
*   **Interchain Messaging (Teleporter)**: We enable "Asset Portability." Items found in Ava-Echo can be sent to other Avalanche games or marketplaces via Teleporter.
*   **Move Language**: By using Move on Avalanche (via Movement or custom VM), we offer the highest level of security for in-game assets, preventing common "re-entrancy" hacks.
*   **Backend**: FastAPI (Python) acting as the "Game Master," orchestrating Gemini AI and blockchain events.
*   **Frontend**: Phaser 3 (JavaScript/React) for an immersive 2D experience.

---

## 4. Why This Wins

1.  **Solves Retention**: Infinite replayability keeps users coming back daily, driving constant transaction volume.
2.  **High-Frequency Utility**: Items are constantly being minted, traded, and burned for hints.
3.  **Showcases Speed**: The voice-to-trade-to-clue loop only works if finality is instant.
4.  **Cultural Fit**: It’s "Crypto-Native." It doesn't hide the blockchain; it uses it to make a type of game that was impossible until now.

---

## 5. Development Roadmap

*   **Week 1**: Launch the "Echoes Alpha" on Testnet.
*   **Week 3**: Prototype link to Subnet/L1 Explorer with Move contracts live.
*   **Week 5**: GTM Plan and $ECHO tokenomics.
*   **Week 6**: Finals Demo - Voice + On-Chain Trade loop.

---

## 6. Setup and Installation

### Prerequisites

*   Node.js (v18+)
*   Python (3.10+)
*   Avalanche CLI
*   Movement SDK (for Move contracts)

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/Aaditya1273/AVA-ECHO-THE-INFINITE-VILLAGE.git
    cd AVA-ECHO-THE-INFINITE-VILLAGE
    ```

2.  **Setup Backend**
    ```bash
    cd server_centralized
    pip install -r requirements.txt
    # Configure your .env with GEMINI_API_KEY
    python main.py
    ```

3.  **Setup Frontend**
    ```bash
    cd game_onechain
    npm install
    npm run dev
    ```

4.  **Deploy Smart Contracts**
    ```bash
    cd contracts
    # Use Avalanche CLI to deploy to your Subnet
    avalanche l1 create myechochain
    ```
