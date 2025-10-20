# RentHub API Documentation

## Base URL
```
https://your-domain.com/api
```

## Authentication

RentHub uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Endpoints

#### Authentication

##### Login
```http
POST /auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "tenant",
    "is_verified": true,
    "is_active": true
  }
}
```

##### Refresh Token
```http
POST /auth/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

##### Get Current User
```http
GET /users/me/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "1234567890",
  "document_type": {
    "id": "uuid",
    "name": "DNI"
  },
  "document_number": "12345678",
  "role": "tenant",
  "is_verified": true,
  "is_active": true,
  "profile_photo": "/media/users/photos/..."
}
```

##### Verify Account
```http
GET /verify-account/{token}/
```

**Response:**
```json
{
  "message": "Account verified successfully"
}
```

#### Users Management

##### List Users (Admin/Superadmin only)
```http
GET /users/
Authorization: Bearer <token>
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 10)
- `role`: Filter by role (superadmin, admin, tenant)
- `is_active`: Filter by active status (true, false)

**Response:**
```json
{
  "count": 100,
  "next": "http://api/users/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "role": "tenant",
      ...
    }
  ]
}
```

##### Create User (Admin/Superadmin only)
```http
POST /users/
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securepassword123",
  "first_name": "Jane",
  "last_name": "Smith",
  "phone_number": "9876543210",
  "document_type": "uuid",
  "document_number": "87654321",
  "role": "tenant"
}
```

##### Update User
```http
PUT /users/{id}/
Authorization: Bearer <token>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith Updated",
  "phone_number": "9876543210"
}
```

##### Delete User (Superadmin only)
```http
DELETE /users/{id}/
Authorization: Bearer <token>
```

#### Contracts

##### List Contracts
```http
GET /contracts/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 50,
  "results": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "first_name": "John",
        "last_name": "Doe"
      },
      "room": {
        "id": "uuid",
        "room_number": "101",
        "building": {
          "name": "Building A"
        }
      },
      "start_date": "2024-01-01",
      "end_date": "2024-12-31",
      "rent_amount": "500.00",
      "deposit_amount": "500.00",
      "status": "active",
      "includes_wifi": true,
      "wifi_cost": "50.00"
    }
  ]
}
```

##### Create Contract (Admin/Superadmin only)
```http
POST /contracts/
Authorization: Bearer <token>
Content-Type: multipart/form-data

user: uuid
room: uuid
start_date: 2024-01-01
end_date: 2024-12-31
rent_amount: 500.00
deposit_amount: 500.00
includes_wifi: true
wifi_cost: 50.00
contract_photo: <file>
```

##### Update Contract
```http
PUT /contracts/{id}/
Authorization: Bearer <token>
```

##### Delete Contract (Superadmin only)
```http
DELETE /contracts/{id}/
Authorization: Bearer <token>
```

#### Payments

##### List Rent Payments
```http
GET /rent-payments/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 30,
  "results": [
    {
      "id": "uuid",
      "contract": {
        "id": "uuid",
        "user": {...},
        "room": {...}
      },
      "payment_date": "2024-10-01",
      "amount": "500.00",
      "payment_month": "2024-10-01",
      "status": "approved",
      "receipt_photo": "/media/payments/rent/..."
    }
  ]
}
```

##### Create Payment
```http
POST /rent-payments/
Authorization: Bearer <token>
Content-Type: multipart/form-data

contract: uuid
payment_date: 2024-10-01
amount: 500.00
payment_month: 2024-10-01
receipt_photo: <file>
```

#### Buildings & Rooms

##### List Buildings
```http
GET /buildings/
Authorization: Bearer <token>
```

##### List Rooms
```http
GET /rooms/
Authorization: Bearer <token>
```

**Response:**
```json
{
  "count": 20,
  "results": [
    {
      "id": "uuid",
      "building": {
        "id": "uuid",
        "name": "Building A",
        "address": "123 Main St"
      },
      "room_number": "101",
      "floor": 1,
      "room_type": "single",
      "is_available": true
    }
  ]
}
```

#### Laundry Bookings

##### List Bookings
```http
GET /laundry-bookings/
Authorization: Bearer <token>
```

##### Create Booking
```http
POST /laundry-bookings/
Authorization: Bearer <token>
Content-Type: application/json

{
  "booking_date": "2024-10-20",
  "time_slot": "10:00"
}
```

##### Cancel Booking
```http
DELETE /laundry-bookings/{id}/
Authorization: Bearer <token>
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Invalid input data",
  "errors": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 429 Too Many Requests
```json
{
  "detail": "Request was throttled. Expected available in X seconds."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error."
}
```

## Rate Limiting

- Login endpoint: 5 requests per minute
- General API: 100 requests per minute per user
- Failed login attempts are limited by Django Axes (5 attempts, 5 minute cooloff)

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Page number (default: 1)
- `page_size`: Results per page (default: 10, max: 100)

## File Uploads

When uploading files:
- Maximum file size: 5MB
- Allowed image formats: jpg, jpeg, png, gif
- Use `multipart/form-data` content type

## Versioning

Current API version: v1 (implicit)
Future versions will be prefixed: `/api/v2/...`

## Support

For API support, please open an issue on GitHub or contact the development team.
