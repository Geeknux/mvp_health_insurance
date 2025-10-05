# Admin Forms Guide

## Overview
This document describes the admin entry forms available in the system for managing insurance plans, coverages, and schools.

## Available Admin Forms

### 1. Insurance Plan Entry Form
**Path**: `/admin/plans/create`  
**Access**: Admin users only  
**Backend Endpoint**: `POST /api/v1/admin/plans`

#### Features
✅ **Admin authentication check** - Redirects non-admin users  
✅ **Form validation** - Ensures premium > 0  
✅ **Success/error messages** - Clear user feedback  
✅ **Auto-redirect** - Returns to plans list after 2 seconds  
✅ **Back button** - Easy navigation to plans list  

#### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| نام طرح (Plan Name) | Text | Yes | Min 2 chars |
| نوع طرح (Plan Type) | Select | Yes | basic/standard/premium |
| توضیحات (Description) | Textarea | Yes | - |
| حق بیمه ماهانه (Monthly Premium) | Number | Yes | > 0, step 1000 |

#### Plan Types
- **پایه (basic)**: Basic insurance plan
- **استاندارد (standard)**: Standard insurance plan  
- **ویژه (premium)**: Premium insurance plan

#### Usage Example
```typescript
// Request body
{
  "name_fa": "بیمه پایه",
  "plan_type": "basic",
  "description_fa": "طرح بیمه پایه برای کارکنان",
  "monthly_premium": 500000
}

// Response
{
  "id": "uuid",
  "name_fa": "بیمه پایه",
  "plan_type": "basic",
  "description_fa": "طرح بیمه پایه برای کارکنان",
  "monthly_premium": 500000,
  "is_active": true,
  "created_at": "2025-10-05T12:00:00Z"
}
```

---

### 2. School Entry Form
**Path**: `/admin/schools/add`  
**Access**: Admin users only  
**Backend Endpoint**: `POST /api/v1/admin/schools`

#### Features
✅ **Cascading location selectors** - State → City → County → Region → District  
✅ **Empty state handling** - Shows "no data" messages  
✅ **Admin authentication check**  
✅ **Success/error messages**  
✅ **Auto-redirect** - Returns to schools list after 2 seconds  

#### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| استان (State) | Select | Yes | - |
| شهر (City) | Select | Yes | - |
| شهرستان (County) | Select | Yes | - |
| منطقه (Region) | Select | Yes | - |
| ناحیه (District) | Select | Yes | - |
| نام مدرسه (School Name) | Text | Yes | 2-200 chars |
| کد مدرسه (School Code) | Text | Yes | Max 20 chars, unique |
| نوع مدرسه (School Type) | Select | Yes | elementary/middle/high/combined |
| آدرس (Address) | Textarea | No | - |
| تلفن (Phone) | Tel | No | 11 digits |

#### School Types
- **ابتدایی (elementary)**: Elementary school
- **متوسطه اول (middle)**: Middle school
- **متوسطه دوم (high)**: High school
- **ترکیبی (combined)**: Combined school

---

### 3. Coverage Entry Form
**Path**: `/admin/coverages/create`  
**Access**: Admin users only  
**Backend Endpoint**: `POST /api/v1/admin/coverages`

#### Features
✅ **Plan selection** - Choose which plan to add coverage to  
✅ **Coverage type selection**  
✅ **Percentage and amount validation**  

#### Form Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Plan | Select | Yes | Must exist |
| Coverage Type | Select | Yes | outpatient/hospitalization/medication/etc |
| Title | Text | Yes | 2-100 chars |
| Description | Textarea | Yes | - |
| Coverage Amount | Number | Yes | > 0 |
| Coverage Percentage | Number | Yes | 0-100 |
| Max Usage Count | Number | No | - |

---

## Access Control

All admin forms check for:
1. **Valid JWT token** in localStorage
2. **Admin status** (`is_admin: true`) from `/api/v1/auth/me`

### Redirect Flow
```
User visits admin form
  ↓
Check token exists?
  ↓ No → Redirect to /login
  ↓ Yes
Check is_admin?
  ↓ No → Redirect to /dashboard
  ↓ Yes
Show form
```

---

## Navigation

### From Dashboard
- Plans: `/admin/plans` → Click "ایجاد طرح جدید"
- Schools: `/dashboard/schools` → Click "افزودن مدرسه جدید"
- Coverages: `/admin/coverages` → Click "افزودن پوشش جدید"

### Back Navigation
All forms include:
- **Back button** (top left) → Returns to list page
- **Cancel button** (bottom) → Calls `router.back()`

---

## Error Handling

### Common Errors

#### 401 Unauthorized
```json
{
  "detail": "توکن نامعتبر است"
}
```
**Action**: Redirect to login

#### 403 Forbidden
```json
{
  "detail": "شما دسترسی مدیریتی ندارید"
}
```
**Action**: Redirect to dashboard

#### 400 Bad Request
```json
{
  "detail": "مدرسه با این کد قبلاً ثبت شده است"
}
```
**Action**: Show error message in form

---

## UI/UX Patterns

### Success Messages
- **Green background** (`bg-green-50`)
- **Green border** (`border-green-200`)
- **Green text** (`text-green-800`)
- **Auto-dismiss** after 2 seconds with redirect

### Error Messages
- **Red background** (`bg-red-50`)
- **Red border** (`border-red-200`)
- **Red text** (`text-red-600`)
- **Stays visible** until form resubmission

### Loading States
- **Disabled submit button** with opacity
- **Loading text**: "در حال ایجاد..." / "در حال ثبت..."
- **Cursor**: `cursor-not-allowed`

### Required Fields
- **Red asterisk** (`text-red-500`) next to label
- **HTML5 validation** with `required` attribute

---

## Testing

### Manual Testing Checklist

#### Insurance Plan Form
- [ ] Access form as admin user
- [ ] Try accessing as non-admin (should redirect)
- [ ] Submit with all valid data
- [ ] Submit with premium = 0 (should show error)
- [ ] Submit with premium < 0 (should show error)
- [ ] Check auto-redirect after success
- [ ] Test back button navigation

#### School Form
- [ ] Access form as admin user
- [ ] Select location hierarchy step by step
- [ ] Test empty state messages (select state with no cities)
- [ ] Submit with duplicate school code (should show error)
- [ ] Submit with valid data
- [ ] Check auto-redirect after success

---

## Related Files

### Backend
- `/backend/fastapi_app/api/v1/admin.py` - Admin endpoints
- `/backend/django_app/apps/insurance/models.py` - Insurance models
- `/backend/django_app/apps/locations/models.py` - Location models

### Frontend
- `/frontend/src/app/admin/plans/create/page.tsx` - Plan form
- `/frontend/src/app/admin/plans/page.tsx` - Plans list
- `/frontend/src/app/admin/schools/add/page.tsx` - School form
- `/frontend/src/app/dashboard/schools/page.tsx` - Schools list
- `/frontend/src/app/admin/coverages/create/page.tsx` - Coverage form

---

## Future Enhancements

### Planned Features
- [ ] Edit forms for plans and schools
- [ ] Bulk import for schools (CSV upload)
- [ ] Rich text editor for descriptions
- [ ] Image upload for school photos
- [ ] Coverage templates
- [ ] Form field validation with Zod
- [ ] Toast notifications instead of alerts
- [ ] Confirmation dialogs for destructive actions
