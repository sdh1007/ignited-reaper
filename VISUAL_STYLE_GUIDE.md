# Visual Style Guide - IgNited Reaper Cemetery Map

> **Digital Necromancy Design System**  
> A visual reference for the gothic aesthetic and design specifications

---

## 🎨 Color System

### Night Mode Palette (Primary)

#### Core Backgrounds

```
┌─────────────────────────────────────┐
│  Abyss Deep      #090b16           │  Deepest space, outer edges
├─────────────────────────────────────┤
│  Abyss Mist      #1a2332           │  Fog and atmospheric effects
├─────────────────────────────────────┤
│  Indigo Shadow   #16213e           │  Shadow and depth layers
├─────────────────────────────────────┤
│  Indigo Twilight #1a1a2e           │  Primary background
└─────────────────────────────────────┘
```

**Usage**:

- `#090b16` - Outer space, vignette edges, modal backdrops
- `#1a2332` - Fog effects, secondary backgrounds, card backgrounds
- `#16213e` - Shadows under elevated elements, depth cues
- `#1a1a2e` - Main canvas background, primary surface

#### Ember Accents (Red/Orange)

```
┌─────────────────────────────────────┐
│  █ Ember Glow       #ee5a6f        │  Primary accent, lanterns
├─────────────────────────────────────┤
│  ▓ Ember Soft       35% opacity    │  Subtle glows, hover states
├─────────────────────────────────────┤
│  ▓ Ember Strong     65% opacity    │  Strong emphasis, borders
└─────────────────────────────────────┘
```

**Usage**:

- Full opacity - Buttons, lantern lights, selected states, brand color
- 35% - Hover glows, background accents, subtle highlights
- 65% - Focus rings, active borders, important highlights

#### Silver Tones (Text)

```
┌─────────────────────────────────────┐
│  Silver Mist      #c5c6c7          │  Primary text, headlines
├─────────────────────────────────────┤
│  Silver Dim       #9aa0a9          │  Secondary text, labels
├─────────────────────────────────────┤
│  Silver Ghost     rgba(192,202,223,0.16) │  Borders, dividers
└─────────────────────────────────────┘
```

**Usage**:

- `#c5c6c7` - Body text, headings, primary content
- `#9aa0a9` - Secondary text, placeholders, meta information
- `rgba(...)` - Borders, dividers, subtle separators

#### Spectral Interactives (Cyan/Purple)

```
┌─────────────────────────────────────┐
│  Spectral Blue    #4A90A4          │  Search focus, links
├─────────────────────────────────────┤
│  Spectral Purple  #7c7ec6          │  Secondary interactive
└─────────────────────────────────────┘
```

**Usage**:

- `#4A90A4` - Search bar focus, link hover, interactive highlights
- `#7c7ec6` - Secondary buttons, alternative interactive states

### Day Mode Palette (Secondary)

```
┌─────────────────────────────────────┐
│  Sky Overcast     #718096          │  Overcast sky base
├─────────────────────────────────────┤
│  Sky Light        #9fb9e6          │  Lighter sky tones
├─────────────────────────────────────┤
│  Ground Moss      #4a5568          │  Ground and earth tones
├─────────────────────────────────────┤
│  Text Day         #2d3748          │  Primary day text
├─────────────────────────────────────┤
│  Ember Day        rgba(238,90,111,0.28) │  Softer accent
└─────────────────────────────────────┘
```

**Note**: Day mode maintains melancholic atmosphere with overcast aesthetic

---

## 📝 Typography System

### Font Families

#### Primary: Creepster (Display)

```
Font Family: 'Creepster', serif
Use Cases: Logo, section headers, dramatic emphasis
Fallback: serif
Loading: Google Fonts CDN
```

**Examples**:

- Logo: `IgNited Reaper` - 28-32px
- Section Headers: `Spirit Details` - 20-24px
- Loading Messages: `Spirits Stirring...` - 18-20px

#### Secondary: Inter (UI/Body)

```
Font Family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
Use Cases: All body text, UI elements, labels, inputs
Weights: 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
```

**Examples**:

- Body Text: 14-16px, Regular, line-height 1.6
- UI Labels: 12-13px, Medium, uppercase, letter-spacing 0.3em
- Buttons: 14px, Semi-Bold

### Type Scale

