import { Page } from '@playwright/test';
import { openClientsTable } from '@/utils/data/client';
import { openEstimateOfTheClient } from '@/utils/navigation/navigation';
import { fillContactCard, validateContactCard, fillPropertyContactCard, fillPropertyBillingContact } from '@/utils/contact';
import { selectAddress, notesAndFiles } from '@/utils/input';
import { selectZone } from '@/utils/data/zone';
import { fillMapProperty, fillSalesProperty } from '@/utils/data/property';
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

    // Cliente creado, quedamos en Profile del cliente
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
    // Ya estamos en el cliente, solo ir a Properties tab
    await page.click("#Properties");
    await page.waitForTimeout(2000);
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

    await notesAndFiles(page);

    await page.click('#create');
    await page.waitForTimeout(5000);

    // Volver al cliente (Profile)
    await openEstimateOfTheClient(page, clientName);

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
    contactName: string = 'Landscape Contact',
    skipReturn: boolean = false  // Si true, NO vuelve al cliente (para completar inmediatamente)
) => {
    // Ya estamos en Profile del cliente, hacer clic en createEstimate
    await page.click("#createEstimate");
    await page.waitForTimeout(2000);

    await page.click("#clientId");
    await page.fill("#clientId", clientName);
    await page.waitForTimeout(5000);
    await page.getByTestId('clientId-0').click();

    // Select Landscape Maintenance type
    await page.click("#type");
    await page.click("#type-Landscape_Maintenance");

    // contactName se auto-rellena con el billing contact, no lo llenamos manualmente

    // Save estimate
    await page.click("#save");
    await page.waitForTimeout(5000);

    // Solo volver al cliente si skipReturn es false
    if (!skipReturn) {
        await openEstimateOfTheClient(page, clientName);
    }
    // Si skipReturn es true, quedamos en el estimate para completarlo

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
    contactName: string = 'Work Order Contact',
    propertyIndex: number = 0,  // Índice de la propiedad a usar
    skipReturn: boolean = false  // Si true, NO vuelve al cliente (para completar inmediatamente)
) => {
    // Ya estamos en Profile del cliente, hacer clic en createEstimate
    await page.click("#createEstimate");
    await page.waitForTimeout(2000);

    await page.click("#clientId");
    await page.fill("#clientId", clientName);
    await page.waitForTimeout(5000);
    await page.getByTestId('clientId-0').click();

    // Select Work Order type
    await page.click("#type");
    await page.click("#type-Work_Order");

    // Select property (intentar usar propertyIndex, si falla usar 0)
    await page.click('#propertyId');
    try {
        await page.getByTestId(`propertyId-${propertyIndex}`).click({ timeout: 3000 });
    } catch {
        // Si falla, usar la primera propiedad
        await page.getByTestId('propertyId-0').click();
    }
    await page.waitForTimeout(5000);

    // Save estimate
    await page.click("#save");
    await page.waitForTimeout(5000);

    // Solo volver al cliente si skipReturn es false
    if (!skipReturn) {
        await openEstimateOfTheClient(page, clientName);
    }
    // Si skipReturn es true, quedamos en el estimate para completarlo

    return { type: 'Work Order', contactName };
};

/**
 * Adds a property to a Landscape estimate
 * @param page - Playwright page object
 * @returns Property data
 */
export const addPropertyToLandscapeEstimate = async (page: Page, propertyIndex: number = 0) => {
    // Ya estamos en el estimate, ir a Properties tab
    await page.click('#Properties');
    await page.waitForTimeout(2000);
    
    const propertiesBefore = await page.locator('tr[id^="row-"]').count();
    await page.click("#addProperty");
    await page.waitForTimeout(1000);
    
    // Seleccionar propiedad por índice (igual que Work Order)
    try {
        await page.click('#propertyId');
        await page.waitForTimeout(500);
        await page.getByTestId(`propertyId-${propertyIndex}`).click({ timeout: 3000 });
    } catch {
        // Si falla, usar la primera propiedad (índice 0)
        await page.click('#propertyId');
        await page.waitForTimeout(500);
        await page.getByTestId('propertyId-0').click();
    }
    await page.waitForTimeout(1000);
    
    // Llenar Map Property
    await fillMapProperty(page, '#map');
    
    // Subir archivo para map-files (si la propiedad no tiene imagen)
    await uploadFile(page, `#map-files`);
    await page.waitForTimeout(1000);
    
    // Llenar Sales Property
    await fillSalesProperty(page, '#sales');
    
    // Marcar checkbox isAeration
    await page.click(`#sales-isAeration`);
    await page.waitForTimeout(500);
    
    await page.click("#save");
    await page.waitForTimeout(2000);
    
    const newRow = `#row-${propertiesBefore}`;
    await page.waitForSelector(newRow, { state: 'attached', timeout: 7000 });
    
    return { added: true };
};

