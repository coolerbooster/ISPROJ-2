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
            'admin',
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
    }
};