```
H1 (Logo/Main Title)
────────────────────────────────────
Font: Creepster
Size: 28-32px (mobile-desktop)
Weight: 400
Letter-spacing: 0.02em
Color: Silver Mist (#c5c6c7)

H2 (Section Headers)
────────────────────────────────────
Font: Creepster
Size: 20-24px
Weight: 400
Letter-spacing: 0.04em
Color: Silver Mist (#c5c6c7)
Text-shadow: Subtle glow

H3 (Subsections)
────────────────────────────────────
Font: Inter Semi-Bold
Size: 18-20px
Weight: 600
Letter-spacing: 0.01em
Color: Silver Mist (#c5c6c7)

Body Text
────────────────────────────────────
Font: Inter Regular
Size: 14-16px
Weight: 400
Line-height: 1.6
Color: Silver Mist (#c5c6c7)

Small Text / Captions
────────────────────────────────────
Font: Inter Regular
Size: 12-13px
Weight: 400
Letter-spacing: 0.35em
Transform: uppercase
Color: Silver Dim (#9aa0a9)

Labels / Micro Copy
────────────────────────────────────
Font: Inter Medium
Size: 11-12px
Weight: 500
Letter-spacing: 0.3em
Transform: uppercase
Color: Silver Dim (#9aa0a9)
```

### Epitaph Text Style

```css
.epitaph-text {
  font-family: "Inter", sans-serif;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-shadow:
    0 1px 0 rgba(10, 12, 20, 0.9),
    /* Engraved shadow */ 0 0 18px rgba(238, 90, 111, 0.12); /* Soft glow */
  color: #c5c6c7;
}
```

**Use on**: Profile names, important labels, engraved-looking text

---

## ✨ Glow & Shadow Effects

### Ember Glow (Primary Accent)

```css
.ember-glow {
  box-shadow:
    0 0 16px rgba(238, 90, 111, 0.25),
    /* Inner glow */ 0 0 32px rgba(238, 90, 111, 0.15),
    /* Outer glow */ 0 4px 16px rgba(0, 0, 0, 0.3); /* Depth shadow */
}
```

**Use on**: Lanterns, primary buttons, logo, ember-colored elements

**Strong Variant**:

```css
.ember-glow-strong {
  box-shadow:
    0 0 20px rgba(238, 90, 111, 0.45),
    0 0 40px rgba(238, 90, 111, 0.25),
    0 0 60px rgba(238, 90, 111, 0.15);
}
```

**Use on**: Active/selected states, hover emphasis

### Spectral Glow (Secondary Interactive)

```css
.spectral-glow {
  box-shadow:
    0 0 18px rgba(124, 126, 198, 0.35),
    0 0 36px rgba(124, 126, 198, 0.18);
}
```

**Use on**: Floating orbs, magical elements, ethereal effects

### Cyan Focus Glow (Interactive)

```css
.cyan-focus-glow {
  box-shadow:
    0 0 8px rgba(74, 144, 164, 0.4),
    0 0 16px rgba(74, 144, 164, 0.25),
    0 0 24px rgba(74, 144, 164, 0.12);
}
```

**Use on**: Search focus, form focus, interactive element highlights

### Moon Mist Shadow (Elevation)

```css
.moon-mist-shadow {
  box-shadow:
    0 20px 40px rgba(18, 21, 36, 0.45),
    0 8px 16px rgba(18, 21, 36, 0.35);
}
```

**Use on**: Modals, floating panels, elevated cards

---

## 🎭 Component Patterns

### Search Bar States

#### Default

```
┌────────────────────────────────────────────────────┐
│  🔍  Search spirits...                             │
├────────────────────────────────────────────────────┤
│  Border: Silver Ghost (subtle)                     │
│  Background: Translucent surface                   │
│  Icon: Silver Dim                                  │
│  Placeholder: Silver Dim at 70% opacity            │
└────────────────────────────────────────────────────┘
```

#### Focused

```
┌════════════════════════════════════════════════════┐
║  🔍  Search spirits...                             ║
╠════════════════════════════════════════════════════╣
║  Border: Spectral Blue (glowing)                   ║
║  Background: Translucent with cyan gradient        ║
║  Icon: Spectral Blue, scaled 110%                  ║
║  Placeholder: Silver Dim at 30% opacity            ║
║  Glow: Cyan radial gradient blur                   ║
└────────────────────────────────────────────────────┘
```

**Transition**: 300ms ease-in-out

### Button States

#### Primary Button (Ember)

```
Default:
┌─────────────────────┐
│  Visit Spirit Realm │  ← Ember Glow background
└─────────────────────┘    Text: Abyss Deep (#090b16)

Hover:
┌─────────────────────┐
│  Visit Spirit Realm │  ← Stronger glow, scale 102%
└─────────────────────┘    Radial gradient overlay

Active:
┌─────────────────────┐
│  Visit Spirit Realm │  ← Scale 98%, brief pulse
└─────────────────────┘
```

