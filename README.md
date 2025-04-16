# Replichat

<video src="./demo/demo.mp4" width="480" />

Replichat is an open source LLM chat application (a ChatGPT clone with plans to support more providers later) built with a local-first approach for blazing-fast, instant UIs without loading states.

> **Live Demo:** [replichat.antoinechalifour.dev](https://replichat.antoinechalifour.dev/)

## Table of Contents

- [Replichat](#replichat)
    - [Overview](#overview)
    - [Key Features](#key-features)
    - [Tech Stack](#tech-stack)
    - [Demo](#demo)
    - [Installation](#installation)
    - [Usage](#usage)
    - [Contributing](#contributing)
    - [License](#license)
    - [Acknowledgments](#acknowledgments)

## Overview

Replichat leverages a modern local-first approach to deliver an ultra-fast and responsive chat experience. By keeping UI interactions local and synchronizing changes in the background, the app eliminates annoying spinners and loading states while still ensuring data consistency across multiple tabs.

## Key Features

- **Instant UI:** Fast, local-first user interface that ensures immediate responsiveness.
- **Resilient Streaming:** Robust content streaming across multiple tabs with resilient synchronization powered by Replicache.
- **Multiple Providers:** Currently supports OpenAI, with plans to integrate more providers in the future.
- **Modern Architecture:** Leverages state-of-the-art tools and frameworks to ensure reliability and scalability.

## Tech Stack

- **Tanstack Start:** Used for the web framework, authentication, and server functions.
- **Replicache:** Implements the local-first sync engine.
- **Redis Streams:** Provides resilient streaming to keep multiple tabs synchronized.
- **Postgres:** Serves as the primary database for structured data.
- **OpenAI (via ai SDK):** Used to power the chat responses.
- **Coolify:** Deployed with Coolify for a simple and robust hosting solution.

## Demo

Check out the live demo: [replichat.antoinechalifour.dev](https://replichat.antoinechalifour.dev/)

You can also watch a video demo of the project on Twitter (note that GitHub does not support embedding tweets directly):

View the demo on Twitter: [Tweet by Antoine_Chlfr](https://x.com/Antoine_Chlfr/status/1912469920421388680)

## Installation

To run Replichat locally, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/antoinechalifour/replichat
   cd replichat
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Create and configure your environment variables:**

   Create a `.env` file in the root directory and add the necessary configurations (e.g., database URL, OpenAI API keys, etc.). See the provided `.env.example` for guidance.

4. **Run the development server:**
   ```bash
   pnpm dev
   ```

5. **Open in your browser:**

   Navigate to `http://localhost:3000` (or the configured port) to see Replichat in action.

## Usage

Replichat is designed to be user-friendly. Once running, simply interact with the chat interface, and reap the benefits of its local-first, lightning-fast experience. All UI operations are handled instantly, while the synchronization happens in the background.

## Contributing

Contributions are very welcome! If you'd like to contribute:

1. Fork the repository.
2. Create a new branch for your feature or bugfix.
3. Commit your changes.
4. Open a pull request with a description of your changes.

Please make sure to follow the project's coding conventions and include tests where appropriate.

## License

Distributed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments

- Thanks to the developers of [Tanstack Start](https://tanstack.com/start), [Replicache](https://replicache.dev/), and other open source projects that made Replichat possible.
- Hat tip to the community for continuous inspiration and support.

---

Happy chatting! 🫶

---

Feel free to customize this README further to suit your project's needs. Enjoy developing Replichat!