# Sally Coach — Realtime Console

Web app nhận dữ liệu từ Sally Coach (bất kỳ định dạng nào: JSON, text, XML...) qua HTTP POST,
và hiển thị realtime trên trình duyệt dạng console log, kèm nút Clear và checkbox Auto-scroll.

## 1. Chạy thử ở máy local

```bash
npm install
npm start
```

Mở trình duyệt: http://localhost:3000

Gửi thử dữ liệu test:

```bash
curl -X POST http://localhost:3000/api/receive \
  -H "Content-Type: application/json" \
  -d '{"event":"speech_detected","text":"xin chao"}'
```

Hoặc gửi plain text:

```bash
curl -X POST http://localhost:3000/api/receive \
  -H "Content-Type: text/plain" \
  -d 'Hello from Sally Coach'
```

Dữ liệu sẽ hiện ngay lập tức trên web theo định dạng:
```
yyyy-MM-dd HH:mm:ss : <data nhận được>
```

## 2. Đưa code lên GitHub

```bash
cd sally-console
git init
git add .
git commit -m "Init Sally Coach realtime console"
git branch -M main
git remote add origin https://github.com/<username>/<ten-repo>.git
git push -u origin main
```

(Thay `<username>` và `<ten-repo>` bằng tài khoản/repo GitHub của bạn — tạo repo trống trước trên github.com)

## 3. Deploy lên Render.com

**Cách 1 — dùng file render.yaml có sẵn (Blueprint):**
1. Đăng nhập Render.com → **New** → **Blueprint**
2. Chọn repo GitHub vừa push
3. Render tự đọc `render.yaml` và tạo Web Service → bấm **Apply**

**Cách 2 — tạo thủ công:**
1. Render.com → **New** → **Web Service**
2. Connect tới repo GitHub
3. Cấu hình:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Plan:** Free (hoặc tuỳ nhu cầu)
4. Bấm **Create Web Service**

Sau khi deploy xong, Render sẽ cấp URL dạng:
```
https://sally-coach-console.onrender.com
```

## 4. Cấu hình Sally Coach gửi data về

Trỏ webhook / endpoint gửi dữ liệu của Sally Coach về:
```
POST https://<ten-app-cua-ban>.onrender.com/api/receive
```
Content-Type có thể là bất kỳ (JSON, text, form...) — server chấp nhận tất cả.

Mở URL gốc `https://<ten-app-cua-ban>.onrender.com` trên trình duyệt để xem console realtime.

## Lưu ý

- **Free plan của Render** sẽ "ngủ" sau ~15 phút không có traffic, request đầu tiên sau đó sẽ mất
  vài chục giây để "đánh thức". Nếu cần chạy 24/7 không delay, nên nâng cấp lên plan trả phí.
- Dữ liệu chỉ lưu tạm trong bộ nhớ (RAM, tối đa 500 dòng gần nhất) — khi server restart sẽ mất lịch sử.
  Nếu cần lưu vĩnh viễn, có thể bổ sung database (Postgres/Mongo) sau.
- Nút **Clear** sẽ xoá dữ liệu cho **tất cả** người đang xem cùng lúc (broadcast qua WebSocket).
- Checkbox **Auto-scroll**: bật thì tự cuộn xuống dòng mới nhất; tắt thì giữ nguyên vị trí cuộn
  hiện tại để bạn tự xem lại lịch sử.
