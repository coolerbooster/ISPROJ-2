export const AuthController = {
    logout() {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('jwt_token');
        }
    },

    isAuthenticated() {
        if (typeof window === 'undefined') return false;
        return !!sessionStorage.getItem('jwt_token');
    }
};
