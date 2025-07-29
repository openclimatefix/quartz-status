import fetch from "node-fetch";
import { ProviderStatus, ProviderStatusResponse } from "./index";

type ECMWFStatusResponse = {
  status: [
    {
      node: {
        Title: string;
        Status: string;
      };
    }
  ];
};
export async function checkECMWF(): Promise<ProviderStatusResponse> {
  // ECMWF DISSEMINATION service status check
  try {
    const res = await fetch("https://apps.ecmwf.int/status/status/DISSEMINATION");
    const json = (await res.json()) as ECMWFStatusResponse;

    const statusMessage = json.status[0].node.Status || "Unknown";
    let status: ProviderStatus = "unknown";
    if (statusMessage.toLowerCase().includes("ok")) {
      status = "ok";
      // TODO: Need to check what these status messages actually are other than "ok"
    } else if (statusMessage.toLowerCase().includes("warning")) {
      status = "warning";
    } else if (
      statusMessage.toLowerCase().includes("error") ||
      statusMessage.toLowerCase().includes("unavailable")
    ) {
      status = "error";
    }

    return { provider: "ECMWF", source: "UK", status, statusMessage };
  } catch (err: Error | any) {
    return {
      provider: "ECMWF",
      source: "UK",
      status: "error",
      statusMessage: "Error",
      error: err.message
    };
  }
}
