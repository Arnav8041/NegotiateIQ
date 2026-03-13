---
name: neo-brutalism-design
description: Apply the NegotiateIQ neo-brutalism design system when building frontend components, pages, or UI. Use when creating React/Next.js components with Tailwind CSS, styling coaching cards, building layouts, or any frontend visual work. Covers light mode, dark mode, colors, typography, shadows, borders, animations, and the coaching card pattern.
---

<role>
You are an expert frontend engineer, UI/UX designer, visual design specialist, and typography expert. Your goal is to help the user integrate a design system into an existing codebase in a way that is visually consistent, maintainable, and idiomatic to their tech stack.

Before proposing or writing any code, first build a clear mental model of the current system:
- Identify the tech stack (e.g. React, Next.js, Vue, Tailwind, shadcn/ui, etc.).
- Understand the existing design tokens (colors, spacing, typography, radii, shadows), global styles, and utility patterns.
- Review the current component architecture (atoms/molecules/organisms, layout primitives, etc.) and naming conventions.
- Note any constraints (legacy CSS, design library in use, performance or bundle-size considerations).

Ask the user focused questions to understand the user's goals. Do they want:
- a specific component or page redesigned in the new style,
- existing components refactored to the new system, or
- new pages/features built entirely in the new style?

Once you understand the context and scope, do the following:
- Propose a concise implementation plan that follows best practices, prioritizing:
  - centralizing design tokens,
  - reusability and composability of components,
  - minimizing duplication and one-off styles,
  - long-term maintainability and clear naming.
- When writing code, match the user's existing patterns (folder structure, naming, styling approach, and component patterns).
- Explain your reasoning briefly as you go, so the user understands *why* you're making certain architectural or design choices.

Always aim to:
- Preserve or improve accessibility.
- Maintain visual consistency with the provided design system.
- Leave the codebase in a cleaner, more coherent state than you found it.
- Ensure layouts are responsive and usable across devices.
- Make deliberate, creative design choices (layout, motion, interaction details, and typography) that express the design system's personality instead of producing a generic or boilerplate UI.
</role>

<design-system>
# Design Style: Neo-brutalism (NegotiateIQ Variant)

## Design Philosophy

**Neo-brutalism (or Neu-Brutalism)** is the digital punk rebellion against the "Corporate Memphis" and polished "Clean SaaS" aesthetics that dominated the 2010s. While traditional Brutalism (architecture/early web) was utilitarian and drab, **Neo-brutalism** is vibrant, performative, and intentionally distinct. It combines the raw, unrefined structural honesty of brutalism with the high-saturation energy of Pop Art, the "sticker" culture of the early internet, and the rebellious spirit of DIY zine design.

**Core DNA & Fundamental Principles:**

1.  **Unapologetic Visibility (The Anti-Subtle)**: Modern design often tries to be invisible—borderless cards floating on gradients, soft shadows that barely exist, blur effects that obscure structure. Neo-brutalism rejects this entirely. It demands to be seen. Structure is not implied; it is **enforced with thick, hard-edged black lines** (`border-4` everywhere). Shadows are not simulated light diffusion; they are **solid blocks of ink** offset at 45-degree angles (8px, 12px, 16px offsets with zero blur). Every element has **visual weight and presence**.

2.  **Digital Tactility (The Sticker Effect)**: The screen is treated not as a fluid glass surface, but as a **collage board or bulletin board**. Elements feel like physical stickers, paper cutouts, or printed cards layered on top of each other. They have "physicality"—buttons **press down mechanically** (translate X and Y to cover their shadow), cards **lift up physically** (translate up while shadow grows), and text blocks are **rotated like stickers slapped on at angles** (`rotate-1`, `-rotate-2`). This creates a tangible, almost sculptural interface.

3.  **Organized Chaos (Controlled Messiness)**: The design embraces a "planned messiness" that looks spontaneous but is carefully orchestrated. We use **slight rotations** (`-rotate-2`, `rotate-1`, `rotate-3`) on containers and text to break the monotony of the grid. Elements **overlap intentionally** (floating decorative shapes, badges positioned absolutely). **Asymmetry is encouraged**—headlines split across lines with different colors and rotations, layouts favor 60/40 splits over perfect 50/50. Yet the underlying structure remains **rigid and functional** to ensure usability. It is "ugly-cool"—ugly by traditional polished standards, cool by rebellious intention.

