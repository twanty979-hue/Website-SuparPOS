---
name: nextjs-api-routes
description: Apply when building API endpoints in Next.js App Router using Route Handlers.
---

# Next.js API Routes (Route Handlers)

This skill provides guidelines and patterns for building secure, scalable, and high-performance API endpoints in Next.js using the App Router Route Handlers.

---

## 🔗 Project Context & Architecture
* **Backend API:** Next.js App Router API (`C:\Users\Por Woodden\Desktop\foodscan\suparpos`)
* **Client App:** FoodScan Flutter Mobile App (`C:\Users\Por Woodden\Desktop\foodscanapp`)
* **Database / ORM:** Typically Prisma or standard DB integration inside `suparpos`.

---

## When to Use
Apply when building or refactoring API endpoints in Next.js under the App Router framework (`app/api/...`) to serve requests from the `foodscanapp` Flutter client.

---

## Code Patterns

### Pattern 1: Basic Route Handler
```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const users = await db.users.findMany();
  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const user = await db.users.create({ data: body });
  return NextResponse.json(user, { status: 201 });
}
```

### Pattern 2: Dynamic Route Parameters
```typescript
// app/api/users/[id]/route.ts
interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const user = await db.users.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  return NextResponse.json(user);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  await db.users.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
```

### Pattern 3: Query Parameters & Headers
```typescript
export async function GET(request: NextRequest) {
  // Query params
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');

  // Headers
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const data = await db.items.findMany({
    skip: (page - 1) * limit,
    take: limit,
  });

  return NextResponse.json({ data, page, limit });
}
```

### Pattern 4: Error Handling & Validation
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation using Zod
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const item = await db.items.create({ data: result.data });
    return NextResponse.json(item, { status: 201 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Pattern 5: CORS Headers
```typescript
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

---

## Anti-Patterns to Avoid
* ❌ **Business logic in route handlers:** Extract business logic to a dedicated service layer or use-case controllers.
* ❌ **No error handling:** Always wrap Route Handlers in try/catch to return standard JSON error structures instead of raw HTML crashes.
* ❌ **Returning errors as 200 OK:** Always return standard HTTP error status codes (400, 401, 403, 404, 500) where appropriate.
* ❌ **No input validation:** Never trust client parameters directly; validate request body formats using Zod schema verification.
