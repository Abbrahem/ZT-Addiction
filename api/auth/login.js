const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const clientPromise = require('../lib/mongodb');
const { seedAdmin } = require('../lib/seedAdmin');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('danger-sneakers');

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        console.log('🔐 Login attempt for:', email);

        // Seed admin if no users exist
        try {
            await seedAdmin();
        } catch (seedError) {
            console.error('Seed admin error:', seedError);
        }

        // Check both users and admins collections
        let user = await db.collection('users').findOne({ email });
        if (!user) {
            user = await db.collection('admins').findOne({ email });
        }

        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        console.log('✅ User found:', user.email);

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ message: 'بيانات الدخول غير صحيحة' });
        }

        console.log('✅ Password valid for:', email);

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role || 'admin' },
            process.env.JWT_SECRET || 'your-secret-key-here',
            { expiresIn: '7d' }
        );

        res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);
        res.status(200).json({
            message: 'تم تسجيل الدخول بنجاح',
            user: { email: user.email, role: user.role || 'admin' }
        });

        console.log('✅ Login successful for:', email);
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم', error: error.message });
    }
};