#### Secondary Button (Ghost)

```
Default:
┌─────────────────────┐
│  All Platforms      │  ← Translucent background
└─────────────────────┘    Border: Silver Ghost
                           Text: Silver Dim

Hover:
┌─────────────────────┐
│  All Platforms      │  ← Background: slightly opaque
└─────────────────────┘    Border: Ember Soft
                           Text: Silver Mist
```

### Card/Panel Surface

```
┌────────────────────────────────────────┐
│  ╭──────────────────────────────────╮  │
│  │                                  │  │
│  │  Content Area                    │  │
│  │                                  │  │
│  │  Background: Surface Panel       │  │
│  │  rgba(18, 24, 44, 0.86)         │  │
│  │                                  │  │
│  │  Border: Surface Border          │  │
│  │  rgba(192, 202, 223, 0.16)      │  │
│  │                                  │  │
│  │  Backdrop Filter: blur(18px)     │  │
│  │  Shadow: Spectral glow           │  │
│  │                                  │  │
│  ╰──────────────────────────────────╯  │
└────────────────────────────────────────┘
```

**Glassmorphism effect** - Translucent with heavy blur

### Profile Card (Grid View)

```
┌──────────────────────────────────┐
│  ┌────────────────────────────┐  │
│  │  [Avatar - 56px circle]    │  │  ← Border: Platform color
│  │                            │  │
│  │  Display Name              │  │  ← 16px, Semi-Bold, Silver Mist
│  │  @handle                   │  │  ← 13px, Regular, Platform color
│  │                            │  │
│  │  Bio preview...            │  │  ← 13px, 2 lines, Silver Dim
│  │                            │  │
│  │  [Platform Badge]          │  │  ← Platform color background
│  └────────────────────────────┘  │
│                                  │
│  Background: Surface translucent │
│  Border: Silver Ghost            │
│  Border-radius: 16px             │
│  Hover: Scale 102%, glow effect  │
└──────────────────────────────────┘
```

### Loading State

```
┌────────────────────────────────────────┐
│              🔮                        │  ← Animated scale pulse
│                                        │
│      SPIRITS STIRRING...               │  ← Creepster, 18px
│                                        │     Letter-spacing: 0.4em
│  Binding memories to the veil.         │
│  Please hold on a moment.              │  ← Inter, 13px, Silver Dim
│                                        │
│  ┌──────────────────────────────────┐ │
│  │ ▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░ │ │  ← Shimmer animation
│  └──────────────────────────────────┘ │     Ember gradient
│  ┌──────────────────────────────────┐ │
│  │ ░░░░░▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░ │ │
│  └──────────────────────────────────┘ │
│  ┌──────────────────────────────────┐ │
│  │ ░░░░░░░░░▓▓▓▓░░░░░░░░░░░░░░░░░░ │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Secure channel with the afterlife     │
│  steady                                │  ← 11px, uppercase
└────────────────────────────────────────┘
```

**Personality**: Gothic language, animated elements, reassuring

---

## 🎬 Animation Specifications

### Transition Durations

```
Micro Interactions:    150ms   (button clicks, toggles)
Small Elements:        300ms   (hover states, focus)
Medium Transitions:    400ms   (panel slides, fades)
Large Transitions:     600ms   (page transitions)
Cinematic Effects:     4000ms  (day/night transition)
```

### Easing Curves

```css
/* Standard easing for most animations */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Eclipse easing for day/night transition */
transition-timing-function: cubic-bezier(0.6, 0.04, 0.3, 1);

/* Bounce for playful elements */
transition-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Smooth out for exit animations */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

### Lantern Flicker Animation

```css
@keyframes lantern-flicker {
  0%,
  100% {
    opacity: 0.85;
    filter: brightness(1);
  }
  10% {
    opacity: 0.78;
    filter: brightness(0.95);
  }
  20% {
    opacity: 0.92;
    filter: brightness(1.05);
  }
  30% {
    opacity: 0.8;
    filter: brightness(0.98);
  }
  40%,
  80% {
    opacity: 0.88;
    filter: brightness(1.02);
  }
  50% {
    opacity: 0.75;
    filter: brightness(0.92);
  }
}

.lantern-light {
  animation: lantern-flicker 4.5s ease-in-out infinite;
}
```

**Use on**: Lantern lights, flame effects

### Floating/Drift Animation

```css
@keyframes lantern-drift {
  0%,
  100% {
    transform: translate3d(0, 0, 0) scale(1);
  }
  50% {
    transform: translate3d(0.15rem, -0.4rem, 0) scale(1.04);
  }
}

