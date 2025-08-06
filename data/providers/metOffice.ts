import fetch from "node-fetch";
import * as cheerio from "cheerio";
import { ProviderStatus, ProviderStatusResponse } from "./index";

export async function checkMetOffice(): Promise<ProviderStatusResponse> {
  const url = "https://datahub.metoffice.gov.uk/support/service-status";
  const statusPageUrl =
    "https://datahub.metoffice.gov.uk/support/model-run-status/atmospheric#mo-uk";
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    let status: ProviderStatus = "unknown";
    let statusMessage = "Unknown";
    const parentMatch: string[] = [];

    $("div.status-overview div.status").each((_, el) => {
      const text = $(el).text().trim();
      if (
        text.includes("UK 2km") ||
        text.includes("UK 2 km") ||
        text.includes("UK 2 km (Standard)")
      ) {
        // Add child with class "status-indicator" if it exists
        const statusIndicator = $(el).find(".status-indicator").text().trim();
        if (statusIndicator.length) {
          parentMatch.push(statusIndicator);
        }
      }
    });

    if (parentMatch.length > 0) {
      // Typically the line is something like "UK 2 km (Standard) Operational"
      const parts = parentMatch[0].split(/\s{2,}|\s(?=[A-Za-z])/).map((s) => s.trim());
      // Last token is status
      statusMessage = parts[parts.length - 1];
      if (statusMessage.toLowerCase().includes("operational")) {
        status = "ok";
        // TODO: Need to check what these status messages actually are other than "operational"
      } else if (statusMessage.toLowerCase().includes("warning")) {
        status = "warning";
      } else if (
        statusMessage.toLowerCase().includes("error") ||
        statusMessage.toLowerCase().includes("unavailable")
      ) {
        status = "error";
      }
    }

    return {
      provider: "Met Office",
      source: "UK 2 km (Standard)",
      status,
      statusMessage,
      url,
      statusPageUrl
    };
  } catch (err: Error | any) {
    return {
      provider: "Met Office",
      source: "UK 2 km (Standard)",
      status: "error",
      statusMessage: "Error",
      url,
      statusPageUrl,
      error: err.message
    };
  }
}
