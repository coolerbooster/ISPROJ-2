import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    const { id } = req.query;

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        if (req.method === 'DELETE') {
            const [result] = await connection.execute(
                "DELETE FROM USERS WHERE user_id = ? AND accountType = 'admin'", [id]
            );
            res.status(200).json({ message: 'Admin deleted' });
        }

        else if (req.method === 'PUT') {
            const { firstName, lastName } = req.body;
            const [result] = await connection.execute(
                "UPDATE USERS SET firstName = ?, lastName = ?, updatedAt = NOW() WHERE user_id = ? AND accountType = 'admin'",
                [firstName, lastName, id]
            );
            res.status(200).json({ message: 'Admin updated' });
        }

        else {
            res.status(405).end();
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    } finally {
        await connection.end();
    }
}