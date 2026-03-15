# Tasks

## 1. Extend ThemeContext Type System
- [ ] 1.1 Update ThemeName type in src/components/ThemeContext.tsx to include 'medical-professional' and 'dark-laboratory'
- [ ] 1.2 Verify type consistency across all theme-related files
- [ ] 1.3 Run TypeScript compiler to check for type errors

## 2. Create Medical Professional Theme Definition
- [ ] 2.1 Define medicalProfessionalTheme object in src/components/ThemeContext.tsx with complete color palette
  - [ ] 2.1.1 Set bgPrimary to #FFFFFF (clinical white)
  - [ ] 2.1.2 Set accentPrimary to #0077BE (medical blue)
  - [ ] 2.1.3 Set textPrimary to #4A5568 (steel gray)
  - [ ] 2.1.4 Set accentSecondary to #00A3E0
  - [ ] 2.1.5 Set accentMunin to #10B981
  - [ ] 2.1.6 Set accentHugin to #0077BE
  - [ ] 2.1.7 Set inputBg to #F7FAFC
  - [ ] 2.1.8 Define all other required color properties
- [ ] 2.2 Define designSystem properties for Medical Professional theme
  - [ ] 2.2.1 Set fontFamily to 'Roboto, sans-serif'
  - [ ] 2.2.2 Set borderRadius to '0.5rem'
  - [ ] 2.2.3 Set shadowStyle to 'soft'
  - [ ] 2.2.4 Set cardStyle to 'neumorphic'
  - [ ] 2.2.5 Set spacing to '2rem'
  - [ ] 2.2.6 Set fontWeightNormal to 400 and fontWeightBold to 600
- [ ] 2.3 Add label "Medical Professional" and French description
- [ ] 2.4 Verify WCAG AA contrast ratios for all color combinations

## 3. Create Dark Laboratory Theme Definition
- [ ] 3.1 Define darkLaboratoryTheme object in src/components/ThemeContext.tsx with complete color palette
  - [ ] 3.1.1 Set bgPrimary to #0A0A0A (deep black)
  - [ ] 3.1.2 Set accentPrimary to #00FF41 (phosphorescent green)
  - [ ] 3.1.3 Set textPrimary to #E5E5E5 (light gray)
  - [ ] 3.1.4 Set accentSecondary to #FF6B35 (amber accent)
  - [ ] 3.1.5 Set accentMunin to #00FF41
  - [ ] 3.1.6 Set accentHugin to #00D4FF
  - [ ] 3.1.7 Set bgSecondary to #1A1A1A and bgTertiary to #2A2A2A
  - [ ] 3.1.8 Set glowColor property for luminous effects
  - [ ] 3.1.9 Define all other required color properties
- [ ] 3.2 Define designSystem properties for Dark Laboratory theme
  - [ ] 3.2.1 Set fontFamily to 'Source Code Pro, monospace'
  - [ ] 3.2.2 Set borderRadius to '0.25rem'
  - [ ] 3.2.3 Set shadowStyle to 'glow'
  - [ ] 3.2.4 Set cardStyle to 'glass'
  - [ ] 3.2.5 Set spacing to '1.5rem'
  - [ ] 3.2.6 Set fontWeightNormal to 400 and fontWeightBold to 700
- [ ] 3.3 Add label "Dark Laboratory" and French description
- [ ] 3.4 Verify WCAG AAA contrast ratios for dark background text

## 4. Integrate New Themes into Theme System
- [ ] 4.1 Add medicalProfessionalTheme to themes Record in ThemeContext
- [ ] 4.2 Add darkLaboratoryTheme to themes Record in ThemeContext
- [ ] 4.3 Verify theme validation logic handles new themes correctly
- [ ] 4.4 Test theme persistence with new theme names in localStorage
- [ ] 4.5 Verify fallback to 'cosmic-glass' works for invalid theme names

## 5. Update ThemeSettings Component
- [ ] 5.1 Update themeDescriptions in src/components/ThemeSettings.tsx to include French descriptions for new themes
  - [ ] 5.1.1 Add 'medical-professional': "Interface épurée et professionnelle optimisée pour environnements médicaux"
  - [ ] 5.1.2 Add 'dark-laboratory': "Interface sombre avec éléments lumineux pour laboratoires à faible luminosité"
- [ ] 5.2 Verify theme grid displays all 7 themes correctly
- [ ] 5.3 Test theme preview colors render correctly for new themes
- [ ] 5.4 Verify checkmark indicator shows for active theme

