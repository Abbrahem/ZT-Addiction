module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('👋 Logout request');
    
    res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict');
    res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
    
    console.log('✅ Logout successful');
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};
