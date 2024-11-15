## 1. Install Supabase CLI if you haven't already

```bash curl -Ls <https://cli.supabase.com/install.sh> | sh
```

## 2. Login to Supabase

```bash
supabase login
```

## 3. Initialize your project using your project ID

### Replace YOUR_PROJECT_ID with your actual project ID from Supabase dashboard

```bash
supabase init
```

## 4. Link your project

```bash
supabase link --project-ref YOUR_PROJECT_ID
```

## 5. Optional: Pull current database schema

```bash
supabase db pull
```

## 6. Start Supabase locally

```bash
supabase start
```

## Other useful commands

### Stop Supabase

```bash
supabase stop
```

### Check status

```bash
supabase status
```

### Reset local database

```bash
supabase db reset
```

### Push local schema changes to remote

```bash
supabase db push
```

### Generate types based on your database schema

```bash
supabase gen types typescript --local > types/supabase.ts

```
