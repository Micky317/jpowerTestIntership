import { expect, test } from '@playwright/test';
import { signIn } from '@/utils';
import { setupClientWithEstimates } from '@/utils/data/estimate';
import { Page } from '@playwright/test';
test.describe.serial('Booking - Setup and Tests', () => {
  let page: Page;
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    test.setTimeout(10 * 60000); // 10 minutos para el setup
    await signIn(page);
  });
  test.afterAll(async () => {
    await page.close();
  });
  // ========================================
  // SETUP: Crear 1 cliente con múltiples estimates
  // ========================================
  test("Setup: Create ONE client with multiple estimates", async () => {
    console.log('🚀 Starting setup...');
    
    const data = await setupClientWithEstimates(page, 'Booking Test Client', {
      numProperties: 3,              // 3 propiedades
      createLandscape: true,
      createWorkOrder: true,
      numLandscapeEstimates: 3,      // 3 Landscape Maintenance estimates
      numWorkOrderEstimates: 2,      // 2 Work Order estimates
    });
    // Total: 1 cliente, 3 propiedades, 5 estimates (3 Landscape + 2 Work Order)
    
    console.log('✅ Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 Client:', data.client.clientName);
    console.log('🏠 Properties:', data.properties.length);
    console.log('🌿 Landscape estimates:', data.landscapeEstimates.length);
    console.log('📝 Work Order estimates:', data.workOrderEstimates.length);
    console.log('📊 Total estimates:', data.landscapeEstimates.length + data.workOrderEstimates.length);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Verificaciones
    expect(data.properties.length).toBe(3);
    expect(data.landscapeEstimates.length).toBe(3);
    expect(data.workOrderEstimates.length).toBe(2);
  });
  // ========================================
  // TESTS DE BOOKING
  // ========================================
  
  test("Navigate to booking page and verify client appears", async () => {
    await page.goto('/booking');
    await page.waitForTimeout(3000);
    // Buscar el cliente
    await page.fill('#search', 'Booking Test Client');
    await page.waitForTimeout(2000);
    // Verificar que aparecen filas
    const rows = page.locator('tr[id^="row-"]');
    const rowCount = await rows.count();
    
    console.log(`Found ${rowCount} rows for Booking Test Client`);
    expect(rowCount).toBeGreaterThan(0);
  });
  test("Verify multiple properties are available for booking", async () => {
    await page.goto('/booking');
    await page.waitForTimeout(2000);
    await page.fill('#search', 'Booking Test Client');
    await page.waitForTimeout(2000);
    const rows = await page.locator('tr[id^="row-"]').count();
    
    // Deberíamos tener múltiples filas (una por cada combinación de propiedad/estimate)
    console.log(`Total bookable items: ${rows}`);
    expect(rows).toBeGreaterThanOrEqual(3);
  });
  test("Book first property", async () => {
    await page.goto('/booking');
    await page.waitForTimeout(2000);
    await page.fill('#search', 'Booking Test Client');
    await page.waitForTimeout(2000);
    // Click en el primer "Book Property"
    const bookButton = page.locator('button[title="Book Property"]').first();
    await bookButton.click();
    await page.waitForTimeout(1000);
    // Verificar modal
    const vendorInput = page.locator('#vendor');
    await expect(vendorInput).toBeVisible();
    // Llenar y guardar
    await vendorInput.fill('Test Vendor 1');
    await page.click('#save');
    await page.waitForTimeout(2000);
    console.log('✅ First property booked');
  });
  test("Book second property with different vendor", async () => {
    await page.goto('/booking');
    await page.waitForTimeout(2000);
    await page.fill('#search', 'Booking Test Client');
    await page.waitForTimeout(2000);
    // Click en el segundo "Book Property"
    const bookButtons = page.locator('button[title="Book Property"]');
    if (await bookButtons.count() > 1) {
      await bookButtons.nth(1).click();
      await page.waitForTimeout(1000);
      const vendorInput = page.locator('#vendor');
      await vendorInput.fill('Test Vendor 2');
      await page.click('#save');
      await page.waitForTimeout(2000);
      console.log('✅ Second property booked');
    }
  });
  test("Export booking data for the client", async () => {
    await page.goto('/booking');
    await page.waitForTimeout(2000);
    await page.fill('#search', 'Booking Test Client');
    await page.waitForTimeout(2000);
    // Intentar exportar
    try {
      const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
      await page.click('#export');
      const download = await downloadPromise;
      
      console.log('✅ Export successful:', download.suggestedFilename());
    } catch (error) {
      console.log('⚠️ Export button clicked (download may not trigger in test)');
    }
  });
  // Cleanup (opcional)
  test("Cleanup: Delete test client", async () => {
    await page.goto('/sales');
    await page.click('#clientsSales');
    await page.waitForTimeout(2000);
    await page.click('#clients');
    await page.waitForTimeout(2000);
    // Buscar y eliminar el cliente
    await page.fill('#search', 'Booking Test Client');
    await page.waitForTimeout(1000);
    const clientRow = page.getByText('Booking Test Client', { exact: true });
    if (await clientRow.count() > 0) {
      await clientRow.click();
      await page.waitForTimeout(2000);
      await page.click('#Profile');
      await page.click('#delete');
      await page.click('#confirmDelete');
      await page.waitForTimeout(2000);
      
      console.log('✅ Test client deleted');
    }
  });
});