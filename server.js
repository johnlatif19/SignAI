const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// قراءة قاعدة البيانات
let signsData = [];
try {
  const data = fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8');
  signsData = JSON.parse(data).signs;
  console.log(`✅ تم تحميل ${signsData.length} إشارة`);
} catch (error) {
  console.error('❌ خطأ في تحميل البيانات:', error);
  signsData = [];
}

// API Routes
app.get('/api/signs', (req, res) => {
  res.json(signsData);
});

app.get('/api/signs/:id', (req, res) => {
  const sign = signsData.find(s => s.id === req.params.id);
  if (sign) {
    res.json(sign);
  } else {
    res.status(404).json({ error: 'الإشارة غير موجودة' });
  }
});

app.get('/api/search', (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  const results = signsData.filter(sign => 
    sign.name.toLowerCase().includes(query) || 
    sign.meaning.toLowerCase().includes(query)
  );
  res.json(results);
});

app.post('/api/signs', (req, res) => {
  const newSign = req.body;
  newSign.id = newSign.name.toLowerCase().replace(/\s/g, '_');
  signsData.push(newSign);
  
  // حفظ في الملف
  fs.writeFileSync(
    path.join(__dirname, 'data.json'), 
    JSON.stringify({ signs: signsData }, null, 2)
  );
  
  res.json({ success: true, sign: newSign });
});

// رفع البيانات لـ Firebase (بدون Firebase SDK)
app.post('/api/upload-to-firebase', (req, res) => {
  // هذا مجرد مثال - هتحتاج تفعيل Firebase Admin SDK
  console.log('بيانات للرفع:', req.body);
  res.json({ success: true, message: 'تم استلام البيانات' });
});

app.listen(PORT, () => {
  console.log(`🚀 السيرفر شغال على http://localhost:${PORT}`);
});
