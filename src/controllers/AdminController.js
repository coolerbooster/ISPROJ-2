import {
    createUserAsAdmin,
    listUsersAdmin,
    deleteUserAdmin
} from '../services/apiService';

export const AdminController = {
    async createAdmin({ email, password }) {
        return await createUserAsAdmin(
            email,
            password,
            'Admin',
            false,
            0
        );
    },

    async getAdmins() {
        const response = await listUsersAdmin(1, 100, '');
        console.log('🧩 AdminController.getAdmins response:', response);
        const allUsers = response.users || [];
        const admins = allUsers.filter(u => u.accountType === 'Admin');
        console.log('✅ Filtered admins:', admins);
        return admins;
    },

    async searchAdmins(query) {
        const response = await listUsersAdmin(1, 100, query);
        const allUsers = response.users || [];

        return allUsers
            .filter(user => user.accountType === 'Admin')
            .map(user => ({ ...user, id: user.user_id }));
    },

    async deleteAdmin(userId) {
        return await deleteUserAdmin(userId);
    }
};