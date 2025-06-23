import { UserModel } from '../models/UserModel';


export const AuthController = {
    login(username, password) {
        const users = [
            {
                username: 'admin',
                password: 'admin123',
                role: 'administrator'
            }
        ];

        const found = users.find(
            user => user.username === username && user.password === password
        );

        if (found) {
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