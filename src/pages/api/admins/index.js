import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        if (req.method === 'GET') {
            const { search } = req.query;
            let query = "SELECT user_id AS id, email FROM USERS WHERE accountType = 'admin'";
            let values = [];

            if (search) {
                query += " AND email LIKE ?";
                values.push(`%${search}%`);
            }

            const [rows] = await connection.execute(query, values);
            res.status(200).json(rows);
        }

        else if (req.method === 'POST') {
            const { email, firstName, lastName, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Missing fields" });
            }

            await connection.execute(
                "INSERT INTO USERS (email, password, accountType, createdAt, updatedAt) VALUES (?, ?, 'admin', NOW(), NOW())",
                [email, password]
            );

            res.status(201).json({ message: 'Admin created' });
        }

        else {
            res.status(405).end(); // Method Not Allowed
        }
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        await connection.end();
    }
}