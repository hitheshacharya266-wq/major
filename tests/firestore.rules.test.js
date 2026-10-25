import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertSucceeds, assertFails } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { before, after, test } from "node:test";

const PROJECT_ID = "service-aggregator-b2530";
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync("firestore.rules", "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

after(async () => {
  await testEnv?.cleanup();
});

test("unauthenticated users cannot read a private user document", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "users/test-user")));
});

test("a user can create their own basic user document", async () => {
  const db = testEnv.authenticatedContext("user-1").firestore();
  await assertSucceeds(
    setDoc(doc(db, "users/user-1"), {
      uid: "user-1",
      role: "user",
    })
  );
});

test("a user cannot create an admin user document", async () => {
  const db = testEnv.authenticatedContext("user-1").firestore();
  await assertFails(
    setDoc(doc(db, "users/user-1"), {
      uid: "user-1",
      role: "admin",
    })
  );
});

test("a user cannot read another user's private document", async () => {
  const db = testEnv.authenticatedContext("user-1").firestore();
  await assertFails(getDoc(doc(db, "users/user-2")));
});

test("a user cannot change their own role", async () => {
  const db = testEnv.authenticatedContext("user-1").firestore();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users/user-1"), {
      uid: "user-1",
      role: "user",
    });
  });
  await assertFails(updateDoc(doc(db, "users/user-1"), { role: "admin" }));
});
