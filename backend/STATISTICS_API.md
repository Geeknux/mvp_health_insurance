# Statistics API Documentation

Comprehensive statistics endpoints for dashboard analytics and reporting.

## Base URL
```
/api/v1/statistics
```

## Authentication
All endpoints require JWT authentication via Bearer token in the Authorization header.

---

## Admin Endpoints

### 1. Overview Statistics
Get high-level overview statistics for admin dashboard.

**Endpoint**: `GET /api/v1/statistics/admin/overview`

**Auth**: Admin only

**Response**:
```json
{
  "total_users": 54,
  "total_admins": 4,
  "total_regular_users": 50,
  "total_persons": 120,
  "total_registrations": 65,
  "total_schools": 93,
  "total_plans": 3,
  "active_registrations": 15,
  "pending_registrations": 12
}
```

---

### 2. Registration Statistics
Detailed statistics about insurance registrations.

**Endpoint**: `GET /api/v1/statistics/admin/registrations`

**Auth**: Admin only

**Response**:
```json
{
  "total": 65,
  "pending": 12,
  "approved": 10,
  "rejected": 8,
  "active": 15,
  "expired": 20,
  "by_plan": [
    {
      "plan_id": "uuid",
      "plan_name": "بیمه پایه",
      "count": 25
    },
    {
      "plan_id": "uuid",
      "plan_name": "بیمه استاندارد",
      "count": 22
    },
    {
      "plan_id": "uuid",
      "plan_name": "بیمه ویژه",
      "count": 18
    }
  ],
  "by_month": [
    {
      "month": "2025-04",
      "month_name": "April 2025",
      "count": 8
    },
    {
      "month": "2025-05",
      "month_name": "May 2025",
      "count": 12
    },
    {
      "month": "2025-06",
      "month_name": "June 2025",
      "count": 15
    }
  ],
  "recent_registrations": 18
}
```

**Use Cases**:
- Display registration trends over time
- Show plan popularity
- Monitor pending approvals
- Track monthly growth

---

### 3. Person/Dependent Statistics
Statistics about persons (family members).

**Endpoint**: `GET /api/v1/statistics/admin/persons`

**Auth**: Admin only

**Response**:
```json
{
  "total": 120,
  "by_relation": {
    "spouse": 18,
    "child": 52,
    "parent": 25,
    "sibling": 15,
    "other": 10
  },
  "average_per_user": 2.4,
  "age_distribution": {
    "0-10": 25,
    "11-20": 30,
    "21-30": 20,
    "31-40": 18,
    "41-50": 15,
    "51+": 12
  }
}
```

**Use Cases**:
- Understand family structure
- Plan coverage needs
- Demographic analysis

---

### 4. School Statistics
Statistics about schools in the system.

**Endpoint**: `GET /api/v1/statistics/admin/schools`

**Auth**: Admin only

**Response**:
```json
{
  "total": 93,
  "by_type": {
    "elementary": 45,
    "middle": 28,
    "high": 20
  },
  "by_state": [
    {
      "state_id": "uuid",
      "state_name": "تهران",
      "count": 75
    },
    {
      "state_id": "uuid",
      "state_name": "اصفهان",
      "count": 18
    }
  ],
  "top_schools": [
    {
      "school_id": "uuid",
      "school_name": "دبستان شهید بهشتی",
      "school_type": "elementary",
      "registration_count": 15
    }
  ]
}
```

**Use Cases**:
- Identify popular schools
- Geographic distribution
- School type analysis

---

### 5. Insurance Plan Statistics
Statistics about insurance plans.

**Endpoint**: `GET /api/v1/statistics/admin/plans`

**Auth**: Admin only

**Response**:
```json
{
  "total": 3,
  "active": 3,
  "inactive": 0,
  "by_type": {
    "basic": 1,
    "standard": 1,
    "premium": 1
  },
  "popularity": [
    {
      "plan_id": "uuid",
      "plan_name": "بیمه پایه",
      "plan_type": "basic",
      "registration_count": 25,
      "monthly_premium": 500000.0
    },
    {
      "plan_id": "uuid",
      "plan_name": "بیمه استاندارد",
      "plan_type": "standard",
      "registration_count": 22,
      "monthly_premium": 800000.0
    }
  ],
  "average_premium": 833333.33
}
```

**Use Cases**:
- Plan performance analysis
- Pricing insights
- Popularity trends

---

### 6. User Statistics
Statistics about system users.

**Endpoint**: `GET /api/v1/statistics/admin/users`

