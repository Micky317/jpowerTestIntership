import { Page } from '@playwright/test';
import { openClientsTable } from '@/utils/data/client';
import { openEstimateOfTheClient } from '@/utils/navigation/navigation';
import { fillContactCard, validateContactCard, fillPropertyContactCard, fillPropertyBillingContact } from '@/utils/contact';
import { selectAddress, notesAndFiles } from '@/utils/input';
import { selectZone } from '@/utils/data/zone';
import { uploadFile } from '@/utils';

/**
 * Creates a client with billing contact
 * @param page - Playwright page object
 * @param clientName - Name of the client to create
 * @returns The created client data
 */
export const createClientForEstimates = async (page: Page, clientName: string) => {
    await openClientsTable(page);
    await page.waitForTimeout(1000);

    // Open create client form
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(5000);

    // Fill client basic info
    await page.fill("#name", clientName);
    await page.click('#priority');
    await page.click('#priority-High');
    await page.click('#salesRepId');
    await page.getByTestId('salesRepId-0').click();
    await page.click('#accountManagerId');
    await page.getByTestId('accountManagerId-0').click();

    // Fill billing contact
    const billingContactData = await fillContactCard(page, '#billingContact');
    await validateContactCard(page, '#billingContact', billingContactData);

    // Add notes
    await page.locator('.ql-editor').evaluate((el, text) => {
        el.innerHTML = `<p>${text}</p>`;
    }, `Client created for booking tests - ${clientName}`);

    // Create client
    await page.click('#create');
    await page.waitForTimeout(5000);

    return { clientName, billingContactData };
};

/**
 * Adds a property to a client
 * @param page - Playwright page object
 * @param clientName - Name of the client
 * @param route - Route number for the property
 * @returns Property data
 */
export const addPropertyToClient = async (page: Page, clientName: string, route: string = '1000') => {
    // Navigate to client
    await page.getByText(clientName, { exact: true }).click();
    await page.waitForTimeout(5000);

    // Go to Properties tab
    await page.click("#Properties");
    await page.click("#new");

    // Fill address
    const addressInput = page.locator('input[type="address"]').nth(0);
    await addressInput.waitFor({ state: 'visible' });
    const dynamicAddressId = await addressInput.getAttribute('id');
    const address = await selectAddress(page, `#${dynamicAddressId}`);

    // Fill property details
    await selectZone(page, '#zoneId', 40);
    await page.fill('#route', route);

    // Fill contacts
    await fillPropertyContactCard(page, '#contact', 1);
    await page.click('#addBillingContact');
    await fillPropertyBillingContact(page, 0, 2);

    // Add notes and files
    await notesAndFiles(page);

    // Create property
    await page.click('#create');
    await page.waitForTimeout(5000);

    return { address, route };
};

/**
 * Creates a Landscape Maintenance estimate
 * @param page - Playwright page object
 * @param clientName - Name of the client
 * @param contactName - Contact name for the estimate
 * @returns Estimate data
 */
export const createLandscapeEstimate = async (
    page: Page,
    clientName: string,
    contactName: string = 'Landscape Contact'
) => {
    await openEstimateOfTheClient(page, clientName);
    await page.waitForTimeout(5000);

    // Open create estimate modal
    await page.click("#createEstimate");
    await page.click("#clientId");
    await page.fill("#clientId", clientName);
    await page.waitForTimeout(5000);
    await page.getByTestId('clientId-0').click();

    // Select Landscape Maintenance type
    await page.click("#type");
    await page.click("#type-Landscape_Maintenance");

    // Fill contact name
    await page.click("#contactName");
    await page.fill("#contactName", contactName);
    await page.waitForTimeout(5000);

    // Save estimate
    await page.click("#save");
    await page.waitForTimeout(5000);

    return { type: 'Landscape Maintenance', contactName };
};

/**
 * Creates a Work Order estimate
 * @param page - Playwright page object
 * @param clientName - Name of the client
 * @param contactName - Contact name for the estimate (optional)
 * @returns Estimate data
 */
export const createWorkOrderEstimate = async (
    page: Page,
    clientName: string,
    contactName: string = 'Work Order Contact'
) => {
    await openEstimateOfTheClient(page, clientName);
    await page.waitForTimeout(5000);

    // Open create estimate modal
    await page.click("#createEstimate");
    await page.click("#clientId");
    await page.fill("#clientId", clientName);
    await page.waitForTimeout(5000);
    await page.getByTestId('clientId-0').click();

    // Select Work Order type
    await page.click("#type");
    await page.click("#type-Work_Order");

    // Select property (first one available)
    await page.click('#propertyId');
    await page.getByTestId('propertyId-0').click();
    await page.waitForTimeout(5000);

    // Save estimate
    await page.click("#save");
    await page.waitForTimeout(5000);

    return { type: 'Work Order', contactName };
};

/**
 * Complete setup: Creates a client with properties and multiple estimates
 * @param page - Playwright page object
 * @param clientName - Name of the client to create
 * @param options - Configuration options
 * @returns All created data
 */
export const setupClientWithEstimates = async (
    page: Page,
    clientName: string,
    options: {
        numProperties?: number;
        createLandscape?: boolean;
        createWorkOrder?: boolean;
        numLandscapeEstimates?: number;
        numWorkOrderEstimates?: number;
    } = {}
) => {
    const {
        numProperties = 1,
        createLandscape = true,
        createWorkOrder = true,
        numLandscapeEstimates = 1,
        numWorkOrderEstimates = 1,
    } = options;

    // Create client
    const clientData = await createClientForEstimates(page, clientName);

    // Add properties
    const properties = [];
    for (let i = 0; i < numProperties; i++) {
        const route = `${1000 + (i * 100)}`;
        const property = await addPropertyToClient(page, clientName, route);
        properties.push(property);
    }

    // Create Landscape estimates
    const landscapeEstimates = [];
    if (createLandscape) {
        for (let i = 0; i < numLandscapeEstimates; i++) {
            const estimate = await createLandscapeEstimate(
                page,
                clientName,
                `Landscape Contact ${i + 1}`
            );
            landscapeEstimates.push(estimate);
        }
    }

    // Create Work Order estimates
    const workOrderEstimates = [];
    if (createWorkOrder) {
        for (let i = 0; i < numWorkOrderEstimates; i++) {
            const estimate = await createWorkOrderEstimate(
                page,
                clientName,
                `Work Order Contact ${i + 1}`
            );
            workOrderEstimates.push(estimate);
        }
    }

    return {
        client: clientData,
        properties,
        landscapeEstimates,
        workOrderEstimates,
    };
};
