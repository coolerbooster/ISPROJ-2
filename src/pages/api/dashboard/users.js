import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).end();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        // Get all non-admin users
        const [users] = await connection.execute(`
      SELECT user_id, email, accountType, isPremiumUser, scanCount, createdAt FROM USERS
      WHERE accountType != 'admin'
    `);

        const today = new Date();
        const past7Days = new Date();
        past7Days.setDate(today.getDate() - 6); // include today

        // Format dates for 7-day bar chart
        const signupsByDay = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(past7Days);
            date.setDate(date.getDate() + i);
            const key = date.toISOString().split('T')[0];
            signupsByDay[key] = 0;
        }

        users.forEach(user => {
            const dateKey = new Date(user.createdAt).toISOString().split('T')[0];
            if (signupsByDay[dateKey] !== undefined) {
                signupsByDay[dateKey]++;
            }
        });

        const signupData = Object.entries(signupsByDay).map(([date, count]) => ({
            date,
            users: count,
        }));

        const freeCount = users.filter(u => !u.isPremiumUser).length;
        const premiumCount = users.filter(u => u.isPremiumUser).length;

        res.status(200).json({ users, signupData, userDistribution: [
                { name: 'Free Users', value: freeCount },
                { name: 'Premium Users', value: premiumCount }
            ] });
    } catch (err) {
        console.error('Dashboard API Error:', err);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await connection.end();
    }
}
