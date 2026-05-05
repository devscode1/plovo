import { getAdminDb } from "./lib/firebase/admin";

async function test() {
  try {
    const boardId = "rDMBysCGFnPi2yaOa3CS"; // from the user's logs

    const lastListSnapshot = await getAdminDb()
      .collection("lists")
      .where("boardId", "==", boardId)
      .orderBy("order", "desc")
      .limit(1)
      .get();

    console.log("Got snapshot:", lastListSnapshot.size);
  } catch (err) {
    console.error("Test failed:", err);
  }
}
test();
