import {
    createUserAsAdmin,
    listUsersAdmin,
    deleteUserAdmin,
    getUserDetailAdmin,
    updateUserPasswordAdmin // ✅ You must create this in your API
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
        return response.users || [];
    },

    async searchAdmins(query) {
        const response = await listUsersAdmin(1, 100, query);
        return response.users || [];
    },

    async deleteAdmin(userId) {
        return await deleteUserAdmin(userId);
    },

    async getAdminById(userId) {
        return await getUserDetailAdmin(userId);
    },

    async updateAdminPassword(userId, newPassword) {
        return await updateUserPasswordAdmin(userId, newPassword);
    }
};