import { columns } from "./columns"
import { DataTable } from "./data-table"
import { getUserData } from "@/lib/db";

export default async function OriginalData() {
  const files = await getUserData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={files} />
    </div>
  )
}