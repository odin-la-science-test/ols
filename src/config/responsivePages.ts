/**
 * Configuration des pages avec leurs versions desktop et mobile
 * Utilisé pour le routing automatique responsive
 */

// Desktop pages
import LandingPage from '../pages/LandingPage';
import Features from '../pages/Features';
import Documentation from '../pages/Documentation';
import Pricing from '../pages/Pricing';
import Privacy from '../pages/Privacy';
import Terms from '../pages/Terms';
import Cookies from '../pages/Cookies';
import Support from '../pages/Support';

// Mobile pages
import MobileLandingPage from '../pages/mobile/LandingPage';
import MobileFeatures from '../pages/mobile/Features';
import MobileDocumentation from '../pages/mobile/Documentation';
import MobilePricing from '../pages/mobile/Pricing';
import MobilePrivacy from '../pages/mobile/Privacy';
import MobileTerms from '../pages/mobile/Terms';
import MobileCookies from '../pages/mobile/Cookies';
import MobileSupport from '../pages/mobile/Support';

export const responsivePages = {
    '/': {
        desktop: LandingPage,
        mobile: MobileLandingPage
    },
    '/features': {
        desktop: Features,
        mobile: MobileFeatures
    },
    '/documentation': {
        desktop: Documentation,
        mobile: MobileDocumentation
    },
    '/pricing': {
        desktop: Pricing,
        mobile: MobilePricing
    },
    '/privacy': {
        desktop: Privacy,
        mobile: MobilePrivacy
    },
    '/terms': {
        desktop: Terms,
        mobile: MobileTerms
    },
    '/cookies': {
        desktop: Cookies,
        mobile: MobileCookies
    },
    '/support': {
        desktop: Support,
        mobile: MobileSupport
    }
};

export type ResponsivePagePath = keyof typeof responsivePages;
