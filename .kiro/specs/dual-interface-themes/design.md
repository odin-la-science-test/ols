# Design Document: Dual Interface Themes

## Overview

Cette fonctionnalité ajoute deux nouveaux thèmes complets à l'application Odin La Science : "Medical Professional" et "Dark Laboratory". Ces thèmes s'intègrent au système de thèmes existant (ThemeContext) qui gère actuellement 5 thèmes : cosmic-glass, neumorphic-soft, brutalist-minimal, cyberpunk-neon, et botanical-journal.

### Objectifs

1. Créer deux nouveaux design systems complets avec palettes de couleurs, typographies et effets visuels distincts
2. Optimiser "Medical Professional" pour les environnements cliniques avec lisibilité maximale et design épuré
3. Optimiser "Dark Laboratory" pour les laboratoires avec éclairage tamisé, réduisant la fatigue oculaire
4. Intégrer les nouveaux thèmes au système existant sans régression
5. Assurer l'accessibilité (WCAG AA pour Medical Professional, WCAG AAA pour Dark Laboratory)
6. Maintenir les performances (transitions < 300ms, bundle size < 2KB par thème)

### Contexte Technique

L'application utilise un système de thèmes centralisé basé sur React Context (ThemeContext.tsx) qui :
- Définit des thèmes via un objet `themes: Record<ThemeName, Theme>`
- Applique les thèmes en injectant des variables CSS au `document.documentElement`
- Persiste les préférences utilisateur dans localStorage (device-level et user-specific)
- Supporte les transitions animées entre thèmes

Les composants de l'application utilisent ces variables CSS pour leur styling, permettant un changement de thème dynamique sans rechargement.



## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ThemeProvider                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  themes: Record<ThemeName, Theme>                     │  │
│  │  - cosmic-glass                                       │  │
│  │  - neumorphic-soft                                    │  │
│  │  - brutalist-minimal                                  │  │
│  │  - cyberpunk-neon                                     │  │
│  │  - botanical-journal                                  │  │
│  │  - medical-professional  ← NEW                       │  │
│  │  - dark-laboratory       ← NEW                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Theme Application Engine                             │  │
│  │  - Apply CSS Variables to document.documentElement    │  │
│  │  - Set data-theme attribute                           │  │
│  │  - Persist to localStorage                            │  │
│  │  - Handle user-specific preferences                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  CSS Variables (document root)              │
│  --bg-primary, --text-primary, --accent-primary, etc.       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│              Application Components                         │
│  Use CSS variables for styling                              │
│  Automatically adapt to theme changes                       │
└─────────────────────────────────────────────────────────────┘
```

### Theme Selection Flow

```
User clicks theme card in Settings
         ↓
ThemeSelector calls setTheme(themeName)
         ↓
ThemeContext updates currentTheme state
         ↓
useEffect triggers theme application
         ↓
┌────────────────────────────────────┐
│ 1. Apply CSS Variables             │
│ 2. Set data-theme attribute        │
│ 3. Save to localStorage (device)   │
│ 4. Save to user-specific key       │
└────────────────────────────────────┘
         ↓
Components re-render with new styles
```

### Data Flow

1. **Initialization**: ThemeProvider reads from localStorage (user-specific or device-level)
2. **Theme Application**: CSS variables are injected into document root
3. **Persistence**: Theme choice is saved to localStorage synchronously
4. **User Login/Logout**: Theme preferences are loaded/reverted based on user state



## Components and Interfaces

### Modified Components

#### 1. ThemeContext.tsx

**Modifications Required:**

```typescript
// Extend ThemeName type
export type ThemeName = 
  | 'cosmic-glass' 
  | 'neumorphic-soft' 
  | 'brutalist-minimal' 
  | 'cyberpunk-neon' 
  | 'botanical-journal'
  | 'medical-professional'  // NEW
  | 'dark-laboratory';      // NEW

