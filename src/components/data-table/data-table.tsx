"use client";

import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";

import { DEFAULT_PAGE_SIZE } from "@/components/data-table/consts";
import { Button } from "@/components/ui/button";
import { HStack, VStack } from "@/components/ui/stack";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  totalRowCount?: number;
  className?: string;
  paginationParam?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  totalRowCount,
  className,
  paginationParam: _paginationParam,
}: DataTableProps<TData, TValue>) {
  // This causes the table sorting, filtering etc to not work:
  // https://github.com/shadcn-ui/ui/issues/3905
  // https://github.com/TanStack/table/issues/5903
  // eslint-disable-next-line react-compiler/react-compiler
  "use no memo";

  const paginationParam = _paginationParam ?? "page";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const [paginationState, setPaginationState] = useState(() => ({
    pageIndex: searchParams.get(paginationParam)
      ? Number.parseInt(searchParams.get(paginationParam) as string)
      : 0,
    pageSize: DEFAULT_PAGE_SIZE,
  }));

  useEffect(() => {
    const page = searchParams.get(paginationParam)
      ? Number.parseInt(searchParams.get(paginationParam) as string)
      : 0;
    const paginationStatePage = paginationState.pageIndex;

    if (page !== paginationStatePage) {
      router.push(
        `${pathname}?${createQueryString(paginationParam, paginationStatePage.toString())}`,
      );
    }
  }, [
    searchParams,
    paginationState,
    router,
    pathname,
    createQueryString,
    paginationParam,
  ]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    onPaginationChange: setPaginationState,
    rowCount: totalRowCount ?? -1,
    state: {
      sorting,
      pagination: paginationState,
    },
  });

  return (
    <VStack className="gap-6">
      <div className={cn("rounded-md border", className)}>
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
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <HStack justify="end">
        <Button
          variant="ghost"
          onClick={() => {
            table.firstPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            table.previousPage();
          }}
          disabled={!table.getCanPreviousPage()}
        >
          {"<"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            table.nextPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          {">"}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            table.lastPage();
          }}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </Button>
      </HStack>
    </VStack>
  );
}
