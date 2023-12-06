
// originalData.tsx
import { DataTable } from "./data-table";
import { getUserData } from "@/lib/db";
import { columns } from "./columns"
import ResultDisplay from "@/components/SummarizeDisplay";

// const TranscriptionDisplay = dynamic(() => import('@/components/resultArea/TranscriptionDisplay'), {
//   ssr: false,
// });

export async function OriginalData() {
  const files = await getUserData();

  return (
    <div className="h-screen container flex gap-5">
      <DataTable columns={columns} data={files} />
      <ResultDisplay />
    </div>
  );
}