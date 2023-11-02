import { getServerSession } from "next-auth";

export async function getUserId() {
  const session = await getServerSession();
  const userId = session?.user?.id;
  return userId;
}