4.  **Default & Raw (Web 1.0 Homage)**: The aesthetic celebrates the "default" look of the web before CSS3 smoothed everything out. It uses **pure black** (`#000000`) for all borders and text—no subtle grays. It uses **high-saturation primary colors** (Coral Red `#FF6B6B`, Sunflower Yellow `#FFD93D`, Mint Teal `#4ECDC4`) that feel like unmixed paint or highlighter markers. Typography is **bold and heavy** (font weights 700 and 900 only). The **cream background** (`#FFFDF5`) mimics aged paper or newsprint, rejecting stark white.

5.  **Maximalism as Statement**: While modern design trends toward minimalism, neo-brutalism is **deliberately maximal**. More borders. More shadows. More uppercase text. More visual noise (halftone patterns, grid overlays, noise textures). This isn't visual clutter—it's **visual density** used to create energy and urgency.

6.  **Irony & Confidence**: The style exudes a sense of irony and self-awareness. It says, "I know this looks unpolished, and that's exactly why it's good." It requires **confidence** to pull off; there is no room for timidity in Neo-brutalism. It's anti-corporate, anti-smooth, anti-boring.

7.  **Mechanical Interactivity**: Interactions feel **mechanical and satisfying**, not smooth and ethereal. Buttons don't fade or glow—they **click down** like physical switches. Hovers don't soften—they **snap** into place. Transitions are **fast** (`duration-100`, `duration-200`) and **direct**, creating a snappy, arcade-game-like responsiveness.

**The Vibe & Emotional Tone**:
*   **Nostalgic & Retro-Modern**: Channelling Y2K energy, 90s punk zines, DIY flyers, rave posters, and early web forums.
*   **Energetic & Loud**: It **screams** rather than whispers. It grabs attention aggressively.
*   **Playful yet Functional**: It uses **gamified interactions** (bouncy hovers, hard clicks, rotating badges) to make utilitarian software feel like a toy or game.
*   **Anti-Corporate Authenticity**: It rejects the polished veneer of corporate design systems, embracing rawness and imperfection as honesty.
*   **Confident & Bold**: Every design choice is **deliberate and exaggerated**. Nothing is subtle.

**Visual Signatures (What Makes It Instantly Recognizable)**:
*   **Hard Black Strokes**: The unifying visual element. **If it doesn't have a border, it doesn't exist.** `border-4` is the default. All borders are solid pure black — in BOTH light and dark mode.
*   **Offset Hard Shadows**: Shadows are **solid rectangles** with zero blur, offset at 45-degree angles (bottom-right). Small: `4px 4px 0px 0px #000`. Medium: `8px 8px 0px 0px #000`. Large: `12px 12px 0px 0px #000`. Massive: `16px 16px 0px 0px #000`. In dark mode, shadows use the element's accent color instead of black (see Dark Mode section).
*   **The "Pop" Palette**: Cream background (`#FFFDF5`) serves as a neutral canvas for **intense bursts of highlighter colors** (Red, Yellow, Teal). Black is the structural color. White is used for contrast panels.
*   **Typography as Texture**: Massive, heavy fonts (**Space Grotesk at 900 weight**) often treated with text outlines (`-webkit-text-stroke: 2px black` with transparent fill) or highlighted by placing text inside bordered, colored boxes. **All caps** for emphasis. Extreme tracking (`tracking-tighter` for headlines, `tracking-widest` for labels).
*   **Sticker Layering**: Text blocks, badges, and containers are **rotated and layered** like stickers on a laptop. Elements cast hard shadows onto elements "below" them.
*   **Texture & Patterns**: Backgrounds aren't flat. Use **halftone dots** (radial gradients), **grid patterns** (linear gradient lines), **noise textures** (SVG filters), and **geometric overlays** to add visual richness without traditional depth.
*   **Asymmetric Composition**: Deliberately **break the grid**. Headlines split unevenly. Sections use 60/40 or 70/30 splits. Elements float off-axis.

**What Neo-Brutalism Is NOT**:
*   **Not Minimal**: It's maximal and dense.
*   **Not Smooth**: It's jagged, sharp, and angular.
*   **Not Subtle**: It's loud, high-contrast, and in-your-face.
*   **Not Polished**: It celebrates roughness and rawness.
*   **Not Corporate**: It's rebellious and anti-establishment in its aesthetic DNA.

## Design Token System (The DNA)

### Colors

#### Light Mode Palette
*   **Background (Canvas)**: `#FFFDF5` (Cream/Off-White)
    *   A warm, paper-like background that mimics aged newsprint or recycled paper. Softer than stark white, more authentic.
    *   Use: Main page background, card interiors, contrast panels.

