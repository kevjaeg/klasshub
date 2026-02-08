import type { PlatformId, PlatformInfo, PlatformAdapter } from "./types";
import { WebUntisAdapter } from "./adapters/webuntis";
import { IServAdapter } from "./adapters/iserv";
import { SchulmanagerAdapter } from "./adapters/schulmanager";
import { MoodleAdapter } from "./adapters/moodle";

// Platform metadata for UI
export const PLATFORMS: Record<PlatformId, PlatformInfo> = {
  webuntis: {
    id: "webuntis",
    name: "WebUntis",
    description: "Stundenplan und Vertretungen",
    color: "bg-orange-100 text-orange-800",
    fields: [
      {
        key: "server",
        label: "Server",
        placeholder: "z.B. neilo.webuntis.com",
        type: "text",
        required: true,
        helpText: "Findest du in der URL wenn du WebUntis öffnest",
      },
      {
        key: "school",
        label: "Schulkürzel",
        placeholder: "z.B. gym-musterstadt",
        type: "text",
        required: true,
        helpText: "Der Kurzname deiner Schule in WebUntis",
      },
    ],
  },
  iserv: {
    id: "iserv",
    name: "IServ",
    description: "Aufgaben, Stundenplan, Nachrichten",
    color: "bg-blue-100 text-blue-800",
    fields: [
      {
        key: "serverUrl",
        label: "IServ-URL deiner Schule",
        placeholder: "z.B. gym-musterstadt.de",
        type: "text",
        required: true,
        helpText: "Die Domain, über die du IServ erreichst",
      },
    ],
  },
  schulmanager: {
    id: "schulmanager",
    name: "Schulmanager Online",
    description: "Stundenplan, Briefe, Termine",
    color: "bg-green-100 text-green-800",
    fields: [],
  },
  moodle: {
    id: "moodle",
    name: "Moodle",
    description: "Kurse, Aufgaben, Noten",
    color: "bg-yellow-100 text-yellow-800",
    fields: [
      {
        key: "instanceUrl",
        label: "Moodle-URL deiner Schule",
        placeholder: "z.B. moodle.gym-musterstadt.de",
        type: "text",
        required: true,
        helpText: "Die URL der Moodle-Instanz deiner Schule",
      },
    ],
  },
};

// Adapter instances
const adapters: Record<PlatformId, PlatformAdapter> = {
  webuntis: new WebUntisAdapter(),
  iserv: new IServAdapter(),
  schulmanager: new SchulmanagerAdapter(),
  moodle: new MoodleAdapter(),
};

export function getAdapter(platformId: PlatformId): PlatformAdapter {
  const adapter = adapters[platformId];
  if (!adapter) {
    throw new Error(`Unknown platform: ${platformId}`);
  }
  return adapter;
}

export function getPlatformInfo(platformId: PlatformId): PlatformInfo {
  return PLATFORMS[platformId];
}

export function getAllPlatforms(): PlatformInfo[] {
  return Object.values(PLATFORMS);
}
