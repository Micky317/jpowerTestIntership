# Estimate Setup Utility

Utility functions to create clients with multiple estimates for testing purposes, especially useful for booking tests.

## 📁 Location
`utils/data/estimate.ts`

## 🎯 Purpose
Create test data (clients, properties, and estimates) quickly and consistently for booking and other integration tests.

## 📚 Available Functions

### 1. `createClientForEstimates(page, clientName)`
Creates a new client with billing contact.

```typescript
const clientData = await createClientForEstimates(page, 'Test Client');
```

### 2. `addPropertyToClient(page, clientName, route?)`
Adds a property to an existing client.

```typescript
const property = await addPropertyToClient(page, 'Test Client', '1000');
```

### 3. `createLandscapeEstimate(page, clientName, contactName?)`
Creates a Landscape Maintenance estimate for a client.

```typescript
const estimate = await createLandscapeEstimate(page, 'Test Client', 'John Doe');
```

### 4. `createWorkOrderEstimate(page, clientName, contactName?)`
Creates a Work Order estimate for a client.

```typescript
const estimate = await createWorkOrderEstimate(page, 'Test Client', 'Jane Smith');
```

### 5. `setupClientWithEstimates(page, clientName, options?)` ⭐
**All-in-one function** - Creates client, properties, and multiple estimates.

```typescript
const data = await setupClientWithEstimates(page, 'Booking Test Client', {
  numProperties: 2,
  createLandscape: true,
  createWorkOrder: true,
  numLandscapeEstimates: 2,
  numWorkOrderEstimates: 1,
});
```

## 🔧 Options for `setupClientWithEstimates`

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `numProperties` | number | 1 | Number of properties to create |
| `createLandscape` | boolean | true | Whether to create Landscape estimates |
| `createWorkOrder` | boolean | true | Whether to create Work Order estimates |
| `numLandscapeEstimates` | number | 1 | Number of Landscape estimates |
| `numWorkOrderEstimates` | number | 1 | Number of Work Order estimates |

## 📝 Example Usage

### Basic Setup (1 client, 1 property, 1 of each estimate)
```typescript
import { setupClientWithEstimates } from '@/utils/data/estimate';

test("Setup test data", async ({ page }) => {
  await signIn(page);
  
  const data = await setupClientWithEstimates(page, 'My Test Client');
  
  // data contains:
  // - data.client (client info)
  // - data.properties (array of properties)
  // - data.landscapeEstimates (array of Landscape estimates)
  // - data.workOrderEstimates (array of Work Order estimates)
});
```

### Advanced Setup (Multiple properties and estimates)
```typescript
test("Setup complex test data for booking", async ({ page }) => {
  await signIn(page);
  
  const data = await setupClientWithEstimates(page, 'Booking Test Client', {
    numProperties: 3,              // 3 properties
    createLandscape: true,
    createWorkOrder: true,
    numLandscapeEstimates: 2,      // 2 Landscape estimates
    numWorkOrderEstimates: 2,      // 2 Work Order estimates
  });
  
  console.log(`Created ${data.properties.length} properties`);
  console.log(`Created ${data.landscapeEstimates.length} Landscape estimates`);
  console.log(`Created ${data.workOrderEstimates.length} Work Order estimates`);
});
```

### Only Landscape Estimates
```typescript
const data = await setupClientWithEstimates(page, 'Landscape Only Client', {
  numProperties: 2,
  createLandscape: true,
  createWorkOrder: false,          // Skip Work Order
  numLandscapeEstimates: 3,
});
```

### Manual Step-by-Step Setup
```typescript
import {
  createClientForEstimates,
  addPropertyToClient,
  createLandscapeEstimate,
  createWorkOrderEstimate
} from '@/utils/data/estimate';

test("Manual setup", async ({ page }) => {
  await signIn(page);
  
  // Step 1: Create client
  const client = await createClientForEstimates(page, 'Manual Test Client');
  
  // Step 2: Add properties
  await addPropertyToClient(page, 'Manual Test Client', '1000');
  await addPropertyToClient(page, 'Manual Test Client', '2000');
  
  // Step 3: Create estimates
  await createLandscapeEstimate(page, 'Manual Test Client', 'Contact 1');
  await createWorkOrderEstimate(page, 'Manual Test Client', 'Contact 2');
});
```

## 🎯 Use Cases

### For Booking Tests
```typescript
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await signIn(page);
  
  // Create test data for booking
  await setupClientWithEstimates(page, 'Booking Test Client', {
    numProperties: 2,
    numLandscapeEstimates: 1,
    numWorkOrderEstimates: 1,
  });
  
  await page.close();
});

test("Booking functionality", async ({ page }) => {
  await page.goto('/booking');
  // Test booking with the created estimates
});
```

### For Estimate Tests
```typescript
test("Test estimate workflow", async ({ page }) => {
  await signIn(page);
  
  // Create just one Landscape estimate
  await createClientForEstimates(page, 'Estimate Test');
  await addPropertyToClient(page, 'Estimate Test');
  await createLandscapeEstimate(page, 'Estimate Test');
  
  // Now test the estimate
  await openEstimateForClient(page, 'Estimate Test', 'Landscape Maintenance');
});
```

## ⚠️ Important Notes

1. **Prerequisites**: Must call `signIn(page)` before using these functions
2. **Navigation**: Functions handle navigation automatically
3. **Timing**: Includes appropriate `waitForTimeout` calls
4. **Addresses**: Uses random addresses from `addresses.json`
5. **Contacts**: Uses predefined test contact data

## 🔄 Return Values

### `setupClientWithEstimates` returns:
```typescript
{
  client: {
    clientName: string;
    billingContactData: object;
  },
  properties: Array<{
    address: string;
    route: string;
  }>,
  landscapeEstimates: Array<{
    type: 'Landscape Maintenance';
    contactName: string;
  }>,
  workOrderEstimates: Array<{
    type: 'Work Order';
    contactName: string;
  }>
}
```

## 🚀 Quick Start

```typescript
import { setupClientWithEstimates } from '@/utils/data/estimate';
import { signIn } from '@/utils';

test("Quick setup", async ({ page }) => {
  await signIn(page);
  await setupClientWithEstimates(page, 'Quick Test');
  // Ready to test!
});
```
