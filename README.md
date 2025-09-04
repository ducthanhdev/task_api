# 📌 Task API – NestJS + MongoDB

## 🎯 Mục tiêu

Ứng dụng mẫu để **nghiên cứu và triển khai API RESTful** với [NestJS](https://nestjs.com/) theo mô hình **MVC**.  
Hệ thống quản lý **Task** (nhiệm vụ) gồm các trường:

- `id` (UUID)
- `title` (string, bắt buộc)
- `description` (string)
- `status` (enum: `"To Do" | "In Progress" | "Done"`)
- `createdAt` (datetime)

---

## 🏗️ Kiến trúc

Ứng dụng được tổ chức theo mô hình **MVC**:

- **Model**: Định nghĩa schema Task bằng Mongoose (`task.schema.ts`)
- **Controller**: Xử lý HTTP request (`tasks.controller.ts`)
- **Service**: Chứa nghiệp vụ CRUD (`tasks.service.ts`)
- **Module**: Đăng ký schema, controller, service (`tasks.module.ts`)

Thư mục chính:

```
src
├─ app.module.ts
├─ main.ts
└─ tasks
   ├─ tasks.module.ts
   ├─ tasks.controller.ts
   ├─ tasks.service.ts
   ├─ schemas
   │   └─ task.schema.ts
   └─ dto
       ├─ create-task.dto.ts
       └─ update-task.dto.ts
```

---

## ⚙️ Cài đặt & chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Tạo file `.env`

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_api
```

### 3. Chạy server

```bash
npm run start:dev
```

Ứng dụng sẽ chạy tại:  
👉 `http://localhost:3000`

Tài liệu Swagger (OpenAPI) tại:  
👉 `http://localhost:3000/docs`

---

## 🚀 API Endpoints

| Method | Endpoint     | Mô tả                                               |
| ------ | ------------ | --------------------------------------------------- |
| POST   | `/tasks`     | Tạo task mới                                        |
| GET    | `/tasks`     | Lấy danh sách task (có phân trang, lọc theo status) |
| GET    | `/tasks/:id` | Lấy chi tiết task theo id                           |
| PATCH  | `/tasks/:id` | Cập nhật task                                       |
| DELETE | `/tasks/:id` | Xóa task                                            |

### Ví dụ cURL

```bash
# Tạo mới
curl -X POST http://localhost:3000/tasks   -H "Content-Type: application/json"   -d '{"title":"Viết unit test","description":"ít nhất 1 test"}'

# Lấy danh sách (100 bản ghi, lọc status)
curl "http://localhost:3000/tasks?page=1&limit=100&status=To%20Do"

# Lấy theo id
curl http://localhost:3000/tasks/<id>

# Cập nhật
curl -X PATCH http://localhost:3000/tasks/<id>   -H "Content-Type: application/json"   -d '{"status":"Done"}'

# Xóa
curl -X DELETE http://localhost:3000/tasks/<id>
```

---

## ✅ Unit Test

Dự án có **unit test (Jest)** cho `TasksService` với **mock Mongoose Model**.

Chạy test:

```bash
npm run test
```

Kết quả ví dụ:

```
PASS  src/tasks/tasks.service.spec.ts
  TasksService
    ✓ findAll trả danh sách rỗng & tổng 0
    ✓ update trả về bản ghi đã cập nhật
```

---

## 🔧 Tối ưu hiệu năng

- Sử dụng `.lean()` khi truy vấn Mongoose (giảm overhead).
- Thêm **index** `{ status: 1, createdAt: -1 }` cho schema.
- Hỗ trợ phân trang & lọc status trong API `GET /tasks`.
- Đảm bảo trả về 100 bản ghi < 200ms trên DB local.

---

## 📘 Tài liệu kỹ thuật

- **NestJS**: Modules, Controllers, Services, Dependency Injection
- **Mongoose**: Schema, Model, CRUD
- **Validation**: `class-validator`, `ValidationPipe`
- **Swagger (OpenAPI)**: mô tả API tại `/docs`
- **Jest**: viết unit test cho Service

---
