// Firebase exports
export { auth, db } from "./config";
export { signInWithGoogle, signOut, onAuthChange } from "./auth";
export type { FirebaseUser } from "./auth";

// Firestore services
export * from "./firestore/users";
export * from "./firestore/establishments";
export * from "./firestore/clients";
