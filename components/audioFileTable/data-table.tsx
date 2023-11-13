"use client"

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { deleteFile } from "@/lib/delete"
import { transcribeFile } from "@/lib/transcribe"
import { dataProps } from "@/lib/db"

import React, { useContext } from 'react';
import { FileContext } from '@/components/FileIdContext';


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onFileSelect?: (fileId: any) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onFileSelect,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })
  const { setText } = useContext(FileContext);

  const handleSetText = (fileData: dataProps) => {
    console.log(fileData); // Add this to debug
    if (fileData.transcribedFiles.length > 0) {
      setText(fileData.transcribedFiles[0].text); // Use the text property
    } else {
      // Handle the case where there is no transcription available
      setText("No transcription available.");
    }
  };

  return (
    <div className="max-w-lg rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const rowData: dataProps = row.original as dataProps; // Cast the row data to your dataProps type
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => {
                    // Check if this is the column you want to make clickable
                    if (cell.column.id === 'name') { // Add check for onFileSelect
                      return (
                        <TableCell
                          key={cell.id}
                          // Use onClick handler only if onFileSelect is provided
                          onClick={() => handleSetText(rowData)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    } else {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    }
                  })}
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>Menu</DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuLabel>Command</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={async () => deleteFile(rowData)}>
                          Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => transcribeFile(rowData)}
                        >Transcribe</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                </TableRow>

              )
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
