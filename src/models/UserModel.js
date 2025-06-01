// Hardcoded user data for demonstration
const users = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'administrator'
    }
];

export const UserModel = {
    validateUser: (username, password) => {
        const user = users.find(u => u.username === username && u.password === password);
        return user ? true : false;
    }
}; 