## 6. Implement CSS Variables Application
- [ ] 6.1 Verify useEffect in ThemeProvider applies all color CSS variables for new themes
- [ ] 6.2 Verify designSystem CSS variables are applied correctly
- [ ] 6.3 Implement glowColor CSS variable handling
  - [ ] 6.3.1 Set --glow-color when theme has glowColor property
  - [ ] 6.3.2 Remove --glow-color when theme doesn't have glowColor
- [ ] 6.4 Verify data-theme attribute is set correctly on document root
- [ ] 6.5 Test CSS variable application timing to prevent FOUC

## 7. Implement Theme Transition Animations
- [ ] 7.1 Add CSS transition rules for color properties (300ms ease-in-out)
- [ ] 7.2 Test transition smoothness when switching between themes
- [ ] 7.3 Verify no layout reflow occurs during theme transitions
- [ ] 7.4 Test glow effect animation for Dark Laboratory theme
- [ ] 7.5 Verify interactive elements remain responsive during transitions

## 8. Test Mobile Responsiveness
- [ ] 8.1 Test Medical Professional theme on mobile viewport (<768px)
- [ ] 8.2 Test Dark Laboratory theme on mobile viewport (<768px)
- [ ] 8.3 Verify theme selector grid layout is responsive (1 column on mobile)
- [ ] 8.4 Test theme switching on mobile devices without layout shift
- [ ] 8.5 Verify font scaling and readability on small screens
- [ ] 8.6 Test glow effects performance on mobile devices

## 9. Verify Accessibility Compliance
- [ ] 9.1 Run contrast checker on Medical Professional theme (WCAG AA)
  - [ ] 9.1.1 Verify text-to-background contrast ratios
  - [ ] 9.1.2 Verify interactive element contrast ratios
- [ ] 9.2 Run contrast checker on Dark Laboratory theme (WCAG AAA)
  - [ ] 9.2.1 Verify phosphorescent green text readability
  - [ ] 9.2.2 Verify all text meets 7:1 contrast ratio
- [ ] 9.3 Test focus indicators visibility in both themes
- [ ] 9.4 Test browser zoom up to 200% in both themes
- [ ] 9.5 Verify keyboard navigation works correctly

## 10. Test Component Style Consistency
- [ ] 10.1 Test button styles in Medical Professional theme (neumorphic)
- [ ] 10.2 Test button styles in Dark Laboratory theme (glass with glow)
- [ ] 10.3 Test input field styles in both themes
- [ ] 10.4 Test card styles in both themes
- [ ] 10.5 Test hover and active states for interactive components
- [ ] 10.6 Verify all components use theme CSS variables correctly

## 11. Implement Typography Loading
- [ ] 11.1 Add Roboto font loading for Medical Professional theme
  - [ ] 11.1.1 Add Google Fonts link or configure font fallback
  - [ ] 11.1.2 Verify font-weight 400 and 600 load correctly
- [ ] 11.2 Add Source Code Pro font loading for Dark Laboratory theme
  - [ ] 11.2.1 Add Google Fonts link or configure font fallback
  - [ ] 11.2.2 Verify font-weight 400 and 700 load correctly
- [ ] 11.3 Verify font loading doesn't block initial render
- [ ] 11.4 Test font rendering and readability in both themes

## 12. Performance Testing and Optimization
- [ ] 12.1 Measure theme switching performance (<50ms for CSS variable updates)
- [ ] 12.2 Verify no unnecessary component re-renders during theme change
- [ ] 12.3 Test CSS variable batching and DOM operation optimization
- [ ] 12.4 Measure bundle size increase (should be <2KB per theme)
- [ ] 12.5 Run Lighthouse performance audit with new themes
- [ ] 12.6 Verify 60fps maintained during theme transitions

## 13. Integration Testing
- [ ] 13.1 Test theme persistence across browser sessions
- [ ] 13.2 Test user-specific theme preferences for logged-in users
- [ ] 13.3 Test theme reversion on logout
- [ ] 13.4 Test theme selection from Account page
- [ ] 13.5 Test theme selection from mobile Settings page
- [ ] 13.6 Verify theme applies correctly on application startup

## 14. Cross-Browser Testing
- [ ] 14.1 Test Medical Professional theme on Chrome, Firefox, Safari, Edge
- [ ] 14.2 Test Dark Laboratory theme on Chrome, Firefox, Safari, Edge
- [ ] 14.3 Verify CSS variable support and fallbacks
- [ ] 14.4 Test font rendering across browsers
- [ ] 14.5 Verify glow effects render correctly across browsers

## 15. Documentation and Code Review
- [ ] 15.1 Add inline comments explaining theme structure
- [ ] 15.2 Document color palette choices and accessibility considerations
- [ ] 15.3 Update README or documentation with new theme information
- [ ] 15.4 Code review for type safety and best practices
- [ ] 15.5 Verify no console errors or warnings
