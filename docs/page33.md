[Previous](./page32.md)

# Phase 4 Refinement: API Integration Hardening

**Date:** January 24, 2026<br>
**Status:** Completed ✅

Following a code review of `store/useGroupStore.ts`, we have identified critical issues in how the frontend communicates with the backend API. This document outlines the plan to harden these integrations to ensure reliability and better user feedback.

## 1. Identified Issues

### A. Missing Content-Type Headers
**Severity:** Critical 🔴<br>
**Description:**<br>
The `fetch` calls for `POST` and `PATCH` requests in `useGroupStore.ts` are sending JSON bodies (`JSON.stringify`) but fail to include the `Content-Type: application/json` header.<br>
**Impact:**<br>
Most backend frameworks (including Next.js API Routes) will fail to parse the request body, leading to empty payloads and `500` or `400` errors.

### B. Generic Error Handling
**Severity:** Moderate ⚠️<br>
**Description:**<br>
When an API call fails (e.g., `res.ok` is false), the store simply displays a generic toast: `"Failed to [action]"`.<br>
**Impact:**<br>
Users (and developers) do not see the specific reason for the failure (e.g., "Insufficient funds", "User not found", "Unauthorized").

## 2. Refactoring Plan

We will refactor `store/useGroupStore.ts` to implement the following improvements.

### Step 1: Centralized Headers
Ensure every state-modifying request includes the correct headers.

```typescript
// Pattern to apply
const res = await fetch('/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }, // <-- MISSING
  body: JSON.stringify(data),
});
```

### Step 2: Improved Error Parsing
Instead of just checking `res.ok`, we will attempt to parse the error message sent by the server.

```typescript
// Pattern to apply
if (!res.ok) {
  const errorData = await res.json().catch(() => ({})); // Safe parse
  const errorMessage = errorData.error || 'Operation failed';
  toast.error(errorMessage);
  return; // Stop execution
}
```

## 3. Execution Checklist

- [x] Update `approveLoan` to include headers and error parsing.
- [x] Update `rejectLoan` to include headers and error parsing.
- [x] Update `addTransaction` to include headers and error parsing.
- [x] Update `requestLoan` to include headers and error parsing.
- [x] Update `repayLoan` to include headers and error parsing.
- [x] Update `convertToAutoLoan` to include headers and error parsing.
- [x] Update `rolloverLoan` to include headers and error parsing.
- [x] Update `setShareValue` to include headers and error parsing.
- [x] Update `updateMemberShares` to include headers and error parsing.

[Next Page](./page34.md)

[Previous](./page32.md)