.animate-float {
  animation: lantern-drift 8s ease-in-out infinite;
}
```

**Use on**: Floating orbs, suspended elements

### Ember Pulse Animation

```css
@keyframes ember-pulse {
  0% {
    box-shadow: 0 0 10px rgba(238, 90, 111, 0.2);
    opacity: 0.85;
  }
  50% {
    box-shadow: 0 0 26px rgba(238, 90, 111, 0.55);
    opacity: 1;
  }
  100% {
    box-shadow: 0 0 10px rgba(238, 90, 111, 0.2);
    opacity: 0.85;
  }
}

.animate-glow {
  animation: ember-pulse 3s ease-in-out infinite;
}
```

**Use on**: Glowing elements that should breathe

---

## 📐 Spacing & Layout

### Spacing Scale (Tailwind)

```
xs:  4px    (0.25rem)   - Tight element spacing
sm:  8px    (0.5rem)    - Button padding, icon gaps
md:  12px   (0.75rem)   - Card internal padding
lg:  16px   (1rem)      - Section padding, card gaps
xl:  24px   (1.5rem)    - Page margins (mobile)
2xl: 32px   (2rem)      - Page margins (desktop)
3xl: 48px   (3rem)      - Section spacing
4xl: 64px   (4rem)      - Major section breaks
```

### Border Radius

```
sm:  8px    - Small buttons, inputs
md:  12px   - Cards, panels
lg:  16px   - Large cards, modals
xl:  24px   - Hero sections, main containers
full: 9999px - Pills, avatars, round buttons
```

### Common Patterns

**Card Padding**:

- Mobile: 16px (p-4)
- Tablet: 20px (p-5)
- Desktop: 24px (p-6)

**Page Margins**:

- Mobile: 16px (px-4)
- Tablet: 24px (px-6)
- Desktop: 32px (px-8)
- Max Width: 1280px (max-w-7xl)

**Grid Gaps**:

- Mobile: 12px (gap-3)
- Tablet: 16px (gap-4)
- Desktop: 20px (gap-5)

---

## 📱 Responsive Breakpoints

```
Mobile Small:    320px   (xs)   iPhone SE
Mobile:          375px   (sm)   iPhone 12/13/14
Mobile Large:    414px          iPhone Plus
Tablet:          768px   (md)   iPad portrait
Tablet Large:    1024px  (lg)   iPad landscape
Desktop Small:   1280px  (xl)   Laptop
Desktop:         1440px         Standard monitor
Desktop Large:   1920px  (2xl)  Large monitor
4K:              2560px  (3xl)  4K displays
```

### Component Behavior

**Header**:

- Mobile: Stacked layout, logo + toggle
- Tablet: Same + inline filters
- Desktop: Full horizontal layout

**Search**:

- Mobile: Full width
- Tablet: Flex with filters
- Desktop: Same

**Cemetery View**:

- Mobile: 2D grid (1 column)
- Tablet: 2D grid (2-3 columns)
- Desktop: 3D scene

**Profile Cards**:

- Mobile: 1 column, 180px height
- Tablet: 2-3 columns, 220px height
- Desktop: 4 columns, same height

---

## 🎯 Accessibility Specifications

### Color Contrast Ratios

```
Text on Background:
  - Large text (18px+): 4.5:1 minimum (AA)
  - Normal text (16px):  7:1 target (AAA)
  - Silver Mist on Abyss Deep: 9.8:1 ✓

Interactive Elements:
  - Focus indicators: 3:1 minimum
  - Ember on Abyss: 4.2:1 ✓
  - Cyan on Abyss: 5.1:1 ✓
```

### Focus Indicators

```css
/* Standard focus ring */
.spectral-ring:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(18, 24, 44, 0.8),
    /* Inner ring */ 0 0 0 4px rgba(238, 90, 111, 0.45); /* Outer glow */
}

/* Minimum size: 2px visible outline */
/* Contrast: 3:1 against background */
```

### Touch Targets

```
Minimum Size: 44x44px (iOS guidelines)
Recommended: 48x48px (Material guidelines)
Spacing: 8px minimum between targets

