export const AdminController = {
    getAdmins: async () => {
        const res = await fetch('/api/admins');
        return await res.json();
    },

    searchAdmins: async (query) => {
        const res = await fetch(`/api/admins?search=${encodeURIComponent(query)}`);
        return await res.json();
    },

    deleteAdmin: async (id) => {
        await fetch(`/api/admins/${id}`, { method: 'DELETE' });
    },

    createAdmin: async (admin) => {
        const res = await fetch('/api/admins', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(admin)
        });

        if (!res.ok) {
            const error = await res.json().catch(() => ({}));
            throw new Error(error.error || 'Failed to create admin');
        }

        return await res.json();
    },

    updateAdmin: async (id, admin) => {
        const res = await fetch(`/api/admins/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admin),
        });
        if (!res.ok) throw new Error('Failed to update admin.');
        return await res.json();
    },
};
