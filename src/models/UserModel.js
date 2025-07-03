// Hardcoded user data for demonstration

const users = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'superadmin'
    }
];

export const UserModel = {
    validateUser: (username, password) => {
        const user = users.find(u => u.username === username && u.password === password);
        return !!user;
    },

    findUserByEmail: (email) => {
        return users.find(u => u.email === email);
    },

    resetPassword: (email, newPassword) => {
        const user = users.find(u => u.email === email);
        if (user) {
            user.password = newPassword;
            return true;
        }
        return false;
    }
};