// controllers/AdminController.js
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
        console.log('🔍 AdminController.getAdmins()');
        const response = await listUsersAdmin(1, 100, '');
        console.log('📥 listUsersAdmin raw:', response);

        // filter on userType and map user_id → id
        const admins = (response.users || [])
            .filter(u => u.userType?.toLowerCase() === 'admin')
            .map(u => ({
                id:   u.user_id,
                email: u.email,
                // you can pass through any other props your table needs:
                // subscriptionType: u.subscriptionType,
                // scanCount:        u.scanCount,
            }));

        console.log('✅ AdminController.getAdmins →', admins);
        return admins;
    },

    async searchAdmins(query) {
        console.log('🔍 AdminController.searchAdmins()', query);
        const response = await listUsersAdmin(1, 100, query || '');
        console.log('📥 search raw:', response);

        return (response.users || [])
            .filter(u => u.userType?.toLowerCase() === 'admin')
            .map(u => ({
                id:    u.user_id,
                email: u.email
            }));
    },

    async deleteAdmin(userId) {
        return await deleteUserAdmin(userId);
    }
};
