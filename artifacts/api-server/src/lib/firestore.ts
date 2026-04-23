import { initializeApp, cert, getApps, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let app: App | undefined;
let dbInstance: Firestore | undefined;

function getApp(): App {
  if (app) return app;
  if (getApps().length) {
    app = getApps()[0]!;
    return app;
  }
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT env var is required");
  }
  let serviceAccount: unknown = JSON.parse(raw);
  if (typeof serviceAccount === "string") serviceAccount = JSON.parse(serviceAccount);
  app = initializeApp({
    credential: cert(serviceAccount as object),
  });
  return app;
}

export function fdb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getApp());
  }
  return dbInstance;
}

let counter = 0;
export function genId(): number {
  counter = (counter + 1) % 1000;
  return Date.now() * 1000 + counter;
}
