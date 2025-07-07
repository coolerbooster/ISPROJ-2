export const AuthController = {
    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('jwt_token');
        }
    },

    isAuthenticated() {
        if (typeof window === 'undefined') return false;
        return !!localStorage.getItem('jwt_token'); // ✅ Check for actual token
    }
};