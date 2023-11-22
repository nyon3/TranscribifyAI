
// originalData.tsx
import { DataTable } from "./data-table";
import { getUserData } from "@/lib/db";
import { columns } from "./columns"
import ResultDisplay from "@/components/resultArea/SummarizeDisplay";

// const TranscriptionDisplay = dynamic(() => import('@/components/resultArea/TranscriptionDisplay'), {
//   ssr: false,
// });

export async function OriginalData() {
  const files = await getUserData();

  return (
    <div className="container mx-auto flex gap-5 py-10">
      <DataTable columns={columns} data={files} />
      <ResultDisplay />
    </div>
  );
}