Examples:
- Buttons: 44px height minimum
- Icons: 24px icon in 44px touch area
- Links: 44px height with padding
```

### Animation Preferences

```css
/* Respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🌟 Special Effects

### Glassmorphism

```css
.glass {
  background: rgba(15, 22, 36, 0.65);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(192, 202, 223, 0.16);
}

/* Stronger variant */
.glass-strong {
  background: rgba(18, 24, 44, 0.86);
  backdrop-filter: blur(18px);
  border: 1px solid rgba(192, 202, 223, 0.22);
}
```

**Use on**: Panels, modals, floating UI elements

### Vignette Effect

```css
.vignette {
  background: radial-gradient(
    circle at center,
    transparent 52%,
    rgba(8, 12, 20, 0.35) 100%
  );
}
```

**Use on**: Full-screen overlays, atmospheric depth

### Fog/Mist Gradient

```css
.fog-layer {
  background: linear-gradient(
    to top,
    rgba(26, 35, 50, 0.45) 0%,
    transparent 35%
  );
}
```

**Use on**: Bottom of screen, ground-level atmosphere

---

## 🖼️ Image & Asset Specifications

### Avatar Sizes

```
Thumbnail:  32px × 32px
Small:      48px × 48px
Medium:     64px × 64px
Large:      96px × 96px
Profile:    128px × 128px
```

All avatars: `border-radius: 50%`, `border: 2px solid [platform-color]`

### Icon Sizes

```
Micro:   12px
Small:   16px
Medium:  20px
Large:   24px
Hero:    32px
```

### Screenshot/Preview Images

```
Aspect Ratio: 16:9
Dimensions: 640×360 (thumbnail), 1280×720 (full)
Format: WebP with PNG fallback
Compression: 80% quality
Border-radius: 12px
```

---

## 💎 Platform-Specific Colors

```
Twitter:    #1DA1F2  (Blue)
Instagram:  #E4405F  (Pink/Purple)
TikTok:     #FF0050  (Hot Pink)
YouTube:    #FF0000  (Red)
Twitch:     #9146FF  (Purple)
LinkedIn:   #0077B5  (Blue)
GitHub:     #171515  (Near Black)
Discord:    #5865F2  (Blurple)
```

**Usage**: Avatar borders, platform badges, profile accents

---

## 🎨 Usage Examples

### Search Bar (Full Implementation)

```tsx
<div className="relative flex-1 group">
  {/* Cyan focus glow */}
  <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100 bg-[radial-gradient(circle_at_left,_rgba(74,144,164,0.18),_transparent_65%)] blur-lg pointer-events-none" />

  <div className="relative rounded-xl border backdrop-blur-xl transition-all duration-300 border-[var(--surface-border)] bg-[var(--surface-translucent)] group-focus-within:border-[rgba(74,144,164,0.6)] group-focus-within:shadow-[0_0_8px_rgba(74,144,164,0.4),0_0_16px_rgba(74,144,164,0.25)]">
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary group-focus-within:text-[#4A90A4] group-focus-within:scale-110 transition-all duration-300"
      size={18}
    />

    <input
      type="text"
      placeholder="Search spirits..."
      className="w-full bg-transparent py-3 pl-12 pr-4 text-sm text-primary placeholder:text-muted/70 placeholder:transition-opacity placeholder:duration-300 focus:placeholder:opacity-30 focus:outline-none"
    />
  </div>
</div>
```

### Ember Button

```tsx
<motion.button
  className="rounded-lg px-6 py-3 font-semibold text-abyss-950"
  style={{
    background: "linear-gradient(135deg, #ee5a6f, #ee5a6fcc)",
    boxShadow:
      "0 0 16px rgba(238, 90, 111, 0.25), 0 0 32px rgba(238, 90, 111, 0.15)",
  }}
  whileHover={{
    scale: 1.02,
    boxShadow:
      "0 0 20px rgba(238, 90, 111, 0.45), 0 0 40px rgba(238, 90, 111, 0.25)",
  }}
  whileTap={{ scale: 0.98 }}
>
  Visit Spirit Realm
</motion.button>
```

### Panel Surface

```tsx
<div className="rounded-2xl border border-[var(--surface-border)] bg-[rgba(18,24,44,0.86)] backdrop-blur-xl p-6 shadow-[0_0_18px_rgba(124,126,198,0.35)]">
  {/* Panel content */}
</div>
```

---

## 📚 Resources & References

### Design Inspiration

- Gothic architecture: Ornate details, vertical emphasis
- Cemetery aesthetics: Weathered stone, misty atmosphere
- Digital necromancy: Cyber-gothic fusion

### Color Theory

- **Primary**: Deep blues and purples (mystery, depth)
- **Accent**: Ember red (warmth, life in death)
- **Interactive**: Cyan (clarity, focus, technology)

### Typography Philosophy

- **Display**: Creepster (theatrical, memorable)
- **Body**: Inter (clarity, readability, modern)

---

**Status**: Reference Document  
**Version**: 1.0  
**Last Updated**: October 4, 2025

For implementation details, see:

- `QUICK_IMPLEMENTATION_GUIDE.md` - Code examples
- `ENHANCEMENT_STRATEGY.md` - Full specifications





