import { expect, test } from '@playwright/test';
import { openEstimateForClient, openEstimateOfTheClient, changeLead, openPropertiesInTheClients } from '@/utils/navigation/navigation';
import fs from 'fs';
import { notesAndFiles, selectAddress } from '@/utils/input';
import path from 'path';
import { fillContactCard, fillPropertyContactCard, validateContactCard, fillPropertyBillingContact } from '@/utils/contact';
import { signIn, uploadFile } from '@/utils';
import { clientTimeout, openClientsTable } from '@/utils/data/client';
import { addRoleToUser } from '@/utils/data/user';
import { selectOption, toggleCheckbox, fillDate, storeFields, restoreFields } from '@/utils/input';
import { openCreatePage, searchTable } from '@/utils/table';
import { text } from 'stream/consumers';
import { selectZone } from '@/utils/data/zone';
import { fillMapProperty, fillSalesProperty, openPropertiesTable } from '@/utils/data/property';
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




  test("Verify that the Client and Main/ Billing Contact section can be filled", async () => {

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
    const billingContactData = await fillContactCard(page, '#billingContact');
    await validateContactCard(page, '#billingContact', billingContactData);
    await page.locator('.ql-editor').evaluate((el, text) => {
      el.innerHTML = `<p>${text}</p>`;
    }, 'lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.');
    await page.click('#create');

  });



  test("add property for the user", async () => {
    await page.getByText('Diaz Enterprises', { exact: true }).click();
    await page.waitForTimeout(5000);
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
    await page.waitForTimeout(5000);
  });




  test("create an estimate with the data required to do this", async () => {

    await openEstimateOfTheClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);
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

  

  test("Add to properties in the estimate", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Properties');
    const propertiesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click("#addProperty");
    await page.waitForTimeout(1000);
    await selectZone(page, '#propertyId', 40);
    await fillMapProperty(page, '#map');
    await uploadFile(page, `#map-files`); //If the property already has an image loaded, do not load another one; if it doesn't, then load it.
    await fillSalesProperty(page, '#sales');
    await page.click(`#sales-isAeration`);
    await page.click("#save");
    const newRow = `#row-${propertiesBefore}`;
    await page.waitForSelector(newRow, { state: 'attached', timeout: 7000 });
    await expect(page.locator('tr[id^="row-"]')).toHaveCount(propertiesBefore + 1);
    await page.waitForTimeout(5000);
  });



  test("Prevent changing estimate status to Won without signed contract", async () => {

    await page.waitForTimeout(3000);

    await page.click('#status');
    await page.click('#status-Won_Contract_Signed');

    const warning = page.locator('text=A contract cannot be changed to Won without a signed contact on file');
    await expect(warning).toBeVisible();
    await page.click('#close');
    const currentStatus = await page.locator('#status').innerText();
    expect(currentStatus).not.toContain('Won');

  });

  test("Allow status change to 'Won' after uploading contract from modal", async () => {

    
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
    await page.waitForTimeout(5000);
    await changeLead(page);
  });

  test("Verify file delete button removes file", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    const filesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click('#files-0-delete');
    await page.waitForTimeout(2000);
    const filesAfter = await page.locator('tr[id^="row-"]').count();
    expect(filesAfter).toBeLessThan(filesBefore);
    await page.waitForTimeout(5000);
  });

  test("Verify contract upload in Files tab", async () => {

    await page.waitForTimeout(5000);
    await page.click('#Files');
    const filesBefore = await page.locator('tr[id^="row-"]').count();
    await uploadFile(page, '#addFile');
    await page.waitForTimeout(2000);
    const filesAfter = await page.locator('tr[id^="row-"]').count();
    expect(filesAfter).toBeGreaterThan(filesBefore);
    await page.waitForTimeout(5000);
    await page.click('#save');
    await page.waitForTimeout(5000);
  });

  test("Assign file type after contract upload", async () => {

    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    await page.click('#files-0-type');
    await page.click('#files-0-type-Signed_Contract');
    await page.waitForTimeout(1000);
    const fileType = await page.getAttribute('#files-0-type', 'value');
    await page.click('#save');
    await page.waitForTimeout(2000);
    expect(fileType).toBe('Signed Contract');
    await page.waitForTimeout(5000);
  });

  test("Verify file view button opens preview", async () => {

    await page.waitForTimeout(5000);
    await page.click('#Files');
    await page.waitForTimeout(2000);
    const viewButton = page.locator('#row-0 button').first();
    await viewButton.click();
    const previewImage = page.locator('#dialog-body img[alt="image"]');
    await expect(previewImage).toBeVisible();
    await page.waitForTimeout(5000);
    await page.click('#close');
    await page.waitForTimeout(5000);
  });

  test("Verify file download button opens image tab", async () => {
    //await openEstimateLandscapeForClient(page, 'Diaz Enterprises');
    await page.waitForTimeout(5000);

    await page.click('#Files');
    await page.waitForTimeout(2000);

    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      page.click('#files-0-download'),
    ]);

    await newPage.waitForLoadState('domcontentloaded');
    const image = newPage.locator('img');
    await expect(image).toBeVisible();

    await newPage.close();

    await page.waitForTimeout(5000);
  });







  test("Edit contract start and end dates", async () => {

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
    await page.waitForTimeout(5000);
  });

  test("Show error when start date is after end date", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Contract');
    await page.waitForTimeout(1000);

    const originalValues = await storeFields(page, [
      'contract-startDate',
      'contract-endDate'
    ]);
    try {
      await page.fill('#contract-startDate', '2026-12-01');
      await page.waitForTimeout(500);
      await page.fill('#contract-endDate', '2026-05-01');
      await page.waitForTimeout(500);
      await page.click('#save');
      await page.waitForTimeout(1000);
      const errorMessage = page.locator('text=Contract end date cannot be before start date');
      await expect(errorMessage).toBeVisible();
    } finally {
      await restoreFields(page, originalValues);
    }
  });



  test("Edit and save contract fields with verification", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Contract');
    await page.waitForTimeout(1000);
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
  });


  test("Verify that multiple services can be added and saved", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Services');
    await page.waitForTimeout(1000);
    const servicesToAdd = [
      'Maquinary',
      'Irrigation',
      'Lawn Maintenance',
      'Tree Trimming'
    ];
    const serviceInputs = page.locator('input[id^="services-"][id$="-name"]');
    const initialCount = await serviceInputs.count();
    for (let i = 0; i < servicesToAdd.length; i++) {
      await page.click('#addService');
      await page.waitForTimeout(1000);
      const serviceIndex = initialCount + i;
      await page.fill(`#services-${serviceIndex}-name`, servicesToAdd[i]);
      await page.waitForTimeout(500);
    }
    await page.click('#save');
    await page.waitForTimeout(5000);
    const updatedServiceInputs = page.locator('input[id^="services-"][id$="-name"]');
    const finalCount = await updatedServiceInputs.count();
    expect(finalCount).toBe(initialCount + servicesToAdd.length);
    const savedValues: string[] = [];
    for (let i = 0; i < finalCount; i++) {
      const value = await page.inputValue(`#services-${i}-name`);
      savedValues.push(value);
    }
    for (const serviceName of servicesToAdd) {
      expect(savedValues).toContain(serviceName);
    }
  });

  test("Verify error message when adding service without name", async () => {

    await page.waitForTimeout(5000);
    await page.click('#Services');
    await page.waitForTimeout(1000);
    const serviceInputs = page.locator('input[id^="services-"][id$="-name"]');
    const currentCount = await serviceInputs.count();
    await page.click('#addService');
    await page.waitForTimeout(1000);
    await page.click('#save');
    await page.waitForTimeout(2000);
    const expectedErrorMessage = `Services: ${currentCount + 1}: Name Required`;
    const errorMessage = page.locator(`text=${expectedErrorMessage}`);
    await expect(errorMessage).toBeVisible();
  });

  test("Verify that delete button removes a service", async () => {

    await page.waitForTimeout(5000);
    await page.click('#Services');
    await page.waitForTimeout(1000);

    const serviceInputs = page.locator('input[id^="services-"][id$="-name"]');
    const initialCount = await serviceInputs.count();
    if (initialCount === 0) {
      throw new Error('No services available to delete');
    }
    const serviceToDelete = await page.inputValue('#services-0-name');

    const deleteButtonXPath = '/html/body/div[2]/div[2]/div[2]/div/div/div/div[2]/div/div[2]/div[2]/div/div[1]/button'; //change to specific ID  if possible
    const deleteButton = page.locator(`xpath=${deleteButtonXPath}`);

    await deleteButton.waitFor({ state: 'visible', timeout: 10000 });
    await deleteButton.click({ noWaitAfter: true });
    await page.waitForTimeout(2000);
    const updatedCount = await serviceInputs.count();
    console.log(`Services after delete: ${updatedCount}`);
    await page.click('#save');
    await page.waitForTimeout(3000);
    const finalCount = await serviceInputs.count();
    expect(finalCount).toBe(initialCount - 1);
    const savedValues: string[] = [];
    for (let i = 0; i < finalCount; i++) {
      const value = await page.inputValue(`#services-${i}-name`);
      savedValues.push(value);
    }
    expect(savedValues).not.toContain(serviceToDelete);
  });




  test("Toggle 'Hide Contract Summary' and verify visibility", async () => {

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

  test("Toggle 'Hide Optional Services' and verify header is not visible", async () => {
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

  test("Toggle 'Hide Property Breakdown' and verify section disappears", async () => {
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


  


  test("Edit and restore customer data in the estimate", async () => {
  function normalizeNumberString(value: string): string {
    return value.replace(/[^\d.-]/g, '');
  }

  await page.waitForTimeout(2000);
  await page.click('#Details');
  await page.waitForTimeout(2000);

  const textFieldIds = ['name', 'proposedDeal', 'reminderDate'];
  const originalTextValues = await storeFields(page, textFieldIds);

  const originalStatusValue = await page.inputValue('#status');
  const originalPaymentTermValue = await page.inputValue('#paymentTerm');
  const originalContactMethodValue = await page.inputValue('#contactMethod');

  const updatedTextValues: Record<string, string> = {
    name: 'Edited Walmart',
    proposedDeal: '1000000',
    reminderDate: '2025-11-07',
  };

  const updatedStatusId = 'Data_Gathering';
  const updatedPaymentTermId = 'Upon_Completion';
  const updatedContactMethodId = 'Email';

  await page.fill('#name', updatedTextValues.name);
  await page.fill('#proposedDeal', updatedTextValues.proposedDeal);
  await page.fill('#reminderDate', updatedTextValues.reminderDate);

  await page.click('#status');
  await page.click(`#status-${updatedStatusId}`);

  await page.click('#paymentTerm');
  await page.click(`#paymentTerm-${updatedPaymentTermId}`);

  await page.click('#contactMethod');
  await page.click(`#contactMethod-${updatedContactMethodId}`);

  await page.click('#save');
  await page.waitForTimeout(1500);

  for (const [id, expected] of Object.entries(updatedTextValues)) {
    const actual = await page.inputValue(`#${id}`);
    if (id === 'proposedDeal') {
      expect(normalizeNumberString(actual)).toBe(normalizeNumberString(expected));
    } else {
      expect(actual).toBe(expected);
    }
  }

  expect(await page.inputValue('#status')).toBe('Data Gathering');
  expect(await page.inputValue('#paymentTerm')).toBe('Upon Completion');
  expect(await page.inputValue('#contactMethod')).toBe('Email');

  await restoreFields(page, originalTextValues);

  if (originalStatusValue && originalStatusValue.trim() !== '') {
    await page.click('#status');
    await page.click(`#status-${originalStatusValue.replace(/\s/g, '_')}`);
  }

  if (originalPaymentTermValue && originalPaymentTermValue.trim() !== '') {
    await page.click('#paymentTerm');
    await page.click(`#paymentTerm-${originalPaymentTermValue.replace(/\s/g, '_')}`);
  }

  if (originalContactMethodValue && originalContactMethodValue.trim() !== '') {
    await page.click('#contactMethod');
    await page.click(`#contactMethod-${originalContactMethodValue}`);
  }

  await page.click('#save');
  await page.waitForTimeout(1500);

  for (const [id, expected] of Object.entries(originalTextValues)) {
    const actual = await page.inputValue(`#${id}`);
    if (id === 'proposedDeal') {
      expect(normalizeNumberString(actual)).toBe(normalizeNumberString(expected));
    } else {
      expect(actual).toBe(expected);
    }
  }

  const restoredStatusValue = await page.inputValue('#status');
  expect(restoredStatusValue).toBe(originalStatusValue);
});



  test("Cannot delete a property if it is linked to one or more estimates and the proper warning message is shown", async () => {
    await openEstimateOfTheClient(page, 'Diaz Enterprises',);
    await page.waitForTimeout(5000);
    await page.click('#Properties');
    await page.locator('.ReactVirtualized__Grid__innerScrollContainer a').first().click();
    await page.click('#delete');
    await page.click('#confirmDelete');
    const dialog = page.locator('#dialog-body');
    await expect(dialog).toBeVisible();
    const warning = dialog.getByText('This property cannot be deleted because it is linked', { exact: false });
    await expect(warning).toBeVisible();
    await page.click('#close');
  });

  test("Delete property in the estimate", async () => {
    await page.waitForTimeout(5000);
    await openEstimateForClient(page, 'Diaz Enterprises', 'Landscape Maintenance');
    await page.click('#Details');
    await page.waitForTimeout(5000);
    await page.click('#Properties');
    const propertiesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click("#row-0");
    await page.click("#delete");
    await page.waitForSelector('#row-0', { state: 'detached', timeout: 7000 });
    await expect(page.locator('tr[id^="row-"]')).toHaveCount(propertiesBefore - 1);
    await page.click('#save');
    await page.waitForTimeout(3000);
  });



  test("Delete service in the estimate", async () => {
    //await openEstimateForClient(page, 'Diaz Enterprises', 'Landscape Maintenance');
    await page.waitForTimeout(5000);
    await page.click('#delete');

    const dialog = page.locator('#dialog-body');
    await expect(dialog).toBeVisible();

    const warning = dialog.getByText('Are you sure you want to delete this estimate?', { exact: false });
    await expect(warning).toBeVisible();

    await page.click('#confirmDelete');
    await page.waitForTimeout(3000);
    const landscapeSection = page.getByText('Landscape Maintenance', { exact: false });
    await expect(landscapeSection).toHaveCount(0);
  });

  test("Property Removal", async () => {
    await page.waitForTimeout(5000);
    await page.click('#Properties');
    await page.locator('.ReactVirtualized__Grid__innerScrollContainer a').first().click();
    await page.click('#delete');
    await page.click('#confirmDelete');

    await openEstimateOfTheClient(page, 'Diaz Enterprises');
    await page.click('#Properties');
    const grid = page.locator('.ReactVirtualized__Grid__innerScrollContainer');
    await expect(grid.locator('[role="row"]')).toHaveCount(0);
  });

  test("Client removal", async () => {
    await page.click('#Profile')
    await page.waitForTimeout(5000);
    await page.click('#delete');
    await page.click('#confirmDelete');
    await page.waitForTimeout(5000);
    const clientName = page.getByText('Diaz Enterprises', { exact: true });
    await expect(clientName).toHaveCount(0);
  });

});