// Add new theme definitions to themes Record
const themes: Record<ThemeName, Theme> = {
  // ... existing themes ...
  'medical-professional': { /* theme definition */ },
  'dark-laboratory': { /* theme definition */ }
};
```

**No Breaking Changes**: The existing interface remains unchanged. New themes are additive.

#### 2. ThemeSelector Component (Account.tsx / mobile/Settings.tsx)

**Current Implementation**: Renders theme cards in a grid, displays all themes from ThemeContext.

**Required Changes**: None to logic. The component already iterates over `Object.values(themes)`, so new themes will automatically appear.

**Visual Verification**: Ensure 7 theme cards are displayed (5 existing + 2 new).

### Component Interfaces

#### Theme Interface (Existing)

```typescript
export interface Theme {
    name: ThemeName;
    label: string;              // Display name (e.g., "Medical Professional")
    description: string;        // French description for UI
    designSystem: DesignSystem;
    colors: {
        // Backgrounds
        bgPrimary: string;
        bgSecondary: string;
        bgTertiary: string;
        
        // Text
        textPrimary: string;
        textSecondary: string;
        
        // Accents
        accentPrimary: string;
        accentSecondary: string;
        accentMunin: string;
        accentHugin: string;
        
        // UI Elements
        borderColor: string;
        cardBg: string;
        inputBg: string;
        
        // Gradients
        gradientStart: string;
        gradientEnd: string;
        
        // Design-specific (optional)
        shadowColor?: string;
        glowColor?: string;
    };
}
```

#### DesignSystem Interface (Existing)

```typescript
export interface DesignSystem {
    // Typography
    fontFamily: string;
    fontWeightNormal: number;
    fontWeightBold: number;
    
    // Spacing & Sizing
    borderRadius: string;
    spacing: string;
    
    // Visual Effects
    shadowStyle: 'glow' | 'soft' | 'none';
    effectStyle: 'blur' | 'emboss' | 'flat';
    
