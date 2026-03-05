export const specialAdmins: string[] = []; // Liste vidée - Le contrôle d'accès doit utiliser les rôles Supabase ou Profil

export const studentAccounts = ['trinity.banos@gmail.com', 'trinity@ols.com'];

export interface UserSubscription {
    status: string;
    planType: string;
    modules: string | string[];
}

export interface UserProfile {
    username?: string;
    email?: string;
    role?: string;
    organizationId?: string;
    subscription?: UserSubscription;
    hiddenTools?: string[];
}

export const getAccessData = (currentUser: string | null) => {
    if (!currentUser) return { profile: null, sub: null, hiddenTools: [] };

    // Si currentUser est un objet JSON, extraire l'email
    let email = currentUser;
    try {
        const parsed = JSON.parse(currentUser);
        if (parsed && parsed.email) {
            email = parsed.email;
        }
    } catch (e) {
        // currentUser est déjà une string simple, ou corrompu
        // Si c'est corrompu et ne peut pas être parsé, on retourne vide
        if (currentUser.startsWith('{') || currentUser.startsWith('[')) {
            console.error('Corrupted currentUser in localStorage, clearing...');
            localStorage.removeItem('currentUser');
            return { profile: null, sub: null, hiddenTools: [] };
        }
    }

    const normalizedEmail = email.toLowerCase().trim();
    const profileStr = localStorage.getItem(`user_profile_${normalizedEmail}`);
    if (!profileStr) return { profile: null, sub: null, hiddenTools: [] };

    try {
        const profile: UserProfile = JSON.parse(profileStr);
        return {
            profile,
            sub: profile.subscription,
            hiddenTools: profile.hiddenTools || []
        };
    } catch (e) {
        console.error('Error parsing user profile, clearing corrupted data...');
        localStorage.removeItem(`user_profile_${normalizedEmail}`);
        return { profile: null, sub: null, hiddenTools: [] };
    }
};

export const checkHasAccess = (moduleId: string, currentUser: string | null, sub: UserSubscription | undefined, hiddenTools: string[], currentUserRole?: string | null) => {
    const normalizedUser = currentUser?.toLowerCase().trim() || '';

    // Check if user is super admin via parameter or fallback to localStorage
    const role = currentUserRole || localStorage.getItem('currentUserRole');
    if (role === 'super_admin') return true;

    // Special Admins have access to everything
    if (normalizedUser && specialAdmins.some(admin => admin.toLowerCase().trim() === normalizedUser)) return true;

    // Students have access to everything except budget and admin
    if (normalizedUser && studentAccounts.some(student => student.toLowerCase().trim() === normalizedUser)) {
        if (moduleId === 'budget' || moduleId === 'admin') return false;
        return true;
    }

    // 'any' modules are always accessible
    if (moduleId === 'any') return true;

    // Hide if user explicitly hid it in settings
    if (hiddenTools.includes(moduleId)) return false;

    if (!sub) return false;

    // Full pack has access to everything
    if (sub.planType === 'full' || sub.modules === 'all') return true;

    // Category mapping
    const coreModules = ['messaging', 'planning', 'projects', 'inventory', 'tableur', 'meetings', 'it_archive'];
    const labModules = ['culture', 'research', 'mimir', 'bibliography', 'notebook', 'stock', 'cryo', 'equip', 'budget', 'sop', 'safety'];
    const analysisModules = ['biotools', 'sequence', 'colony', 'flow', 'spectrum', 'gel', 'phylo', 'molecules', 'kinetics', 'plates', 'mixer', 'primers', 'cells', 'colony'];

    const userModules = Array.isArray(sub.modules) ? sub.modules : [];

    if (coreModules.includes(moduleId)) return userModules.includes('hugin_core');
    if (labModules.includes(moduleId)) return userModules.includes('hugin_lab');
    if (analysisModules.includes(moduleId)) return userModules.includes('hugin_analysis');

    // Default for advanced modules or unknown ones
    return userModules.includes('hugin_lab');
};
