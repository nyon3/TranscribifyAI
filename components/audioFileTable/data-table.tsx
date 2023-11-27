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
import { deleteFile } from "@/lib/delete"
import { summarizingTranscribedAudioData } from "@/lib/summarize"
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

  return (
    <div className="max-w-lg rounded-md border">
      <Table>
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
                        <DropdownMenuItem onClick={() => deleteFile(rowData)}>
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => summarizingTranscribedAudioData(rowData)}>
                          Summarize
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