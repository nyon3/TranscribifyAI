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
import { summarize, summarizingTranscribedAudioData } from "@/lib/summarize"
import { transcribeWithTime, transcribeWithHF } from "@/lib/transcribeWithTime"
import { dataProps, dataPropsForComponent } from "@/lib/db"

import React, { useContext } from 'react';
import { FileContext } from '@/components/FileIdContext';
import { stat } from "fs"
import { e } from "@vercel/blob/dist/put-96a1f07e"

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
  const { setText, setState } = useContext(FileContext);

  const handleSetText = (fileData: dataPropsForComponent) => {
    if (fileData.transcribedFiles) {
      // Access the text property directly from the transcribedFiles object
      setText(fileData.transcribedFiles.text);
      setState(fileData.transcribedFiles.summary);
    } else {
      // Handle the case where there is no transcription available
      setText("No transcription available.");
    }
  };

  const handleSummarize = async (state: string) => {
    if (state) {
      setState(state);
    } else {
      setState("No file selected.");
    }
  }



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
              const rowData: dataPropsForComponent = row.original as dataPropsForComponent;// C
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
                          onClick={async () => handleSetText(rowData)}
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
                          onClick={async () => transcribeWithHF(rowData)}
                        >Transcribe</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => transcribeWithTime(rowData)}
                        >Transcribe (Timestamp)</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={async () => {

                            summarizingTranscribedAudioData(rowData).then((res) => handleSetText(res))

                          }}
                        >Summarize</DropdownMenuItem>
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