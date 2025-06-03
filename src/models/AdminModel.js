let admins = [
    {
        id: 1,
        email: 'admin@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'admin123'
    }
];

export const AdminModel = {
    getAll: () => admins,

    create: (admin) => {
        admin.id = admins.length ? admins[admins.length - 1].id + 1 : 1;
        admins.push(admin);
        return admin;
    },

    update: (id, updatedAdmin) => {
        const index = admins.findIndex(a => a.id === id);
        if (index !== -1) {
            admins[index] = { ...admins[index], ...updatedAdmin };
            return admins[index];
        }
        return null;
    },

    delete: (id) => {
        admins = admins.filter(a => a.id !== id);
    },

    search: (query) => {
        return admins.filter(a =>
            a.email.toLowerCase().includes(query.toLowerCase()) ||
            a.firstName.toLowerCase().includes(query.toLowerCase()) ||
            a.lastName.toLowerCase().includes(query.toLowerCase())
        );
    }
};