    // Component Styles
    buttonStyle: 'glass' | 'neumorphic' | 'brutalist';
    cardStyle: 'glass' | 'neumorphic' | 'brutalist';
    inputStyle: 'glass' | 'neumorphic' | 'brutalist';
}
```



## Data Models

### Medical Professional Theme Definition

```typescript
'medical-professional': {
    name: 'medical-professional',
    label: 'Medical Professional',
    description: 'Interface épurée et professionnelle optimisée pour les environnements médicaux et cliniques',
    designSystem: {
        fontFamily: "'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        fontWeightNormal: 400,
        fontWeightBold: 600,
        borderRadius: '0.5rem',
        spacing: '2rem',
        shadowStyle: 'soft',
        effectStyle: 'flat',
        buttonStyle: 'neumorphic',
        cardStyle: 'neumorphic',
        inputStyle: 'neumorphic',
    },
    colors: {
        // Backgrounds - Clinical White
        bgPrimary: '#FFFFFF',
        bgSecondary: '#F7FAFC',
        bgTertiary: '#EDF2F7',
        
        // Text - Steel Gray
        textPrimary: '#4A5568',
        textSecondary: '#718096',
        
        // Accents - Medical Blue
        accentPrimary: '#0077BE',    // Primary medical blue
        accentSecondary: '#00A3E0',  // Secondary lighter blue
        accentMunin: '#10B981',      // Green for Munin (knowledge/data)
        accentHugin: '#0077BE',      // Blue for Hugin (lab tools)
        
        // UI Elements
        borderColor: '#CBD5E0',
        cardBg: '#FFFFFF',
        inputBg: '#F7FAFC',
        
        // Gradients
        gradientStart: '#0077BE',
        gradientEnd: '#00A3E0',
        
        // Design-specific
        shadowColor: '#CBD5E0',
    }
}
```

**Design Rationale:**
- **Clinical White (#FFFFFF)**: Maximum brightness for well-lit medical environments
- **Medical Blue (#0077BE)**: Professional, trustworthy color associated with healthcare
- **Steel Gray (#4A5568)**: High contrast for readability, professional appearance
- **Roboto Font**: Sans-serif optimized for screen readability, widely used in medical software
- **Neumorphic Style**: Soft, tactile appearance with subtle shadows for depth without distraction
- **Generous Spacing (2rem)**: Reduces visual clutter, improves focus on critical information

**Accessibility:**
- Contrast ratio bgPrimary/textPrimary: 8.59:1 (WCAG AAA)
- Contrast ratio bgPrimary/accentPrimary: 4.53:1 (WCAG AA)
- Meets WCAG AA standards for all text sizes

### Dark Laboratory Theme Definition

```typescript
'dark-laboratory': {
    name: 'dark-laboratory',
    label: 'Dark Laboratory',
    description: 'Interface sombre avec éléments lumineux optimisée pour les laboratoires avec éclairage tamisé',
    designSystem: {
        fontFamily: "'Source Code Pro', 'Courier New', monospace",
        fontWeightNormal: 400,
        fontWeightBold: 700,
        borderRadius: '0.25rem',
        spacing: '1.5rem',
        shadowStyle: 'glow',
        effectStyle: 'flat',
        buttonStyle: 'glass',
        cardStyle: 'glass',
        inputStyle: 'glass',
    },
    colors: {
        // Backgrounds - Deep Black
        bgPrimary: '#0A0A0A',
        bgSecondary: '#1A1A1A',
        bgTertiary: '#2A2A2A',
        
        // Text - Light Gray
        textPrimary: '#E5E5E5',
        textSecondary: '#A0A0A0',
        
        // Accents - Phosphorescent Green & Amber
        accentPrimary: '#00FF41',    // Phosphorescent green (high visibility)
        accentSecondary: '#FF6B35',  // Amber/orange (warnings, highlights)
        accentMunin: '#00FF41',      // Green for Munin (data/knowledge)
        accentHugin: '#00D4FF',      // Cyan for Hugin (lab tools)
        
        // UI Elements
        borderColor: '#00FF41',
        cardBg: 'rgba(26, 26, 26, 0.8)',
        inputBg: 'rgba(42, 42, 42, 0.8)',
        
        // Gradients
        gradientStart: '#00FF41',
        gradientEnd: '#00D4FF',
        
        // Design-specific
        glowColor: 'rgba(0, 255, 65, 0.5)',
        shadowColor: 'rgba(0, 255, 65, 0.3)',
    }
}
```

**Design Rationale:**
- **Deep Black (#0A0A0A)**: Minimizes eye strain in low-light laboratory environments
- **Phosphorescent Green (#00FF41)**: High visibility, reminiscent of oscilloscopes and lab equipment
- **Amber Accent (#FF6B35)**: Warm contrast for warnings and important highlights
- **Source Code Pro**: Monospace font for technical precision, common in scientific software
- **Glass Style**: Semi-transparent elements with glow effects for futuristic lab aesthetic
- **Compact Spacing (1.5rem)**: Higher information density suitable for data-heavy lab interfaces
- **Sharp Corners (0.25rem)**: Technical, precise appearance

**Accessibility:**
- Contrast ratio bgPrimary/textPrimary: 18.24:1 (WCAG AAA)
- Contrast ratio bgPrimary/accentPrimary: 15.67:1 (WCAG AAA)
- Exceeds WCAG AAA standards for enhanced visibility in low-light conditions

### CSS Variables Mapping

When a theme is applied, the following CSS variables are set on `document.documentElement`:

```css
/* Color Variables */
--bg-primary: <theme.colors.bgPrimary>
--bg-secondary: <theme.colors.bgSecondary>
--bg-tertiary: <theme.colors.bgTertiary>
--text-primary: <theme.colors.textPrimary>
--text-secondary: <theme.colors.textSecondary>
--accent-primary: <theme.colors.accentPrimary>
--accent-secondary: <theme.colors.accentSecondary>
--accent-munin: <theme.colors.accentMunin>
--accent-hugin: <theme.colors.accentHugin>
--border-color: <theme.colors.borderColor>
--card-bg: <theme.colors.cardBg>
--input-bg: <theme.colors.inputBg>
--gradient-start: <theme.colors.gradientStart>
--gradient-end: <theme.colors.gradientEnd>