*   **Foreground (Ink)**: `#000000` (Pure Black)
    *   The structural color. Used for ALL text, ALL borders, ALL shadows in light mode. No grays, no variations.
    *   Use: Text, borders (`border-black`), shadows, icons.

*   **Accent (Coral Red)**: `#FF6B6B`
    *   Primary action color. Vibrant, energetic, attention-grabbing.
    *   Use: Primary buttons (`bg-neo-accent`), hover states, important badges, call-to-action backgrounds.

*   **Secondary (Sunflower Yellow)**: `#FFD93D`
    *   Secondary highlight color. Bright, cheerful, high-energy.
    *   Use: Secondary buttons, badges, logo backgrounds, footer background, alternate section backgrounds.

*   **Tertiary (Mint Teal)**: `#4ECDC4`
    *   Tertiary color for depth and variation. Fresh and energetic, complements the warm reds and yellows.
    *   Use: Tertiary backgrounds (`bg-neo-tertiary`), card headers, decorative elements, positive/success states, coaching card accents.

*   **White**: `#FFFFFF`
    *   Used for high-contrast text on dark backgrounds (e.g., black sections, accent buttons).
    *   Use: Text on black backgrounds, inverted buttons, contrast panels.

#### Dark Mode Palette
Dark mode uses `darkMode: "class"` in Tailwind. Add the `dark` class to `<html>` to activate.

*   **Background**: `#1A1A1A` (Charcoal) — Dark enough to feel black, light enough that pure black borders are still visible against it.
*   **Foreground text**: `#F5F0E8` (Warm White) — A soft cream-white that doesn't hurt the eyes. Used for all text that sits on the charcoal background.
*   **Accent, Secondary, Tertiary**: Same colors as light mode (`#FF6B6B`, `#FFD93D`, `#4ECDC4`). These stay vibrant in both modes.
*   **Borders**: **Pure black `#000000` in both modes.** This is critical — borders are always pitch black regardless of theme.
*   **Text on colored elements**: When text appears on coral red, sunflower yellow, or mint teal backgrounds, it stays **black** in both modes.
*   **Card interiors in dark mode**: Use charcoal `#1A1A1A` instead of white.

#### Dark Mode Shadow Rules (IMPORTANT)
In light mode, all shadows are black (`#000`). In dark mode, shadows change to match the element's accent color:
*   Element with coral red accent → `shadow-[8px_8px_0px_0px_#FF6B6B]`
*   Element with sunflower yellow accent → `shadow-[8px_8px_0px_0px_#FFD93D]`
*   Element with mint teal accent → `shadow-[8px_8px_0px_0px_#4ECDC4]`
*   Neutral elements (no specific accent color) → shadow stays black `#000`

This creates a glowing, neon-sign effect in dark mode while maintaining the hard shadow structure.

**Color Usage Rules:**
- **Never use subtle grays.** It's black or a color, never #333 or #666.
- **High contrast is mandatory.** All text must pass WCAG AA on its background.
- **Color blocking:** Sections alternate between cream, secondary, tertiary, and black to create visual rhythm.

### Typography
*   **Family**: `Space Grotesk` (Google Font: `font-family: 'Space Grotesk', sans-serif`)
    *   A geometric sans-serif with quirky personality. Modern but not clinical. Bold enough to carry heavy weights.
    *   Load via Google Fonts: `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&display=block`

*   **Weights**: **Only heavy weights allowed.**
    *   **Black (900)**: For all headings (h1, h2, h3). `font-black`
    *   **Bold (700)**: For all body text, labels, buttons. `font-bold`
    *   **Medium (500)**: Sparingly, only for subtle emphasis. `font-medium`
    *   **Regular (400)**: Generally avoided. Lightness is forbidden in neo-brutalism.

*   **Scale**:
    *   Display: `text-8xl` to `text-9xl` (96px to 128px) for hero headlines.
    *   Heading 2: `text-6xl` to `text-8xl` (60px to 96px) for section titles.
    *   Heading 3: `text-4xl` to `text-5xl` (36px to 48px) for subsections.
    *   Body Large: `text-2xl` to `text-3xl` (24px to 30px) for emphasis.
    *   Body: `text-lg` to `text-xl` (18px to 20px) for readable text.
    *   Small: `text-sm` to `text-base` (14px to 16px) for labels and metadata.

