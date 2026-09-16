# SQL Scanner

Bản chạy được trên Node.js 6, không cần `npm install`. Khi chép tool, chép cả `sql-scanner.js` và thư mục `rule`.

## Chạy

```powershell
node .\sql-scanner.js D:\du-an-java
```

Đầu vào là path tới thư mục source. Kết quả mặc định ghi vào `sql-review.csv`:

```text
file,line,type,match,review
"src\\UserDao.java","42","sql","SELECT ...","FETCH FIRST -> review LIMIT"
```

Có thể đặt tên file CSV riêng:

```powershell
node .\sql-scanner.js D:\du-an-java D:\reports\db2-review.csv
```

Scanner quét `.java`, `.sql`, `.xml`, `.properties`, `.yml`, `.yaml`; bỏ qua `.git`, `target`, `build`, `out`, `node_modules`.

Rule nằm trong:

- `rule/db2-function.json`: hàm DB2;
- `rule/db2-syntax.json`: cú pháp DB2 trong SQL;
- `rule/db2-config.json`: URL, driver và cấu hình DB2.

Muốn thêm rule, thêm một object có dạng `{"pattern":"...","review":"..."}` vào file JSON tương ứng. Pattern dùng cú pháp RegExp của JavaScript.