/**
 * Adds a project with items to a Work Order estimate
 * @param page - Playwright page object
 * @returns Project data
 */
export const addProjectAndItemsToWorkOrder = async (page: Page) => {
    // Ya estamos en el estimate, ir a Details tab por si acaso
    await page.click('#Details');
    await page.waitForTimeout(2000);
    
    // Crear proyecto
    await page.click('#addProject');
    await page.waitForTimeout(2000);
    
    // Hacer clic en el proyecto recién creado (project-0)
    await page.click('#project-0');
    await page.waitForTimeout(1000);
    
    // Tipos de items a crear
    const itemTypes = [
        'type-Equipment',
        'type-Fee',
        'type-Labor',
        'type-Material',
        'type-Subcontractor',
        'type-Group'
    ];
    
    // Crear cada tipo de item
    for (const typeId of itemTypes) {
        await page.click('#addItem');
        await page.waitForTimeout(500);
        
        const typeLocator = page.locator(`#${typeId}`);
        try {
            await typeLocator.waitFor({ state: 'visible', timeout: 3000 });
        } catch {
            await page.click('#addItem');
            await typeLocator.waitFor({ state: 'visible', timeout: 5000 });
        }
        
        await typeLocator.click();
        
        // Llenar campos según el tipo
        switch (typeId) {
            case 'type-Equipment':
                await page.fill('#name', 'Test Equipment');
                await page.fill('#quantity', '5');
                await page.fill('#unitCost', '100');
                await page.fill('#margin', '10');
                break;
            
            case 'type-Fee':
                await page.fill('#name', 'Test Fee');
                await page.fill('#quantity', '2');
                await page.fill('#unitCost', '50');
                break;
            
            case 'type-Group':
                await page.fill('#name', 'Test Group');
                break;
            
            case 'type-Labor':
                await page.fill('#name', 'Test Labor');
                await page.fill('#quantity', '3');
                await page.fill('#margin', '15');
                break;
            
            case 'type-Material':
                await page.fill('#name', 'Test Material');
                await page.fill('#quantity', '10');
                await page.fill('#unitCost', '200');
                await page.fill('#margin', '20');
                await page.click('#unit');
                await page.click('#unit-TON');
                break;
            
            case 'type-Subcontractor':
                await page.fill('#name', 'Test Subcontractor');
                await page.fill('#quantity', '4');
                await page.fill('#unitCost', '300');
                await page.fill('#margin', '25');
                break;
        }
        
        await page.waitForTimeout(500);
    }
    
    // Guardar el proyecto con todos los items
    await page.waitForTimeout(2000);
    await page.click('#save');
    await page.waitForTimeout(3000);
    
    return { projectCreated: true, itemsCount: itemTypes.length };
};

/**
 * Changes estimate status to Won by uploading contract
 * @param page - Playwright page object
 * @returns Status change result
 */