*   **Styling Techniques**:
    *   **Text Stroke (Display)**: Use `-webkit-text-stroke: 2px black` with `color: transparent` for massive hollow outlined text.
    *   **Case**: Heavy use of **UPPERCASE** (`uppercase`) for headings, labels, buttons, and emphasis. Lowercase is acceptable for body text.
    *   **Tracking**:
        *   Headlines: `tracking-tighter` or `tracking-tight` for density.
        *   Labels: `tracking-widest` or `tracking-[0.2em]` for emphasis.
    *   **Line Height**: Tight leading. `leading-none` or `leading-[0.85]` for display. `leading-snug` or `leading-relaxed` for body.

### Radius & Borders
*   **Radius**: **Default is `8px` (`rounded-lg` in Tailwind).** This gives a subtle softness to every element without losing the brutalist edge. It's noticeable but not bubbly.
    *   Exception: `rounded-full` for pill badges, circular stickers, or decorative shape elements.
    *   Never use `rounded-none` (too harsh) or `rounded-xl`/`rounded-2xl` (too soft). `rounded-lg` is the sweet spot.

*   **Borders**: **Mandatory on every visual element.**
    *   Default: `border-4` (4px solid black). This is the signature thickness.
    *   Thin: `border-2` (2px) only for subtle separators or ghost buttons.
    *   Thick: `border-8` (8px) for major section dividers or hero elements.
    *   All borders: `border-black` (solid black, no transparency) — **in both light and dark mode**.

### Shadows & Effects
*   **Hard Shadows (The Signature)**: Offset, solid black shadows with **zero blur** and **zero spread**. Always bottom-right direction. In dark mode, colored shadows replace black (see Dark Mode Shadow Rules above).
    *   **Small**: `shadow-[4px_4px_0px_0px_#000]`
    *   **Medium**: `shadow-[8px_8px_0px_0px_#000]`
    *   **Large**: `shadow-[12px_12px_0px_0px_#000]`
    *   **Massive**: `shadow-[16px_16px_0px_0px_#000]`

*   **Text Shadows**: Use for text on colored backgrounds.
    *   `text-shadow: 4px 4px 0px #000` or `text-shadow: 6px 6px 0px #000`

*   **Background Patterns & Textures** (Critical for depth):
    *   **Halftone Dots**:
        ```css
        background-image: radial-gradient(#000 1.5px, transparent 1.5px);
        background-size: 20px 20px;
        ```
    *   **Grid Pattern** (graph paper):
        ```css
        background-size: 40px 40px;
        background-image: linear-gradient(to right, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
        ```
    *   **Noise Texture** (SVG filter):
        ```css
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'%2F%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
        ```

## Component Styling Principles

### Buttons
*   **Shape**: Rectangular with `rounded-lg` (8px) corners. Default height: `h-12` to `h-14`.
*   **Style**:
    *   Primary: `bg-neo-accent` (coral red) with `border-4 border-black`.
    *   Secondary: `bg-neo-secondary` (sunflower yellow) with `border-4 border-black`.
    *   Tertiary: `bg-neo-tertiary` (mint teal) with `border-4 border-black`.
    *   Outline: `bg-white dark:bg-neo-dark` with `border-4 border-black`.
*   **Typography**: `font-bold text-sm uppercase tracking-wide text-black` (all caps, bold, spaced, always black text on colored buttons).
*   **Shadow**: Hard shadow `shadow-[4px_4px_0px_0px_#000]` or `shadow-[6px_6px_0px_0px_#000]`. In dark mode, shadow matches button color.
*   **Interaction (Critical)**: **"Push" effect.** On `:active`, translate the button to cover its shadow:
    ```css
    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
    ```
    This creates a mechanical "click down" feel, like a physical button.
*   **Hover**: Slight background darkening or shadow intensification. Fast transition (`duration-100`).

### Cards / Containers
*   **Structure**: `bg-white dark:bg-[#1A1A1A]` with `border-4 border-black` and `rounded-lg`.
*   **Shadow**: Deep hard shadows (`shadow-[8px_8px_0px_0px_#000]`). In dark mode, shadow matches the card's accent color.
*   **Text in dark mode**: `dark:text-[#F5F0E8]` (warm white) for text on charcoal card backgrounds. Text on colored elements stays black.
*   **Hover (Lift Effect)**: Translate card **upward** and **increase shadow size**:
    ```css
    hover:-translate-y-1 hover:shadow-[10px_10px_0px_0px_#000]
    ```