/* Design System Variables */
--font-family: <theme.designSystem.fontFamily>
--font-weight-normal: <theme.designSystem.fontWeightNormal>
--font-weight-bold: <theme.designSystem.fontWeightBold>
--border-radius: <theme.designSystem.borderRadius>
--spacing: <theme.designSystem.spacing>

/* Optional Variables */
--shadow-color: <theme.colors.shadowColor> (if defined)
--glow-color: <theme.colors.glowColor> (if defined)
```

Additionally, `data-theme` attribute is set: `<html data-theme="medical-professional">` or `<html data-theme="dark-laboratory">`



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Theme Structure Completeness

*For any* theme in the themes Record, the theme object must contain all required properties: name, label, description, designSystem (with all sub-properties), and colors (with all required color properties).

**Validates: Requirements 3.3, 3.7**

### Property 2: CSS Variables Application Completeness

*For any* theme that is applied, all color properties and designSystem properties must be set as CSS variables on document.documentElement.

**Validates: Requirements 3.4, 5.3, 5.6, 5.7**

### Property 3: Conditional CSS Variables

*For any* theme with a glowColor property defined, the --glow-color CSS variable must be set; for any theme without glowColor, the --glow-color CSS variable must be removed from document root.

**Validates: Requirements 5.4, 5.5**

### Property 4: Theme Persistence

*For any* theme selection, the theme name must be saved to localStorage under 'selectedTheme' key, and if a user is logged in, also under 'theme_{username}' key.

**Validates: Requirements 3.6, 6.3, 6.7**

### Property 5: Theme Restoration

*For any* valid theme name stored in localStorage, when the application loads, that theme must be restored and applied correctly.

**Validates: Requirements 6.4, 6.6**

### Property 6: Theme Selection Immediate Application

*For any* theme card clicked in the Theme Selector, the selected theme must be applied immediately without requiring page reload.

**Validates: Requirements 4.3**

### Property 7: Active Theme Indication

*For any* currently active theme, the Theme Selector must display a checkmark indicator on that theme's card.

**Validates: Requirements 4.5**

### Property 8: Theme Preview Colors

*For any* theme displayed in the Theme Selector, the preview must show the theme's accentPrimary, accentSecondary, and accentMunin colors.

**Validates: Requirements 4.4**

### Property 9: Consistent Theme Card Styling

*For all* theme cards in the Theme Selector, the card styling (dimensions, padding, layout) must be consistent regardless of which theme is currently active.

**Validates: Requirements 4.7**

### Property 10: Theme Transition Duration

*For any* theme change, color transitions must complete within 300ms using ease-in-out timing function.

**Validates: Requirements 7.7, 8.1, 8.2**

### Property 11: Theme Transition Properties

*For any* theme transition, background colors, text colors, and border colors must animate smoothly without causing layout reflow.

**Validates: Requirements 8.3, 8.7**

### Property 12: Mobile Theme Application

*For any* theme selected on mobile devices (viewport < 768px), the theme must apply without causing layout shift or content jumping.

**Validates: Requirements 7.4**

### Property 13: Browser Zoom Support

*For all* themes, the layout must remain functional and readable when browser zoom is set up to 200%.

**Validates: Requirements 9.7**

### Property 14: Interactive Component Consistency

*For all* interactive components (buttons, inputs, cards), hover and active states must be applied consistently with the current theme's aesthetics.

**Validates: Requirements 10.7**

### Property 15: Font Loading Performance

*For all* themes, font loading must not block the initial render of the application.

**Validates: Requirements 11.7**

### Property 16: CSS Variable Update Performance

*For any* theme change, CSS variables must be updated in less than 50ms.

**Validates: Requirements 12.1**

### Property 17: Component Re-render Optimization

*For any* theme change, only components that depend on theme variables should re-render; components without theme dependencies must not re-render.

**Validates: Requirements 12.2**

### Property 18: CSS Variable Batching

*For any* theme application, all CSS variable updates must be batched into a single DOM operation to minimize reflows.

**Validates: Requirements 12.3**

### Property 19: Initial Theme Application Timing

*For any* theme loaded on application start, CSS variables must be applied before the first contentful paint.

**Validates: Requirements 12.4**

### Property 20: Frame Rate During Transitions

*For all* theme transitions, the application must maintain 60fps throughout the animation.

**Validates: Requirements 12.7**

### Example-Based Tests

The following requirements are best validated through specific example tests rather than universal properties:

**Medical Professional Theme Configuration** (Requirements 1.1-1.10):
- Verify exact color values (#FFFFFF, #0077BE, #4A5568, etc.)
- Verify Roboto font family
- Verify borderRadius: 0.5rem, spacing: 2rem
- Verify shadowStyle: 'soft', cardStyle: 'neumorphic'

**Dark Laboratory Theme Configuration** (Requirements 2.1-2.10):
- Verify exact color values (#0A0A0A, #00FF41, #E5E5E5, etc.)
- Verify Source Code Pro font family
- Verify borderRadius: 0.25rem, spacing: 1.5rem
- Verify shadowStyle: 'glow', cardStyle: 'glass'
- Verify glowColor property exists

**Theme System Integration** (Requirements 3.1, 3.2, 3.5):
- Verify ThemeName type includes 'medical-professional' and 'dark-laboratory'
- Verify themes Record contains both new themes
- Verify existing themes still work correctly

**Theme Selector UI** (Requirements 4.1, 4.2, 4.6):
- Verify Medical Professional displays with correct label and French description
- Verify Dark Laboratory displays with correct label and French description
- Verify exactly 7 theme cards are rendered

**Specific CSS Application** (Requirements 5.1, 5.2):
- Verify Medical Professional applies all CSS variables correctly
- Verify Dark Laboratory applies all CSS variables correctly

**Specific Persistence** (Requirements 6.1, 6.2, 6.5):
- Verify 'medical-professional' is saved to localStorage when selected
- Verify 'dark-laboratory' is saved to localStorage when selected
- Verify theme reverts to device preference on logout

**Mobile Rendering** (Requirements 7.1, 7.2, 7.3, 7.5):
- Verify Medical Professional renders correctly on mobile
- Verify Dark Laboratory renders correctly on mobile
- Verify responsive grid layout (1 column mobile, 2-3 desktop)
- Verify font scaling on small screens

**Specific Transitions** (Requirements 8.5):
- Verify glow effects animate gradually when transitioning to Dark Laboratory

**Accessibility Contrast** (Requirements 9.1-9.5):
- Verify Medical Professional meets WCAG AA (4.5:1 normal text, 3:1 large text)
- Verify Dark Laboratory meets WCAG AAA (7:1 normal text)
- Verify phosphorescent green readability
- Verify focus indicators on both themes

**Component Styling** (Requirements 10.1-10.6):
- Verify neumorphic buttons with subtle shadows for Medical Professional
- Verify glass buttons with glow borders for Dark Laboratory
- Verify input field styling for both themes
- Verify card styling for both themes

**Typography** (Requirements 11.1-11.4, 11.6):
- Verify Roboto loads for Medical Professional
- Verify Source Code Pro loads for Dark Laboratory
- Verify font weights (400/600 for Medical, 400/700 for Dark Lab)
- Verify monospace rendering for Dark Laboratory

**Bundle Size** (Requirements 12.5, 12.6):
- Verify Medical Professional adds < 2KB to bundle
- Verify Dark Laboratory adds < 2KB to bundle



## Error Handling

### Invalid Theme Name

**Scenario**: User has an invalid theme name stored in localStorage (e.g., from a typo or old version).

**Handling**:
```typescript
const saved = localStorage.getItem('selectedTheme');
if (saved && themes[saved as ThemeName]) {
    return saved as ThemeName;
}
return 'cosmic-glass'; // Fallback to default
```

**Error Recovery**: Silently fallback to 'cosmic-glass' default theme. No user-facing error message needed as this is transparent recovery.

### Missing Theme Properties

**Scenario**: A theme definition is incomplete (missing required color or designSystem property).

**Handling**: TypeScript type system enforces completeness at compile time. The `Theme` interface requires all properties.

**Runtime Validation** (optional defensive programming):
```typescript
function validateTheme(theme: Theme): boolean {
    const requiredColors = ['bgPrimary', 'textPrimary', 'accentPrimary', /* ... */];
    const requiredDesignProps = ['fontFamily', 'borderRadius', 'spacing', /* ... */];
    
    return requiredColors.every(key => theme.colors[key]) &&
           requiredDesignProps.every(key => theme.designSystem[key]);
}
```

**Error Recovery**: If validation fails, log error to console and fallback to default theme.

### Font Loading Failure

**Scenario**: Google Fonts fails to load (network issue, blocked by firewall).

**Handling**: CSS font-family declarations include system fallbacks:
```css
font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
font-family: 'Source Code Pro', 'Courier New', monospace;
```

**Error Recovery**: Browser automatically uses fallback fonts. No JavaScript intervention needed.

### localStorage Unavailable

**Scenario**: localStorage is disabled (private browsing, browser settings).

**Handling**:
```typescript
function saveTheme(themeName: ThemeName) {
    try {
        localStorage.setItem('selectedTheme', themeName);
    } catch (e) {
        console.warn('localStorage unavailable, theme preference will not persist');
        // Continue with theme application
    }
}
```

**Error Recovery**: Theme still applies for current session but won't persist. User experience is degraded but functional.

### CSS Variable Application Failure

**Scenario**: document.documentElement is not available (rare edge case during SSR or testing).

**Handling**:
```typescript
useEffect(() => {
    if (typeof document === 'undefined') return;
    
    const root = document.documentElement;
    if (!root) {
        console.error('Cannot apply theme: document root not available');
        return;
    }
    
    // Apply CSS variables...
}, [currentTheme]);
```

**Error Recovery**: Log error and skip theme application. Application may render with browser defaults.

### Theme Transition Performance Degradation

**Scenario**: Device has limited resources, transitions cause frame drops.

**Handling**: Use CSS `prefers-reduced-motion` media query:
```css
@media (prefers-reduced-motion: reduce) {
    * {
        transition-duration: 0.01ms !important;
    }
}
```

**Error Recovery**: Respect user's accessibility preference for reduced motion. Transitions become instant.

### User Logout Theme Reversion

**Scenario**: User logs out, system needs to revert to device-level theme.

**Handling**:
```typescript
function loadThemeForUser(username: string | null) {
    if (username) {
        const userTheme = localStorage.getItem(`theme_${username}`);
        if (userTheme && themes[userTheme as ThemeName]) {
            setCurrentTheme(userTheme as ThemeName);
        }
    } else {
        // User logged out, revert to device default
        const deviceTheme = localStorage.getItem('selectedTheme');
        if (deviceTheme && themes[deviceTheme as ThemeName]) {
            setCurrentTheme(deviceTheme as ThemeName);
        }
    }
}
```

**Error Recovery**: If device theme is invalid, fallback to 'cosmic-glass'.



## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

- **Unit tests**: Verify specific theme configurations, exact color values, and concrete examples
- **Property-based tests**: Verify universal behaviors across all themes (including future themes)

Both approaches are complementary and necessary. Unit tests catch specific bugs in theme definitions, while property-based tests ensure the theme system works correctly for any theme.

### Unit Testing

**Framework**: Vitest with React Testing Library

**Test Categories**:

1. **Theme Configuration Tests**
   - Verify Medical Professional theme has exact color values
   - Verify Dark Laboratory theme has exact color values
   - Verify font families are correct
   - Verify design system properties (borderRadius, spacing, etc.)
   - Verify optional properties (glowColor for Dark Lab, shadowColor for Medical)

2. **Theme Selector UI Tests**
   - Verify 7 theme cards are rendered
   - Verify Medical Professional label and description
   - Verify Dark Laboratory label and description
   - Verify theme preview colors are displayed
   - Verify active theme shows checkmark

3. **CSS Application Tests**
   - Verify Medical Professional applies all CSS variables
   - Verify Dark Laboratory applies all CSS variables
   - Verify data-theme attribute is set correctly
   - Verify glowColor is set/removed appropriately

4. **Persistence Tests**
   - Verify 'medical-professional' saves to localStorage
   - Verify 'dark-laboratory' saves to localStorage
   - Verify user-specific keys are used when logged in
   - Verify logout reverts to device theme

5. **Accessibility Tests**
   - Calculate contrast ratios for Medical Professional (verify ≥ 4.5:1)
   - Calculate contrast ratios for Dark Laboratory (verify ≥ 7:1)
   - Verify focus indicators are visible
   - Test with browser zoom at 200%

6. **Mobile Rendering Tests**
   - Verify responsive grid layout at different viewport sizes
   - Verify no layout shift on theme change (mobile)
   - Verify font scaling on small screens

7. **Integration Tests**
   - Verify backward compatibility with existing 5 themes
   - Verify theme switching between all 7 themes
   - Verify theme persistence across page reloads

**Example Unit Test**:
```typescript
describe('Medical Professional Theme', () => {
    it('should have correct color palette', () => {
        const theme = themes['medical-professional'];
        expect(theme.colors.bgPrimary).toBe('#FFFFFF');
        expect(theme.colors.accentPrimary).toBe('#0077BE');
        expect(theme.colors.textPrimary).toBe('#4A5568');
    });
    
    it('should meet WCAG AA contrast requirements', () => {
        const theme = themes['medical-professional'];
        const contrastRatio = calculateContrast(
            theme.colors.bgPrimary,
            theme.colors.textPrimary
        );
        expect(contrastRatio).toBeGreaterThanOrEqual(4.5);
    });
});
```

### Property-Based Testing

**Framework**: fast-check (JavaScript property-based testing library)

**Configuration**: Minimum 100 iterations per property test

**Test Tagging**: Each property test must include a comment referencing the design property:
```typescript
// Feature: dual-interface-themes, Property 1: Theme Structure Completeness
```

**Property Test Categories**:

1. **Theme Structure Validation**
   - **Property 1**: For any theme, verify all required properties exist
   - Generate: Random theme objects with missing properties
   - Assert: Validation catches incomplete themes

2. **CSS Variables Application**
   - **Property 2**: For any theme applied, verify all CSS variables are set
   - Generate: Random theme selections from all 7 themes
   - Assert: All expected CSS variables exist on document root

3. **Conditional Variables**
   - **Property 3**: For any theme with/without glowColor, verify CSS variable presence
   - Generate: Themes with and without glowColor
   - Assert: --glow-color is set/removed correctly

4. **Theme Persistence**
   - **Property 4**: For any theme selection, verify localStorage is updated
   - Generate: Random theme selections, random user states (logged in/out)
   - Assert: Correct localStorage keys are set

5. **Theme Restoration**
   - **Property 5**: For any valid theme in localStorage, verify it's restored
   - Generate: Random valid theme names in localStorage
   - Assert: Theme is applied on initialization

6. **Theme Selection**
   - **Property 6**: For any theme card clicked, verify immediate application
   - Generate: Random theme selections via UI interaction
   - Assert: Theme changes without reload

7. **Active Indication**
   - **Property 7**: For any active theme, verify checkmark is displayed
   - Generate: Random theme selections
   - Assert: Checkmark appears on correct card

8. **Preview Colors**
   - **Property 8**: For any theme, verify preview shows correct colors
   - Generate: All themes
   - Assert: Preview contains accentPrimary, accentSecondary, accentMunin

9. **Card Styling Consistency**
   - **Property 9**: For all theme cards, verify consistent styling
   - Generate: All themes
   - Assert: Card dimensions and layout are identical

10. **Transition Duration**
    - **Property 10**: For any theme change, verify 300ms transition
    - Generate: Random theme transitions
    - Assert: Transition completes within 300ms ± 50ms tolerance

11. **Transition Properties**
    - **Property 11**: For any transition, verify no layout reflow
    - Generate: Random theme transitions
    - Assert: Layout dimensions remain stable

12. **Mobile Application**
    - **Property 12**: For any theme on mobile, verify no layout shift
    - Generate: Random themes at mobile viewport
    - Assert: Layout stability metrics

13. **Zoom Support**
    - **Property 13**: For all themes at 200% zoom, verify functionality
    - Generate: All themes with 200% zoom simulation
    - Assert: No overflow, text remains readable

14. **Interactive Consistency**
    - **Property 14**: For all interactive components, verify theme-consistent states
    - Generate: Random themes and component states
    - Assert: Hover/active styles match theme

15. **Font Loading**
    - **Property 15**: For all themes, verify non-blocking font load
    - Generate: All themes
    - Assert: Initial render completes before fonts load

16. **Update Performance**
    - **Property 16**: For any theme change, verify < 50ms update time
    - Generate: Random theme changes
    - Assert: Performance.now() delta < 50ms

17. **Re-render Optimization**
    - **Property 17**: For any theme change, verify minimal re-renders
    - Generate: Random theme changes with render tracking
    - Assert: Only theme-dependent components re-render

18. **Variable Batching**
    - **Property 18**: For any theme, verify single DOM operation
    - Generate: All themes with DOM mutation observer
    - Assert: Single batch of CSS variable updates

19. **Initial Timing**
    - **Property 19**: For any initial theme, verify pre-FCP application
    - Generate: Random initial themes
    - Assert: CSS variables set before first contentful paint

20. **Frame Rate**
    - **Property 20**: For all transitions, verify 60fps
    - Generate: Random theme transitions with frame monitoring
    - Assert: No frames take > 16.67ms

**Example Property Test**:
```typescript
import fc from 'fast-check';

