import { expect, test } from "@playwright/test";
import { signIn } from "@/utils";
import { createContract } from "@/utils/data/contract";
import { createEvent, updateEvent } from "@/utils/data/event";
import { createServiceChannelService } from "@/utils/data/serviceChannelService";
import { openFirstRow } from "@/utils/table";

test.beforeEach(async ({ page }) => {
  test.setTimeout(3.5 * 60000);
  await signIn(page);
});

test("Service Channel Integration", async ({ page }) => {
  const name = "Service Channel 1";
  const problemCode = "A) Full";
  const description = "B) Ice Control A) Full";
  const statusPrimary = "COMPLETED";
  const statusExtended = "NO CHARGE";

  await page.click("#avatar");
  await page.click("#settings");
  await page.fill("#serviceChannelProviderId", "2000099375");
  await page.fill("#serviceChannelClientId", String(process.env.SERVICE_CHANNEL_CLIENT_ID));
  await page.fill("#serviceChannelClientSecret", String(process.env.SERVICE_CHANNEL_CLIENT_SECRET));
  await page.fill("#serviceChannelUsername", String(process.env.SERVICE_CHANNEL_USERNAME));
  await page.fill("#serviceChannelPassword", String(process.env.SERVICE_CHANNEL_PASSWORD));
  await page.click("#save");

  const { property } = await createContract(page, {
    name,
    client: {
      name,
      serviceChannel: {
        category: "MAINTENANCE",
        priority: "Sev 1",
        statusPrimary,
        statusExtended,
        subscriberId: "2014916643",
        tradeName: "SNOW",
      },
    },
    property: { serviceChannelLocationId: "2005602977" },
  });

  const serviceChannelService = { client: property, service: name, problemCode, description };
  await createServiceChannelService(page, serviceChannelService);

  await createEvent(page, { name, addPhotos: true });

  await openFirstRow(page);
  await updateEvent(page, { status: "Complete" });
  await page.click("#open");

  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    page.click("#openInServiceChannel"),
  ]);
  await newPage.waitForLoadState();

  expect(process.env.SERVICE_CHANNEL_USERNAME).toBeDefined();
  expect(process.env.SERVICE_CHANNEL_PASSWORD).toBeDefined();
  await newPage.fill("#UserName", String(process.env.SERVICE_CHANNEL_USERNAME));
  await newPage.fill("#Password", String(process.env.SERVICE_CHANNEL_PASSWORD));
  await newPage.click("#LoginBtn");

  await expect(newPage.getByText("A) Full", { exact: true })).toBeVisible({
    timeout: 15 * 1000,
  });

  await expect(
    newPage.locator("#WorkOrderDetailsHeader").getByText(problemCode, { exact: true }),
  ).toBeVisible();
  await expect(
    newPage.locator("#WorkOrderDetailsHeader").getByText(description, { exact: true }),
  ).toBeVisible();

  const attachmentElements = await newPage
    .locator("#WorkOrderAttachments")
    .locator(".wo-attachments-link");
  await expect(attachmentElements).toHaveCount(12);

  await Promise.any([
    expect(
      newPage.locator("#WorkOrderDetailsHeader").getByText(statusPrimary, { exact: true }),
    ).toBeVisible(),
    expect(
      newPage.locator("#WorkOrderDetailsHeader").getByText("IN PROGRESS", { exact: true }),
    ).toBeVisible(),
  ]);

  await Promise.any([
    expect(
      newPage.locator("#WorkOrderDetailsHeader").getByText(statusExtended, { exact: true }),
    ).toBeVisible(),
    expect(
      newPage
        .locator("#WorkOrderDetailsHeader")
        .getByText("VALIDATION REQUIRED - TIMING", { exact: true }),
    ).toBeVisible(),
  ]);
});
