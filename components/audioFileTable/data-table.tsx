"use client"

import React, { useContext } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { deleteFile } from "@/components/actions/delete"
import { summarizingTranscribedAudioData } from "@/components/actions/summarize"
import { dataPropsForComponent } from "@/lib/db"
import { FileContext } from '@/components/context/FileIdContext';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const { setText, setState, setLoading } = useContext(FileContext);

  const handleSetText = (fileData: dataPropsForComponent) => {
    if (fileData.transcribedFiles) {
      setText(fileData.transcribedFiles.text);
      setState(fileData.transcribedFiles.summary);
    } else {
      setText('');
      setState('');
    }
  };

  const handleDelete = async (fileData: dataPropsForComponent) => {
    setLoading(true);
    await deleteFile(fileData);
    setLoading(false);
  }
  const handleSummarize = async (fileData: dataPropsForComponent) => {
    setLoading(true);
    await summarizingTranscribedAudioData(fileData); // Wait for the summarizing process to complete
    setLoading(false);
  }

  const handleDownload = async (fileData: dataPropsForComponent) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/download?id=${fileData.name}`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileData.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      a.remove();
    } catch (error) {
      console.error('Error during fetch:', error);
    }
    setLoading(false);
  };


  return (
    <div className="rounded-md border">
      <Table className='w-80 h-full'>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map(row => {
              const rowData: dataPropsForComponent = row.original as dataPropsForComponent;
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  onClick={() => handleSetText(rowData)} // Set text and summary when clicking on any part of the row
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    // Add additional styling or an icon for the first column to indicate clickability
                    const isClickableCell = cellIndex === 0; // Assuming the first column is the clickable one
                    return (
                      <TableCell
                        key={cell.id}
                        className={isClickableCell ? "cursor-pointer hover:text-blue-500" : ""}
                        onClick={isClickableCell ? () => handleSetText(rowData) : undefined}
                      >
                        <div className="flex items-center"> {/* Use Flexbox to align items */}
                          {isClickableCell && <span className="mr-2">🔗</span>} {/* Add an icon or similar indicator before the cell content */}
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Command</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(rowData)}>
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSummarize(rowData)}>
                          Summarize
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload(rowData)}>
                          Download
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}