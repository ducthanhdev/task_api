# 📌 Task Management API

REST API quản lý Task được xây dựng với **NestJS**, **MongoDB** và **TypeScript**.

## ✨ Tính năng chính

- ✅ **CRUD Operations**: Tạo, đọc, cập nhật, xóa tasks
- ✅ **Soft Delete**: Xóa mềm và khôi phục tasks
- ✅ **Priority & Due Date**: Quản lý độ ưu tiên và hạn chót
- ✅ **Status Management**: Quản lý trạng thái với validation
- ✅ **Search & Filter**: Tìm kiếm và lọc tasks
- ✅ **Pagination**: Phân trang kết quả
- ✅ **API Documentation**: Swagger UI tự động
- ✅ **Comprehensive Testing**: Unit tests và E2E tests

---

## 🚀 Cách chạy ứng dụng

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình môi trường
Tạo file `.env`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task_api
```

### 3. Chạy ứng dụng
```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 4. Truy cập ứng dụng
- **API Base URL**: `http://localhost:3000`
- **Swagger Documentation**: `http://localhost:3000/docs`
- **Health Check**: `http://localhost:3000/health`

---

## 📚 API Documentation

### Swagger UI
Truy cập `http://localhost:3000/docs` để xem tài liệu API đầy đủ với Swagger UI.

### Các endpoint chính

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| `GET` | `/` | Hello World |
| `GET` | `/health` | Health check |
| `POST` | `/tasks` | Tạo task mới |
| `GET` | `/tasks` | Lấy danh sách tasks (có phân trang, lọc, tìm kiếm) |
| `GET` | `/tasks/:id` | Lấy chi tiết task |
| `PATCH` | `/tasks/:id` | Cập nhật task |
| `DELETE` | `/tasks/:id` | Xóa mềm task |
| `PUT` | `/tasks/:id/restore` | Khôi phục task đã xóa |
| `DELETE` | `/tasks/:id/hard` | Xóa vĩnh viễn task |

---

## 🧪 Kết quả Unit Test

### Chạy tests
```bash
# Chạy unit tests
npm run test

# Chạy với coverage
npm run test:cov

# Chạy E2E tests
npm run test:e2e
```

### Kết quả hiện tại
```
✅ Unit Tests: 27/27 PASSED (100%)
✅ E2E Tests: 16/16 PASSED (100%)
✅ Total Tests: 43/43 PASSED (100%)
✅ Coverage: 75.66%
```

### Test Coverage Breakdown
- **Controllers**: 90.9% coverage
- **Services**: 91.22% coverage  
- **DTOs**: 100% coverage
- **Schemas**: 100% coverage
- **Exception Filter**: 83.33% coverage

---

## ⚡ Hiệu năng

### Kết quả Load Test
- **Average Response Time**: 9.55ms (Target: < 200ms) ✅
- **P95 Response Time**: 58ms (Target: < 200ms) ✅
- **P99 Response Time**: 58ms (Target: < 300ms) ✅
- **Concurrent Requests**: 3.60ms/request (5 concurrent) ✅

### Tối ưu hóa
- ✅ **MongoDB Indexes**: Tối ưu cho status, priority, search, dueDate
- ✅ **Lean Queries**: Sử dụng `.lean()` để giảm overhead
- ✅ **Pagination**: Hỗ trợ phân trang hiệu quả
- ✅ **Caching Ready**: Sẵn sàng cho Redis caching

## 🛠️ Công nghệ sử dụng

- **Backend**: NestJS, TypeScript
- **Database**: MongoDB, Mongoose
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest, Supertest
- **Code Quality**: ESLint, Prettier

---

## 📁 Cấu trúc dự án

```
src/
├── app.module.ts              # Root module
├── main.ts                    # Application bootstrap
├── common/                    # Shared utilities
│   ├── constants/            # App constants
│   ├── exceptions/           # Custom exceptions
│   ├── filters/              # Global exception filter
│   ├── interfaces/           # TypeScript interfaces
│   └── types/                # Custom types
└── tasks/                    # Tasks module
    ├── dto/                  # Data Transfer Objects
    ├── schemas/              # Mongoose schemas
    ├── tasks.controller.ts   # REST endpoints
    ├── tasks.service.ts      # Business logic
    └── tasks.module.ts       # Module definition
```
