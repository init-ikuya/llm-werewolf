# LLM Werewolf Game 🐺

[![Vue 3](https://img.shields.io/badge/Vue-3.5.13-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0.3-FFD859?style=flat&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![Vue Router](https://img.shields.io/badge/Vue%20Router-4.5.1-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://router.vuejs.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-4.28.0-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.4-6E9F18?style=flat&logo=vitest&logoColor=white)](https://vitest.dev/)
[![ESLint](https://img.shields.io/badge/ESLint-8.57.0-4B32C3?style=flat&logo=eslint&logoColor=white)](https://eslint.org/)

A web-based werewolf game where you can play against AI opponents powered by OpenAI's language models. Built with Vue 3, Pinia for state management, Vue Router for navigation, and Vitest for testing.

## 🎮 Features

- **AI-Powered Gameplay**: Play werewolf with intelligent AI opponents using OpenAI's API
- **Modern Vue 3 Stack**: Built with Composition API, TypeScript, and Vite
- **State Management**: Pinia for reactive and type-safe state management
- **Routing**: Vue Router for seamless navigation between game screens
- **Testing**: Comprehensive test suite with Vitest
- **Production Ready**: Optimized build system with TypeScript and Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/llm-werewolf.git
cd llm-werewolf
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

**Note**: You'll need to enter your OpenAI API key when you first access the app. The API key is stored locally in your browser and is never sent to any external servers except OpenAI for AI functionality.

## 🎯 How to Play

1. **Enter API Key**: Input your OpenAI API key to enable AI opponents
2. **Game Setup**: The game initializes with 6 players (1 human + 5 AI players)
3. **Role Assignment**: Roles are secretly assigned (Villagers, Werewolves, Seer, Knight, Medium)
4. **Day Phase**: Discuss and vote to eliminate suspected werewolves
5. **Night Phase**: Werewolves attack, special roles use their abilities
6. **Win Conditions**:
   - **Village Team**: Eliminate all werewolves
   - **Werewolf Team**: Eliminate all villagers or equal their numbers

### 🤖 AI Features

- **Strategic Gameplay**: AI players make intelligent decisions based on game context
- **Natural Communication**: AI players engage in realistic discussions
- **Role Playing**: AI werewolves can lie and deceive, while village team members can reveal roles strategically
- **Consistent Behavior**: AI maintains character consistency throughout the game

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests with Vitest
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/     # Vue components
├── stores/         # Pinia stores
├── router/         # Vue Router configuration
├── views/          # Page components
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── tests/          # Test files
```

## 🧪 Testing

The project uses Vitest for unit testing. Run tests with:

```bash
npm run test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Vue.js team for the amazing framework
- The werewolf game community for inspiration

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

## 🔑 OpenAI API Key

This application requires an OpenAI API key to function:

- **User Input**: Enter your API key directly in the app interface
- **Local Storage**: API key is stored securely in your browser's local storage
- **Privacy**: The key is never sent to external servers except OpenAI for AI functionality
- **Security**: API key never appears in repository code or server logs

To get an OpenAI API key:

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy and paste it into the app when prompted

---

**Important**: Keep your API key secure and never share it publicly. Monitor your OpenAI usage to manage costs.