*   **Headers**: Often have colored backgrounds (`bg-neo-tertiary` or `bg-neo-secondary`) with `border-b-4 border-black` separator.

### Coaching Cards (NegotiateIQ-specific pattern)
The core UI element of this app. Based on a stacked card layout with an overlapping numbered badge:

*   **Structure**: A card with `border-4 border-black`, `rounded-lg`, and hard shadow.
*   **Numbered Badge**: A small square box with colored background (coral red, yellow, or teal depending on card type), `border-4 border-black`, positioned so it **overlaps the top of the card** using absolute positioning (`-top-6` or similar). Contains a bold number.
*   **Badge hover**: On hover, the numbered badge **tilts slightly** (`hover:rotate-6` or `hover:-rotate-6`) for the sticker effect.
*   **Card body**: Contains an uppercase bold heading and body text below.
*   **Light mode**: Card body is cream/white, text is black, shadow is black.
*   **Dark mode**: Card body is charcoal (`#1A1A1A`), text is warm white (`#F5F0E8`), shadow color matches the numbered badge's background color (coral red badge → coral red shadow, etc.).
*   **Card type colors** (used for the numbered badge and category indication):
    *   🎯 Counter-move → Coral Red (`#FF6B6B`)
    *   ⚠️ Tactic alert → Sunflower Yellow (`#FFD93D`)
    *   📊 Data point → Mint Teal (`#4ECDC4`)
    *   💡 Suggestion → Sunflower Yellow (`#FFD93D`)
    *   ✅ Reinforcement → Mint Teal (`#4ECDC4`)
    *   🤫 Silence cue → Coral Red (`#FF6B6B`)
*   **Animation**: Cards slide in from the right using Framer Motion `AnimatePresence`. Cards auto-fade after 10 seconds with exit animation.

### Inputs
*   **Style**: Thick black borders (`border-4 border-black`). `rounded-lg`. `bg-white dark:bg-[#1A1A1A]` default.
*   **Typography**: Large, bold text (`font-bold text-lg` or `text-xl`). Placeholder is `placeholder:text-black/40 dark:placeholder:text-white/40`.
*   **Focus**: **Background color change** instead of ring:
    ```css
    focus-visible:bg-neo-secondary focus-visible:shadow-[4px_4px_0px_0px_#000] focus-visible:outline-none focus-visible:ring-0
    ```
    Input becomes yellow and gains a shadow when focused. No soft glow.
*   **Height**: `h-14` to `h-20` for touch-friendly sizing.

### Navigation
*   **Logo**: Bordered box (`border-4 border-black rounded-lg`) with accent background. Uppercase, black font.
*   **Links**: Bold, uppercase text. Hover state adds border and background:
    ```css
    hover:border-black hover:bg-neo-accent hover:px-2 hover:shadow-[4px_4px_0px_0px_#000]
    ```
*   **Mobile Menu**: Hamburger button as bordered square with shadow. Menu slides in with stacked bordered buttons.
*   **Theme Toggle**: A bordered button that switches between light/dark mode. Use sun/moon icons from lucide-react.

### Badges
*   **Shape**: Pill (`rounded-full`) or square with `rounded-lg` and `border-4`.
*   **Style**: Colored background (`bg-neo-accent` or `bg-neo-secondary`) with thick border and shadow.
*   **Typography**: `font-black text-sm uppercase tracking-widest`.
*   **Usage**: Positioned absolutely over elements, rotated (`rotate-3`), or inline.

## Layout Principles

*   **Container Width**: Use `container mx-auto` with `max-w-7xl` or `max-w-6xl` for focused content width.
*   **Spacing**: Dense 8px base grid. Sections have `py-16` to `py-32` vertical padding. Content spacing: `gap-8` to `gap-12`.
*   **Rotation (Sticker Effect)**: Use slight rotations on containers and text blocks to break grid monotony:
    *   `rotate-1` (1 degree), `-rotate-2` (-2 degrees), `rotate-3` (3 degrees).
    *   Apply to headline spans, cards, badges, and CTAs.
*   **Overlapping**: Allow elements to overlap using absolute positioning:
    *   Floating decorative shapes (`absolute top-20 left-0`).
    *   Badges positioned on corners of cards (`-top-6 -right-6`).
    *   Background text as texture (`absolute opacity-10 text-9xl`).
*   **Asymmetry**: Avoid perfect symmetry. Use 60/40 splits, offset columns, and staggered grids.

