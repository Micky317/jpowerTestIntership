import {expect, test} from '@playwright/test';
import { openEstimateLandscapeForClient } from '@/utils/navigation/navigation';
import fs from 'fs';
import { notesAndFiles, selectAddress } from '@/utils/input';
import path from 'path';
import {fillContactCard, fillPropertyContactCard, validateContactCard,fillPropertyBillingContact} from '@/utils/contact';
import {signIn, uploadFile} from '@/utils';
import {clientTimeout, openClientsTable} from '@/utils/data/client';
import {addRoleToUser} from '@/utils/data/user';
import {selectOption, toggleCheckbox,fillDate,storeFields,restoreFields} from '@/utils/input';
import {openCreatePage, searchTable} from '@/utils/table';
import { text } from 'stream/consumers';
import { selectZone } from '@/utils/data/zone';
import { fillMapProperty,fillSalesProperty, openPropertiesTable } from '@/utils/data/property';
import { Page } from '@playwright/test';
test.describe.serial('All tests in sequence', () => {

  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    test.setTimeout(clientTimeout);
    await signIn(page);
    await openClientsTable(page);
  });

  test.afterAll(async () => {
    await page.close();
  });
  

  test("Verify that the Client and Main/ Billing Contact section can be filled", async ({ page }) => {
 
  await page.waitForTimeout(1000);
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(5000);
  await page.fill("#name", "Diaz Enterprises");
  await page.click('#priority');
  await page.click('#priority-High');
  await page.click('#salesRepId');
  await page.getByTestId('salesRepId-0').click();
  await page.click('#accountManagerId');
  await page.getByTestId('accountManagerId-0').click();
  const billingContactData= await fillContactCard(page, '#billingContact');
  await validateContactCard(page, '#billingContact', billingContactData);
  await page.locator('.ql-editor').evaluate((el, text) => {
  el.innerHTML = `<p>${text}</p>`;}, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
  await page.click('#create');
  
  });

  

  test("add properti for the user", async ({page}) => {
      await page.getByText('Diaz Enterprises', { exact: true }).click();
      await page.click("#Properties");
      await page.click("#new");
      const addressInput = page.locator('input[type="address"]').nth(0);
      await addressInput.waitFor({ state: 'visible' });
      const dynamicAddressId = await addressInput.getAttribute('id');
      await selectAddress(page, `#${dynamicAddressId}`);
      await selectZone(page, '#zoneId', 40);
      await page.fill('#route', '1000');
      await fillPropertyContactCard(page, '#contact', 1);
      await page.click('#addBillingContact'); 
      await fillPropertyBillingContact(page, 0, 2); 
      await notesAndFiles(page);
      await page.click('#create');
      
  });




  test("create an estimate with the data required to do this", async ({page}) => {
      await page.click("#createEstimate");
      await page.click("#clientId");
      await page.fill("#clientId", "Diaz Enterprises");
      await page.waitForTimeout(5000);
      await page.getByTestId('clientId-0').click();
      await page.click("#type");
      await page.click("#type-Landscape_Maintenance");
      await page.click("#contactName");
      await page.fill("#contactName", "first name last name");
      await page.waitForTimeout(5000);
      await page.click("#save");  
      await page.waitForTimeout(5000);
  });

  /*test("Entry to the estimate from the created client ", async ({page}) => {
      await page.waitForTimeout(7000);
      await page.getByText('Walmart', { exact: true }).click();
      await page.waitForTimeout(5000);
      await page.click("#Estimates");
      await page.waitForTimeout(5000);
      const row = page.locator('#row-8479abb2-3657-4346-837e-4ffada03b961-0');
      await expect(row).toBeVisible();
  });*/

  test("Add to properties in the estimate", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Properties');
    const propertiesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click("#addProperty");
    await selectZone(page, '#propertyId', 40);
    await fillMapProperty(page, '#map');
    await uploadFile(page, `#map-files`); //If the property already has an image loaded, do not load another one; if it doesn't, then load it.
    await fillSalesProperty(page, '#sales');
    await page.click(`#sales-isAeration`);
    await page.click("#save");
    const newRow = `#row-${propertiesBefore}`;
    await page.waitForSelector(newRow, { state: 'attached', timeout: 7000 });
    await expect(page.locator('tr[id^="row-"]')).toHaveCount(propertiesBefore + 1);
  });

  

  test("Prevent changing estimate status to Won without signed contract", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(3000);

    await page.click('#status');
    await page.click('#status-Won_Contract_Signed');

    const warning = page.locator('text=A contract cannot be changed to Won without a signed contact on file');
    await expect(warning).toBeVisible();
    await page.click('#close');
    const currentStatus = await page.locator('#status').innerText();
    expect(currentStatus).not.toContain('Won');
  });

  test("Allow status change to 'Won' after uploading contract from modal", async ({ page }) => {
    
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(3000);
    await page.click('#status');
    await page.click('#status-Won_Contract_Signed');
    const warning = page.locator('text=A contract cannot be changed to Won without a signed contact on file');
    await expect(warning).toBeVisible();
    await uploadFile(page, 'input[type="file"]');
    await page.waitForTimeout(2000);
    await page.click('#save');
    await page.waitForTimeout(1500);
    const currentStatus = await page.getAttribute('#status', 'value');
    expect(currentStatus).toBe('Won Contract Signed');
  });

  test("Verify contract upload in Files tab", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Files');
    const filesBefore = await page.locator('tr[id^="row-"]').count();
    await uploadFile(page, '#addFile');
    await page.waitForTimeout(2000);
    const filesAfter = await page.locator('tr[id^="row-"]').count();
    expect(filesAfter).toBeGreaterThan(filesBefore);
  });

  test("Assign file type after contract upload", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Files');
    await uploadFile(page, '#addFile');
    await page.waitForTimeout(2000);
    await page.click('#files-0-type'); 
    await page.click('#files-0-type-Signed_Contract'); 
    await page.waitForTimeout(1000);
    const fileType = await page.getAttribute('#files-0-type', 'value');
    await page.click('#save');
    await page.waitForTimeout(2000);
    expect(fileType).toBe('Signed Contract');
  });

  test("Verify file view button opens preview", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    const viewButton = page.locator('#row-0 button').first(); 
    await viewButton.click();
    const previewImage = page.locator('#dialog-body img[alt="image"]');
    await expect(previewImage).toBeVisible();
    await page.waitForTimeout(5000);
    await page.click('#close');
  });

  test("Verify file download button opens image tab", async ({ page, context }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    const [newPage] = await Promise.all([
      context.waitForEvent('page'), 
      page.click('#files-0-download'), 
    ]);
    await newPage.waitForLoadState('domcontentloaded');
    const image = newPage.locator('img');
    await expect(image).toBeVisible();
  });

  test("Verify file delete button removes row", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    const filesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click('#files-0-delete');
    await page.waitForTimeout(2000);
    const filesAfter = await page.locator('tr[id^="row-"]').count(); 
    expect(filesAfter).toBeLessThan(filesBefore);
  });

  test("Edit contract start and end dates", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');
    await page.fill('#contract-startDate', '2026-05-01'); 
    await page.waitForTimeout(500);
    await page.fill('#contract-endDate', '2026-12-01');
    await page.waitForTimeout(500);
    await page.click('#save');
    await page.waitForTimeout(2000);
    const startDate = await page.inputValue('#contract-startDate');
    const endDate = await page.inputValue('#contract-endDate');
    expect(startDate).toBe('2026-05-01');
    expect(endDate).toBe('2026-12-01');
  });

  test("Show error when start date is after end date", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');
    await page.waitForTimeout(1000);
    await page.fill('#contract-startDate', '2026-12-01'); 
    await page.waitForTimeout(500);
    await page.fill('#contract-endDate', '2026-05-01');
    await page.waitForTimeout(500);
    await page.click('#save');
    await page.waitForTimeout(1000);
    const errorMessage = page.locator('text=Contract end date cannot be before start date');
    await expect(errorMessage).toBeVisible();
  });


  test("Edit and restore contract fields with verification", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const fieldIds = [
      'contract-address',
      'contract-attn',
      'contract-date',
      'contract-title',
    ];
    const originalValues = await storeFields(page, fieldIds);
    const updatedValues: Record<string, string> = {
      'contract-address': '456 New Street',
      'contract-attn': 'John Doe',
      'contract-date': '2025-11-07',
      'contract-title': 'Updated Title',
    };
    for (const [id, value] of Object.entries(updatedValues)) {
      await page.fill(`#${id}`, value);
    }
    await page.click('#save');
    await page.waitForTimeout(2000);
    for (const [id, expected] of Object.entries(updatedValues)) {
      const actual = await page.inputValue(`#${id}`);
      expect(actual).toBe(expected);
    }
    await restoreFields(page, originalValues);
    for (const [id, expected] of Object.entries(originalValues)) {
      const actual = await page.inputValue(`#${id}`);
      expect(actual).toBe(expected);
    }
  });

  /*test("Toggle all contract visibility checkboxes and verify DOM changes", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const visibilityMap: Record<string, string> = {
      'contract-hideContractSummary': '#contract-summary',
      'contract-hideOptionalServices': '#optional-services',
      'contract-hidePropertyBreakdown': '#property-breakdown',
      'contract-displayLargeImages': '#contract-images',
      'contract-usePropertyName': '#property-name-header',
    };

    for (const [checkboxId, sectionId] of Object.entries(visibilityMap)) {
      const checkbox = page.locator(`#${checkboxId}`);
      const section = page.locator(sectionId);

      // Verificamos si la sección existe antes de continuar
      if (await section.count() === 0) {
        console.warn(`Sección ${sectionId} no está presente inicialmente, se omite este toggle.`);
        continue;
      }

      await expect(section).toBeVisible();

      await checkbox.click();
      await page.waitForTimeout(1000);
      await expect(section).toHaveCount(0);

      await checkbox.click();
      await page.waitForTimeout(1000);
      await expect(section).toBeVisible();
    }
  });*/

  test("Toggle 'Hide Contract Summary' and verify visibility", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const checkbox = page.locator('#contract-hideContractSummary');
    const section = page.locator('#contract-summary');

    await expect(section).toBeVisible();
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(section).toHaveCount(0);
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(section).toBeVisible();
  });

  test("Toggle 'Hide Optional Services' and verify header is not visible", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const contractContainer = page.locator('div.overflow-x-auto');
    const checkbox = contractContainer.locator('#contract-hideOptionalServices');

    const sectionHeader = contractContainer.locator(
      'p.absolute.font-bold.text-center',
      { hasText: 'OPTIONAL SERVICES' }
    );

    await expect(sectionHeader).toBeVisible();
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(sectionHeader).not.toBeVisible();
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(sectionHeader).toBeVisible();
  });

  test("Toggle 'Hide Property Breakdown' and verify section disappears", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const contractContainer = page.locator('div.overflow-x-auto');
    const checkbox = contractContainer.locator('#contract-hidePropertyBreakdown');

    const breakdownSection = contractContainer.locator('div.relative.h-5.mb-4');

    await expect(breakdownSection).toBeVisible();
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(breakdownSection).not.toBeVisible();
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(breakdownSection).toBeVisible();
  });


  test("Toggle 'Display Large Images' and verify image height changes", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const contractContainer = page.locator('div.overflow-x-auto');
    const checkbox = contractContainer.locator('#contract-displayLargeImages');
    const logo = contractContainer.locator('img[alt="logo"]');

    await expect(logo).toBeVisible();

    const initialBox = await logo.boundingBox();
    const initialHeight = initialBox?.height ?? 0;

    await checkbox.click();
    await page.waitForTimeout(1000);

    const expandedBox = await logo.boundingBox();
    const expandedHeight = expandedBox?.height ?? 0;

    expect(expandedHeight).toBeGreaterThan(initialHeight);

    await checkbox.click();
    await page.waitForTimeout(1000);

    const finalBox = await logo.boundingBox();
    const finalHeight = finalBox?.height ?? 0;

    expect(Math.abs(finalHeight - initialHeight)).toBeLessThanOrEqual(2); 
  });


  test("Toggle 'Use Property Name' and verify visibility", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Contract');

    const checkbox = page.locator('#contract-usePropertyName');
    const section = page.locator('#property-name-header');

    await expect(section).toBeVisible();
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(section).toHaveCount(0);
    await checkbox.click();
    await page.waitForTimeout(1000);
    await expect(section).toBeVisible();
  });


  

  test("Delete property in the estimate", async ({ page }) => {
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.click('#Properties');
    const propertiesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click("#row-0");
    await page.click("#delete");
    await page.waitForSelector('#row-0', { state: 'detached', timeout: 7000 });
    await expect(page.locator('tr[id^="row-"]')).toHaveCount(propertiesBefore - 1);
  });

  test("Verify that the customer data has been changed in the estimate", async ({ page  }) => { 
    await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
    await page.fill('#name', 'Edited Walmart');
    await selectZone(page, '#clientId', 40);
    await selectZone(page, '#clientType', 40);
    await page.click('#status');
    await page.click('#status-Won_Contract_Signed');
    await page.fill('#proposedDeal', '1000000');
    await page.click('#paymentTerm');
    await page.click('#paymentTerm-Upon_Completion');
    await page.click('#contactMethod');
    await page.click('#contactMethod-Email');
    
    await fillDate(page, '#reminderDate');
  });
});