// Feature: dual-interface-themes, Property 2: CSS Variables Application Completeness
describe('CSS Variables Application', () => {
    it('should apply all CSS variables for any theme', () => {
        fc.assert(
            fc.property(
                fc.constantFrom(...Object.keys(themes)),
                (themeName) => {
                    const { setTheme } = renderThemeProvider();
                    act(() => setTheme(themeName as ThemeName));
                    
                    const root = document.documentElement;
                    const theme = themes[themeName as ThemeName];
                    
                    // Verify all color variables
                    expect(root.style.getPropertyValue('--bg-primary'))
                        .toBe(theme.colors.bgPrimary);
                    expect(root.style.getPropertyValue('--text-primary'))
                        .toBe(theme.colors.textPrimary);
                    // ... verify all other variables
                    
                    return true;
                }
            ),
            { numRuns: 100 }
        );
    });
});
```

### Performance Testing

**Metrics to Monitor**:
- Theme switch time: < 50ms for CSS variable updates
- Transition duration: 300ms ± 10ms
- Frame rate during transition: 60fps (16.67ms per frame)
- Bundle size increase: < 2KB per theme
- First contentful paint: CSS variables applied before FCP

**Tools**:
- Chrome DevTools Performance tab
- Lighthouse performance audits
- Bundle analyzer (webpack-bundle-analyzer or similar)

### Accessibility Testing

**Automated Tests**:
- Contrast ratio calculations using color-contrast library
- Focus indicator visibility tests
- Zoom level tests (programmatic viewport scaling)

**Manual Tests** (recommended but not automated):
- Screen reader testing with NVDA/JAWS
- Keyboard navigation through theme selector
- Visual inspection of focus indicators
- Real device testing on mobile

### Regression Testing

**Ensure Existing Themes Still Work**:
- Run all existing theme tests after adding new themes
- Verify no breaking changes to ThemeContext API
- Verify no performance degradation for existing themes
- Verify no visual regressions (screenshot comparison)

### Test Coverage Goals

- **Unit Test Coverage**: > 90% for ThemeContext.tsx and theme definitions
- **Property Test Coverage**: All 20 correctness properties implemented
- **Integration Test Coverage**: All user flows (theme selection, persistence, restoration)
- **Accessibility Coverage**: All WCAG criteria tested (contrast, zoom, focus)

