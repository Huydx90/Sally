const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Số dòng tối đa lưu trong bộ nhớ (đủ để load lại khi client mở trang mới)
const MAX_HISTORY = 500;
let history = [];

// Định dạng thời gian: yyyy-MM-dd HH:mm:ss
function nowFormatted() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Phục vụ frontend tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Middleware: chấp nhận BẤT KỲ content-type nào, đọc nguyên body dạng text
// (Sally Coach có thể gửi JSON, plain text, form-data dạng chuỗi, XML, v.v.)
app.use('/api/receive', express.text({ type: () => true, limit: '20mb' }));

app.post('/api/receive', (req, res) => {
  let raw = req.body;
  if (raw === undefined || raw === null) raw = '';
  if (typeof raw !== 'string') raw = String(raw);

  let displayData = raw;

  // Nếu là JSON hợp lệ thì format lại cho đẹp, không thì giữ nguyên text
  try {
    const parsed = JSON.parse(raw);
    displayData = JSON.stringify(parsed, null, 2);
  } catch (e) {
    // không phải JSON -> giữ nguyên raw text
  }

  const entry = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    timestamp: nowFormatted(),
    data: displayData
  };

  history.push(entry);
  if (history.length > MAX_HISTORY) history.shift();

  broadcast({ type: 'data', entry });

  res.status(200).json({ ok: true, received_at: entry.timestamp });
});

// Lấy lịch sử khi client vừa mở trang (để không bị mất dữ liệu cũ)
app.get('/api/history', (req, res) => {
  res.json(history);
});

// Xoá toàn bộ lịch sử trên server + báo cho tất cả client đang xem để họ cũng clear màn hình
app.delete('/api/history', (req, res) => {
  history = [];
  broadcast({ type: 'clear' });
  res.json({ ok: true });
});

app.get('/health', (req, res) => res.send('OK'));

function broadcast(msg) {
  const str = JSON.stringify(msg);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(str);
    }
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server dang chay tren port ${PORT}`);
});
