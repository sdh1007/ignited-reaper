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
- Built-in moderation dashboard for reviewing community submissions before they go live

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

1. **Clone and install dependencies:**
   ```bash
   cd ignited-reaper-app
   pnpm install
   ```

2. **Run the development server:**
   ```bash
   pnpm dev
   ```

3. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

4. **Moderate submissions:**
   Visit [http://localhost:3000/moderation](http://localhost:3000/moderation) to approve pending memorials, archive entries, or restore past submissions.

### Data persistence

Profile data is now backed by a SQLite database stored at `data/profiles.db`. The first run seeds the database using `data/profiles-db.json`; subsequent edits happen through the moderation dashboard or the `/api/profiles` endpoints. For production deployments without writable disk, point `data/profiles.db` to an attached volume or swap the implementation to a managed service (Supabase, PlanetScale, etc.) by adapting `src/lib/db.ts`.

### Build for Production

```bash
pnpm build
pnpm start
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

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Home page component
├── components/
│   ├── 3d/                # Three.js 3D components
│   │   ├── Cemetery.tsx   # Main 3D scene
│   │   ├── Gravestone.tsx # Interactive gravestone objects
│   │   ├── Ground.tsx     # Cemetery ground and paths
│   │   └── Atmosphere.tsx # Particles and effects
│   └── ui/                # UI components
│       ├── Header.tsx     # Navigation and controls
│       ├── ProfilePanel.tsx # Profile detail modal
│       ├── MobileGrid.tsx # Mobile card layout
│       └── LoadingSpinner.tsx # Loading states
├── data/
│   ├── profiles-db.json   # Legacy seed data imported on first run
│   └── profiles.db        # SQLite database storing live memorials
├── lib/
│   └── types.ts           # TypeScript type definitions
└── store/
    └── cemetery.ts        # Zustand state management
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

### Components
- **Glassmorphism panels** with frosted backgrounds
- **Glowing hover states** with platform-specific colors
- **Smooth animations** powered by Framer Motion
- **Responsive breakpoints** for all device sizes

## 📦 Key Dependencies

```json
{
  "@react-three/fiber": "^8.15.11",    // 3D rendering
  "@react-three/drei": "^9.88.13",     // 3D helpers and controls
  "zustand": "^4.4.7",                 // State management
  "framer-motion": "^10.16.16",        // Animations
  "zod": "^3.22.4",                    // Type validation
  "three": "^0.158.0",                 // 3D graphics library
  "tailwindcss": "^3.3.0"              // Utility-first CSS
}
```

## 🔧 Configuration

### Environment Variables (Optional)
Create a `.env.local` file for any future API integrations:

```env
# Example for future social media API integration
NEXT_PUBLIC_TWITTER_API_KEY=your_key_here
NEXT_PUBLIC_INSTAGRAM_API_KEY=your_key_here
```

### Tailwind Configuration
The project uses a custom Tailwind config with cemetery-themed colors and gothic typography. See `tailwind.config.ts` for the complete design system.

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy with zero configuration

### Other Platforms
The app is a standard Next.js application and can be deployed to:
- Netlify
- Railway
- Digital Ocean
- AWS Amplify
- Any Node.js hosting provider

## 🛠️ Development

### Adding New Profiles

Submit new memorials via the moderation dashboard or POST to `/api/profiles` with a body matching `SocialProfileSchema` (minus `id`). Pending entries appear immediately on the dashboard for approval.

### Customizing the Cemetery
Modify `src/components/3d/Cemetery.tsx` to:
- Adjust lighting and fog effects
- Add new atmospheric elements
- Change camera angles and controls

### Adding New Platforms
1. Update the `PlatformSchema` in `src/lib/types.ts`
2. Add platform colors to `src/components/ui/Header.tsx`
3. Update the filter options

## 🐛 Troubleshooting

### Common Issues

**3D Scene Not Loading:**
- Ensure WebGL is supported in your browser
- Try disabling browser extensions
- Check the browser console for errors

**Mobile Performance:**
- The mobile version automatically falls back to 2D for performance
- Ensure you're testing on actual mobile devices, not just browser dev tools

**Build Errors:**
- Make sure all dependencies are installed: `pnpm install`
- Clear Next.js cache: `rm -rf .next`
- Restart the development server

### Browser Support
- **Chrome/Chromium:** Full support
- **Firefox:** Full support  
- **Safari:** Full support (iOS 12+)
- **Edge:** Full support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎭 Credits

- **3D Graphics:** React Three Fiber & Three.js
- **Profile Images:** Unsplash (for demo purposes)
- **Gothic Font:** Google Fonts (Creepster)
- **Icons:** Lucide React

## 📞 Support

For questions, issues, or feature requests:
- Create an issue on GitHub
- Check the troubleshooting section above
- Review the project documentation

---

**Built with 💀 by the IgNited Reaper team**

*Bringing social profiles back from the digital grave, one gravestone at a time.*
