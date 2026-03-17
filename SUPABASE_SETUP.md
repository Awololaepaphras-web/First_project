
# Supabase Setup Instructions

To fully integrate this application with your Supabase project, you need to create the following tables in your Supabase SQL Editor.

## 1. Users Table
```sql
create table users (
  "id" text primary key,
  "name" text,
  "nickname" text unique,
  "email" text unique,
  "password" text,
  "university" text,
  "level" text,
  "role" text,
  "isVerified" boolean default false,
  "referralCode" text unique,
  "referredBy" text,
  "points" integer default 0,
  "referralStats" jsonb default '{"clicks": 0, "signups": 0, "withdrawals": 0, "loginStreaks": 0}'::jsonb,
  "engagementStats" jsonb,
  "status" text default 'active',
  "createdAt" bigint
);
```

## 2. Posts Table
```sql
create table posts (
  "id" text primary key,
  "userId" text references users("id"),
  "userName" text,
  "userNickname" text,
  "userUniversity" text,
  "content" text,
  "mediaUrl" text,
  "mediaType" text,
  "likes" text[] default '{}',
  "reposts" text[] default '{}',
  "stats" jsonb default '{"linkClicks": 0, "profileClicks": 0, "mediaViews": 0, "detailsExpanded": 0, "impressions": 0}'::jsonb,
  "createdAt" bigint
);
```

## 3. Documents Table
```sql
create table documents (
  "id" text primary key,
  "universityId" text,
  "courseCode" text,
  "courseTitle" text,
  "year" integer,
  "semester" text,
  "faculty" text,
  "department" text,
  "level" text,
  "description" text,
  "fileUrl" text,
  "type" text,
  "status" text,
  "uploadedBy" text references users("id"),
  "createdAt" bigint
);
```

## 4. System Config Table
```sql
create table system_config (
  "id" text primary key,
  "data" jsonb
);

-- Insert initial config
insert into system_config (id, data) values ('default', '{
  "isAiEnabled": true,
  "isUploadEnabled": true,
  "isWithdrawalEnabled": true,
  "isCommunityEnabled": true,
  "isMaintenanceMode": false,
  "earnRates": {
    "post": 10,
    "like": 2,
    "comment": 5,
    "share": 5,
    "upload": 50,
    "adView": 10,
    "adClick": 200,
    "arena": 5
  },
  "nairaPerPoint": 0.5,
  "adPricing": { "daily": 1500, "weekly": 8500, "monthly": 30000 },
  "premiumTiers": {
    "weekly": 1000,
    "monthly": 2500,
    "yearly": 20000
  },
  "paymentAccount": {
    "bankName": "Proph Institutional Bank",
    "accountNumber": "1020304050",
    "accountName": "PROPH ACADEMIC SERVICES"
  },
  "isCardPaymentEnabled": true,
  "paystackPublicKey": "pk_test_proph_academic_node_key"
}'::jsonb);
```

## 5. Security Rules (RLS)
For a quick start, you can disable RLS or add policies that allow authenticated users to read/write.
In a production app, you should define strict RLS policies.
