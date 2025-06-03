import { UserModel } from '../models/UserModel';

export const AuthController = {
    login(username, password) {
        const isValid = UserModel.validateUser(username, password);

        if (isValid) {
            localStorage.setItem('isAuthenticated', 'true');
            return true;
        }

        return false;
    },

    logout() {
        localStorage.removeItem('isAuthenticated');
    },

    isAuthenticated() {
        return localStorage.getItem('isAuthenticated') === 'true';
    }
};