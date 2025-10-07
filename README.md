# IgNited Reaper 🏴‍☠️

A cemetery-themed social media aggregator with immersive 3D environments and atmospheric interactions. Explore social profiles as interactive gravestones in a hauntingly beautiful digital realm.

![IgNited Reaper Preview](https://images.unsplash.com/photo-1509909756405-be0199881695?w=800&h=400&fit=crop)

## ✨ Features

### 🌙 **Atmospheric 3D Cemetery**

- Interactive gravestones representing social media profiles
- Day/night mode with dynamic lighting and weather effects
- Floating fireflies, fog effects, and atmospheric particles
- Smooth camera controls and responsive 3D environment

### 👻 **Interactive Profile Discovery**

- Hover effects that make gravestones glow and rise
- Detailed profile panels with glassmorphism design
- Social media integration for Twitter, Instagram, TikTok, YouTube, and more
- Real-time search and platform filtering
- Built-in moderation dashboard for reviewing community submissions

### 📱 **Mobile-First Design**

- Responsive 2D card grid for mobile devices
- Touch-optimized interactions
- Consistent dark theme across all devices
- Seamless transition between desktop 3D and mobile 2D modes

### 🎨 **Modern Tech Stack**

- **Next.js 14** with App Router and TypeScript
- **React Three Fiber** for 3D rendering and animations
- **Tailwind CSS** for responsive styling
- **Zustand** for state management
- **Framer Motion** for smooth animations
- **Zod** for type-safe data validation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm, npm, or yarn package manager

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/ignited-reaper.git
   cd ignited-reaper/ignited-reaper-app
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Run the development server:**

   ```bash
   pnpm dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3034](http://localhost:3034)

5. **Moderate submissions:**
   Visit [http://localhost:3034/moderation](http://localhost:3034/moderation) to approve pending memorials

### Build for Production

```bash
pnpm build
pnpm start
```

### Static Export for Static Hosting

```bash
pnpm build
# Static files will be in the 'out' directory
```

## 🏗️ Project Structure

```
ignited-reaper/
├── ignited-reaper-app/          # Main Next.js application
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   ├── components/          # React components
│   │   │   ├── 3d/             # Three.js 3D components
│   │   │   └── ui/             # UI components
│   │   ├── lib/                # Utilities and types
│   │   └── store/              # Zustand state management
│   ├── public/                 # Static assets
│   └── data/                   # Database and seed data
├── hardy digital labs/         # Static HTML site
├── ignited-reaper/            # Legacy static version
├── logo/                      # Logo assets
└── inspiration/               # Design inspiration
```

## 🎨 Design System

### Color Palette

- **Cemetery Grays:** `#0f172a` to `#f8fafc` - Stone and fog tones
- **Ember Orange:** `#f97316` to `#431407` - Warm accent colors
- **Moonlight Blue:** `#0ea5e9` to `#082f49` - Cool atmospheric tones

### Typography

- **Headers:** Creepster (Gothic accent font)
- **Body:** Inter (Clean, modern readability)
- **UI:** Tailwind's default font stack

## 🚀 Deployment

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Static Hosting (IONOS, Netlify, etc.)

1. Build the static export: `pnpm build`
2. Upload the `out/` directory contents to your hosting provider
3. Ensure `index.html` is in the root directory

### Other Platforms

- Netlify
- Railway
- Digital Ocean
- AWS Amplify
- Any Node.js hosting provider

## 📦 Key Dependencies

```json
{
  "@react-three/fiber": "^8.15.11", // 3D rendering
  "@react-three/drei": "^9.88.13", // 3D helpers and controls
  "zustand": "^4.4.7", // State management
  "framer-motion": "^10.16.16", // Animations
  "zod": "^3.22.4", // Type validation
  "three": "^0.158.0", // 3D graphics library
  "tailwindcss": "^3.3.0" // Utility-first CSS
}
```

## 🎮 How to Use

### Desktop Experience

1. **Navigate the Cemetery:** Use mouse to orbit, zoom, and explore the 3D environment
2. **Interact with Gravestones:** Hover over gravestones to see them glow and rise
3. **View Profiles:** Click on gravestones to open detailed profile panels
4. **Toggle Day/Night:** Use the sun/moon button to switch between atmospheres
5. **Search & Filter:** Use the search bar and platform filters to find specific profiles

### Mobile Experience

1. **Browse Cards:** Scroll through the responsive card grid
2. **View Details:** Tap "View Details" for full profile information
3. **Visit Profiles:** Use the external link button to visit original profiles
4. **Search & Filter:** Use the search bar to find specific creators

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js** for 3D graphics capabilities
- **React Three Fiber** for React integration
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for smooth animations
- **Unsplash** for beautiful imagery

## 📞 Contact

- **Website:** [ignitedreaper.com](https://ignitedreaper.com)
- **Email:** hello@ignitedreaper.com
- **Twitter:** [@ignitedreaper](https://twitter.com/ignitedreaper)

---

**IgNited Reaper** - Where creativity meets technology and digital innovation is ignited! 🔥
