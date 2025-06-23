import { AdminModel } from '../models/AdminModel';

export const AdminController = {
    getAdmins: () => AdminModel.getAll(),

    createAdmin: (admin) => {
        if (admin.password !== admin.confirmPassword) {
            throw new Error('Password and Confirm Password do not match.');
        }
        return AdminModel.create({
            email: admin.email,
            firstName: admin.firstName,
            lastName: admin.lastName,
            password: admin.password
        });
    },

    updateAdmin: (id, admin) => AdminModel.update(id, admin),

    deleteAdmin: (id) => AdminModel.delete(id),

    searchAdmins: (query) => AdminModel.search(query),

    getAdminById: (id) => {
        const admins = JSON.parse(localStorage.getItem('admins')) || [];
        return admins.find(admin => admin.id === id);
    }
};