**Auth**: Admin only

**Response**:
```json
{
  "total": 54,
  "admins": 4,
  "regular": 50,
  "with_registrations": 35,
  "without_registrations": 19,
  "recent_signups": 8
}
```

**Use Cases**:
- User growth tracking
- Engagement analysis
- Admin vs regular user ratio

---

### 7. Complete Dashboard Statistics
Get all statistics in a single call (optimized for dashboard loading).

**Endpoint**: `GET /api/v1/statistics/admin/dashboard`

**Auth**: Admin only

**Response**:
```json
{
  "overview": { /* OverviewStats */ },
  "registrations": { /* RegistrationStats */ },
  "persons": { /* PersonStats */ },
  "schools": { /* SchoolStats */ },
  "plans": { /* PlanStats */ },
  "users": { /* UserStats */ }
}
```

**Use Cases**:
- Single API call for complete dashboard
- Reduced network requests
- Faster page load

---

## User Endpoints

### 8. User Overview Statistics
Get overview statistics for regular user dashboard.

**Endpoint**: `GET /api/v1/statistics/user/overview`

**Auth**: Regular user

**Response**:
```json
{
  "total_registrations": 2,
  "active_registrations": 1,
  "pending_registrations": 1,
  "total_persons": 3,
  "available_plans": 3,
  "user_info": {
    "name": "علی احمدی",
    "email": "ali.ahmadi@example.com",
    "national_id": "1234567890"
  }
}
```

---

### 9. User Registration Statistics
Get user's own registration statistics.

**Endpoint**: `GET /api/v1/statistics/user/registrations`

**Auth**: Regular user

**Response**:
```json
{
  "total": 2,
  "by_status": {
    "pending": 1,
    "approved": 0,
    "rejected": 0,
    "active": 1,
    "expired": 0
  },
  "by_plan": [
    {
      "registration_id": "uuid",
      "plan_name": "بیمه پایه",
      "status": "active",
      "start_date": "2025-01-01",
      "end_date": "2026-01-01"
    }
  ]
}
```

---

### 10. User Person Statistics
Get statistics about user's family members.

**Endpoint**: `GET /api/v1/statistics/user/persons`

**Auth**: Regular user

**Response**:
```json
{
  "total": 3,
  "by_relation": {
    "spouse": 1,
    "child": 2,
    "parent": 0,
    "sibling": 0,
    "other": 0
  },
  "age_groups": {
    "children": 2,
    "adults": 1,
    "seniors": 0
  }
}
```

---

## Usage Examples

### Frontend Integration

#### React/Next.js Example
```typescript
// Fetch admin dashboard stats
const fetchDashboardStats = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/statistics/admin/dashboard`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data;
};

// Fetch user overview
const fetchUserOverview = async () => {
  const token = localStorage.getItem('access_token');
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/statistics/user/overview`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  const data = await response.json();
  return data;
};
```

#### Chart Integration Example
```typescript
// Registration trend chart
const registrationStats = await fetch('/api/v1/statistics/admin/registrations');
const chartData = registrationStats.by_month.map(item => ({
  x: item.month_name,
  y: item.count
}));
```

---

## Performance Notes

1. **Caching**: Consider caching statistics for 5-15 minutes
2. **Pagination**: Top lists are limited to 10 items
3. **Date Range**: Monthly data covers last 6 months
4. **Optimization**: Use `/admin/dashboard` for single-call loading

---

## Error Responses

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Statistics endpoints are rate-limited to prevent abuse:
- **Admin endpoints**: 100 requests per minute
- **User endpoints**: 60 requests per minute

---

## Best Practices

1. **Cache Results**: Statistics don't change frequently
2. **Use Dashboard Endpoint**: Single call for admin dashboard
3. **Progressive Loading**: Load critical stats first
4. **Error Handling**: Always handle network errors
5. **Loading States**: Show loading indicators
6. **Refresh Strategy**: Auto-refresh every 5-10 minutes

---

## Testing

### cURL Examples

```bash
# Admin overview
curl -X GET "http://localhost:8000/api/v1/statistics/admin/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# User overview
curl -X GET "http://localhost:8000/api/v1/statistics/user/overview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Complete dashboard
curl -X GET "http://localhost:8000/api/v1/statistics/admin/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Changelog

### Version 1.0.0 (2025-10-07)
- Initial release
- Admin statistics endpoints
- User statistics endpoints
- Complete dashboard endpoint
- Registration trends
- Person demographics
- School analytics
- Plan performance metrics
