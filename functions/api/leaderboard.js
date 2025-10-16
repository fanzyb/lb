import { MongoClient } from 'mongodb';

// Ambil MONGODB_URI dari Environment Variables
// Pages Functions menggunakan `env` untuk mengakses binding/variables
const MONGODB_URI = globalThis.process.env.MONGODB_URI; 

const dbName = 'discord_db'; // GANTI dengan nama database Anda
const collectionName = 'leaderboard_xp'; // GANTI dengan nama koleksi XP Anda

export async function onRequest() {
    // 1. CORS Headers (PENTING untuk Frontend)
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Izinkan Frontend Pages
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (!MONGODB_URI) {
        return new Response(JSON.stringify({ success: false, message: 'MONGODB_URI not configured.' }), { status: 500, headers });
    }

    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);

        // 2. Query Data Leaderboard XP
        const leaderboardData = await collection
            .find({})
            .sort({ xp: -1 })
            .limit(50)
            .toArray();

        // 3. Format data
        const formattedLeaderboard = leaderboardData.map((item, index) => ({
            rank: index + 1,
            username: item.username || `User #${String(item._id).slice(-6)}`, 
            xp: item.xp,
        }));

        // 4. Kirim respon sukses
        return new Response(JSON.stringify({ success: true, leaderboard: formattedLeaderboard }), { status: 200, headers });

    } catch (error) {
        console.error("MongoDB Error:", error);
        return new Response(JSON.stringify({ success: false, message: "Failed to fetch leaderboard data." }), { status: 500, headers });
    } finally {
        await client.close(); 
    }
}
