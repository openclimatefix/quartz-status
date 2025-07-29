import { chromium } from "playwright";
import { ProviderStatusResponse } from "./index";

export async function checkEUMETSAT(): Promise<ProviderStatusResponse> {
  const epochNowMilliseconds = Date.now();
  const url = `https://masif.eumetsat.int/ossi/level3/seviri_rss_hr.json.html?NOCACHE_TS=${epochNowMilliseconds}`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle" });

    await page
      .locator("[id^='dataTable_seviri_rss_hr.json']")
      .first()
      .waitFor({ timeout: 5000, state: "attached" });

    const statusData = await page.evaluate(() => {
      const rows = Array.from(
        document.querySelectorAll(`[id^='dataTable_seviri_rss_hr.json'] tbody tr`)
      );
      if (rows.length === 0) {
        return {
          provider: "EUMETSAT",
          source: "9.5°E RSS MSG SEVIRI Level 1.5 Image Data [MET 11]",
          status: "unknown",
          statusMessage: "No Data Found"
        } as ProviderStatusResponse;
      }

      const result: ProviderStatusResponse = {
        provider: "EUMETSAT",
        source: "9.5°E RSS MSG SEVIRI Level 1.5 Image Data [MET 11]",
        status: "unknown",
        statusMessage: "Unknown"
      };

      const details = {
        complete: 0,
        incomplete: 0,
        onTime: 0,
        late: 0,
        undeliveredPlanned: 0,
        undeliveredUnplanned: 0,
        total: rows.length
      };

      // Use the images in the table to determine the status (yes, really)
      for (const row of rows) {
        const cells = row.querySelectorAll("td");
        if (cells.length < 5) continue;

        let deliveryStatus = "";
        const completeImg = cells[3].querySelector("img")?.getAttribute("src");
        if (completeImg && completeImg.includes("green")) {
          deliveryStatus = "complete";
        } else if (completeImg && completeImg.includes("yellow")) {
          deliveryStatus = "incomplete";
        } else if (completeImg && completeImg.includes("red")) {
          deliveryStatus = "unavailable-unplanned";
        } else if (completeImg && completeImg.includes("grey")) {
          deliveryStatus = "unavailable-planned";
        } else {
          deliveryStatus = "unknown";
        }

        let timelyStatus = "";
        const timelyImg = cells[4].querySelector("img")?.getAttribute("src");
        if (timelyImg && timelyImg.includes("green")) {
          timelyStatus = "onTime";
        } else if (timelyImg && timelyImg.includes("yellow")) {
          timelyStatus = "late";
        } else if (timelyImg && timelyImg.includes("red")) {
          timelyStatus = "unavailable-unplanned";
        } else if (timelyImg && timelyImg.includes("grey")) {
          timelyStatus = "unavailable-planned";
        } else {
          timelyStatus = "unknown";
        }

        if (deliveryStatus === "complete") {
          details.complete++;
        } else if (deliveryStatus === "incomplete") {
          details.incomplete++;
        } else if (timelyStatus === "onTime") {
          details.onTime++;
        } else if (timelyStatus === "late") {
          details.late++;
        } else if (
          deliveryStatus === "unavailable-unplanned" ||
          timelyStatus === "unavailable-unplanned"
        ) {
          details.undeliveredUnplanned++;
        } else if (
          deliveryStatus === "unavailable-planned" ||
          timelyStatus === "unavailable-planned"
        ) {
          details.undeliveredPlanned++;
        }
      }

      // Determine overall status based on counts
      if (
        details.undeliveredUnplanned === 0 &&
        details.incomplete === 0 &&
        details.late === 0 &&
        details.complete > 0
      ) {
        result.status = "ok";
        result.statusMessage = "OK: All data is available and on time";
      } else if (details.undeliveredUnplanned > 0) {
        result.status = "warning";
        result.statusMessage = "Warning: Some data is unavailable";
      } else if (details.incomplete > 0) {
        result.status = "warning";
        result.statusMessage = "Warning: Some data is incomplete";
      } else if (details.late > 0) {
        result.status = "warning";
        result.statusMessage = "Warning: Some data is late";
      } else if (details.complete === 0) {
        result.status = "error";
        result.statusMessage = "Error: No data available";
      }

      result.details = details;
      return result;
    });

    return statusData;
  } catch (err: Error | any) {
    return {
      provider: "EUMETSAT",
      source: "9.5°E RSS MSG SEVIRI Level 1.5 Image Data [MET 11]",
      status: "error",
      statusMessage: "Error",
      error: err.message
    };
  } finally {
    if (browser && browser.isConnected()) {
      await browser.close();
    }
  }
}