export const changeEstimateToWon = async (page: Page) => {
    // Ir a Details tab
    await page.click('#Details');
    await page.waitForTimeout(2000);
    // Intentar cambiar a Won (esto mostrará el modal de subir contrato)
    await page.click('#status');
    await page.click('#status-Won_Contract_Signed');
    await page.waitForTimeout(1000);
    // Subir contrato desde el modal
    await uploadFile(page, 'input[type="file"]');
    await page.waitForTimeout(2000);
    
    // Guardar cambios
    await page.click('#save');
    await page.waitForTimeout(3000); // Esperar a que se guarden los cambios
    
    return { status: 'Won Contract Signed' };
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
        completeEstimates?: boolean; // Si true, agrega propiedades y cambia a Won
    } = {}
) => {
    const {
        numProperties = 1,
        createLandscape = true,
        createWorkOrder = true,
        numLandscapeEstimates = 1,
        numWorkOrderEstimates = 1,
        completeEstimates = false,
    } = options;

    // Create client
    const clientData = await createClientForEstimates(page, clientName);

    // Crear propiedades en PARALELO usando múltiples pestañas
    const propertyPromises = [];
    for (let i = 0; i < numProperties; i++) {
        const route = `${1000 + (i * 100)}`;
        const promise = (async () => {
            // Crear nueva pestaña para esta propiedad
            const newPage = await page.context().newPage();
            try {
                await newPage.goto(page.url()); // Ir a la misma URL
                await newPage.waitForTimeout(2000);
                const property = await addPropertyToClient(newPage, clientName, route);
                return property;
            } finally {
                await newPage.close(); // Cerrar la pestaña
            }
        })();
        propertyPromises.push(promise);
    }

    // Esperar a que TODAS las propiedades se creen en paralelo
    const properties = await Promise.all(propertyPromises);

    // Crear estimates en PARALELO usando múltiples pestañas
    const estimatePromises = [];
    
    // Crear Landscape estimates en paralelo
    if (createLandscape) {
        for (let i = 0; i < numLandscapeEstimates; i++) {
            const propertyIdx = i % numProperties; // Para agregar propiedad
            const promise = (async () => {
                // Crear nueva pestaña para este estimate
                const newPage = await page.context().newPage();
                try {
                    await newPage.goto(page.url()); // Ir a la misma URL
                    await newPage.waitForTimeout(2000);
                    
                    // Crear estimate (skipReturn si vamos a completar)
                    const estimate = await createLandscapeEstimate(
                        newPage,
                        clientName,
                        `Landscape Contact ${i + 1}`,
                        completeEstimates  // Si true, NO vuelve al cliente
                    );
                    
                    // Si completeEstimates es true, completar AHORA en la misma pestaña
                    if (completeEstimates) {
                        // Ya estamos en el estimate, agregar propiedad
                        await addPropertyToLandscapeEstimate(newPage, propertyIdx);
                        // Cambiar a Won
                        await changeEstimateToWon(newPage);
                    }
                    
                    return { type: 'landscape', estimate };
                } finally {
                    await newPage.close(); // Cerrar la pestaña
                }
            })();
            estimatePromises.push(promise);
        }
    }

    // Crear Work Order estimates en paralelo
    if (createWorkOrder) {
        for (let i = 0; i < numWorkOrderEstimates; i++) {
            const propertyIdx = i % numProperties; // Rotar entre propiedades
            const promise = (async () => {
                // Crear nueva pestaña para este estimate
                const newPage = await page.context().newPage();
                try {
                    await newPage.goto(page.url()); // Ir a la misma URL
                    await newPage.waitForTimeout(2000);
                    
                    // Crear estimate (skipReturn si vamos a completar)
                    const estimate = await createWorkOrderEstimate(
                        newPage,
                        clientName,
                        `Work Order Contact ${i + 1}`,
                        propertyIdx,  // Pasar índice de propiedad
                        completeEstimates  // Si true, NO vuelve al cliente
                    );
                    
                    // Si completeEstimates es true, completar AHORA en la misma pestaña
                    if (completeEstimates) {
                        // Ya estamos en el estimate, agregar proyecto e items
                        await addProjectAndItemsToWorkOrder(newPage);
                        // Cambiar a Won
                        await changeEstimateToWon(newPage);
                    }
                    
                    return { type: 'workorder', estimate };
                } finally {
                    await newPage.close(); // Cerrar la pestaña
                }
            })();
            estimatePromises.push(promise);
        }
    }

    // Esperar a que TODOS los estimates se creen (y completen si completeEstimates es true)
    const allEstimates = await Promise.all(estimatePromises);

    // Separar los resultados por tipo
    const landscapeEstimates = allEstimates
        .filter(e => e.type === 'landscape')
        .map(e => e.estimate);
    const workOrderEstimates = allEstimates
        .filter(e => e.type === 'workorder')
        .map(e => e.estimate);

    if (completeEstimates) {
        console.log('✅ All estimates created and completed (Won status)!');
    }

    return {
        client: clientData,
        properties,
        landscapeEstimates,
        workOrderEstimates,
    };
};