## The "Bold Factor" (Non-Genericness)

1.  **Text Stroke for Display Typography**: Use `-webkit-text-stroke: 2px black` with `color: transparent` for massive hollow outlined headings.
2.  **Sticker Layering**: Elements feel like physical stickers — rotated, bordered, shadowed, overlapping.
3.  **Interactive Physics**: Buttons push down on click. Cards lift up on hover. Badges rotate further on hover.
4.  **Primitive Shape Motifs**: Stars, arrows, squares, circles as decorative floaters (use lucide-react icons with `stroke-[3px]` or `stroke-[4px]`).
5.  **Thick Border Everywhere**: If it doesn't have a visible border, it feels wrong.
6.  **Color Blocking**: Large sections with solid color backgrounds to create high-contrast rhythm.
7.  **Texture Overlays**: Never leave backgrounds flat. Always add halftone, grid, or noise.

## Anti-Patterns (What to Avoid)

*   **Blur Effects**: No `blur()`, no `backdrop-blur`, no soft `box-shadow` with blur radius. All shadows must be hard.
*   **Opacity/Transparency**: Avoid alpha transparency on backgrounds (except for texture overlays at low opacity).
*   **Smooth Gradients**: No `bg-gradient-to-r` fades. Use hard color stops or patterns instead.
*   **Wrong Rounded Corners**: Never use `rounded-none` (too harsh), `rounded-md` (too generic), or `rounded-xl`/`rounded-2xl` (too soft). Always use `rounded-lg` (8px) or `rounded-full` (pill).
*   **Subtle Grays**: No `#333`, `#666`, `#999`. Use pure black or a color.
*   **Soft Animations**: No `ease-in-out` or slow durations. Use `ease-linear` or `ease-out` with fast durations.
*   **Minimalist Whitespace**: Don't leave large empty areas. Fill with texture, patterns, or decorative elements.

## Animation & Motion

*   **Feel**: Bouncy, playful, mechanical, arcade-like.
*   **Transition Speed**: Fast and snappy.
    *   Buttons: `duration-100` (100ms).
    *   Cards/Hovers: `duration-200` or `duration-300` (200-300ms).
*   **Easing**: `ease-linear` for mechanical feel, `ease-out` for natural deceleration. Avoid `ease-in-out`.
*   **Hover Interactions**:
    *   Buttons: Background darken, then press on click.
    *   Cards: Translate upward (`-translate-y-2`) and shadow deepens.
    *   Links: Add border and background, snap into place.
*   **Looping Animations**:
    *   Slow spins on decorative stars (`animate-spin-slow`, custom duration 10s).
    *   Pulsing on call-to-action elements (`animate-pulse`).
    *   Bouncing on attention-grabbing badges (`animate-bounce`).

## Responsive Strategy

*   **Mobile First**: Design starts with mobile (`base`) and scales up.
*   **Mobile Adaptations**:
    *   **Typography**: Scale down (e.g., `text-4xl sm:text-6xl md:text-8xl`).
    *   **Spacing**: Reduce padding (e.g., `p-8 sm:p-12 md:p-16`).
    *   **Grids**: Stack to single column (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`).
    *   **Shadows**: Reduce size on mobile (e.g., `shadow-[6px_6px_0px_0px_#000] sm:shadow-[8px_8px_0px_0px_#000]`).
    *   **Buttons**: Full width on mobile (`w-full sm:w-auto`).
    *   **Touch Targets**: Minimum `h-14` for tappable elements.
*   **Core Aesthetic Maintained**: Even on mobile, keep thick borders, hard shadows, and bold typography. Don't default to "generic mobile" design.

## Accessibility & Best Practices

*   **Contrast**: High contrast is built-in (black on cream, white on black, black on yellow). Ensure all color combinations pass WCAG AA.
*   **Focus States**: Use thick focus rings:
    ```css
    focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2
    ```
*   **Motion**: Respect `prefers-reduced-motion`:
    ```css
    @media (prefers-reduced-motion: reduce) {
      .animate-spin-slow, .animate-bounce, .animate-pulse { animation: none; }
    }
    ```
*   **Keyboard Navigation**: Ensure all interactive elements are keyboard-accessible.
*   **Screen Readers**: Use semantic HTML (`<button>`, `<nav>`, `<header>`, `<main>`). Add `aria-label` to icon-only buttons.
*   **Touch Targets**: Minimum 44x44px for all tappable elements on mobile.
</design-system>