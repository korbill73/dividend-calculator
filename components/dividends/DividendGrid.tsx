"use client";

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    CellContext,
    RowData,
} from "@tanstack/react-table";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StockItem, useFinanceStore } from "@/store/useFinanceStore";
import { useState, useEffect } from "react";
import { Trash2, Plus } from "lucide-react";

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}

// --- Editable Cell Component ---
const EditableCell = ({
    getValue,
    row,
    column,
    table,
}: CellContext<StockItem, unknown>) => {
    const initialValue = getValue();
    const [value, setValue] = useState<string | number>(initialValue as string | number);
    const [isEditing, setIsEditing] = useState(false);

    // When the input is blurred, we'll save the data
    const onBlur = () => {
        setIsEditing(false);
        table.options.meta?.updateData(row.index, column.id, value);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setIsEditing(false);
            table.options.meta?.updateData(row.index, column.id, value);
        }
    };

    useEffect(() => {
        setValue(initialValue as string | number);
    }, [initialValue]);

    if (isEditing) {
        return (
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                autoFocus
                className="h-8 w-full bg-background font-mono text-center px-1"
                type={typeof initialValue === 'number' ? 'number' : 'text'}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[20px] flex items-center justify-center font-mono text-xs md:text-sm"
        >
            {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
    );
};

// --- Month Cell specific for array handling ---
const EditableMonthCell = ({
    row,
    column,
    table,
}: CellContext<StockItem, unknown>) => {
    const monthIndex = parseInt(column.id.replace('month_', ''));
    const initialValue = row.original.monthlyDividends[monthIndex];
    const [value, setValue] = useState<string | number>(initialValue);
    const [isEditing, setIsEditing] = useState(false);

    const onBlur = () => {
        setIsEditing(false);
        // We need to construct the full array to update
        const newMonthly = [...row.original.monthlyDividends];
        newMonthly[monthIndex] = Number(value);
        table.options.meta?.updateData(row.index, 'monthlyDividends', newMonthly);
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            onBlur();
        }
    };

    useEffect(() => {
        setValue(initialValue);
    }, [initialValue]);

    if (isEditing) {
        return (
            <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onBlur={onBlur}
                onKeyDown={onKeyDown}
                autoFocus
                className="h-8 min-w-[60px] bg-background font-mono text-right px-1 text-xs"
                type="number"
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            className="cursor-pointer hover:bg-muted/50 p-1 rounded min-h-[20px] text-right font-mono text-xs"
        >
            {Number(value) > 0 ? Number(value).toLocaleString() : "-"}
        </div>
    );
};

export function DividendGrid() {
    const { portfolio, updateItem, removeItem, addItem } = useFinanceStore();
    const [data, setData] = useState<StockItem[]>([]);

    useEffect(() => {
        setData(portfolio);
    }, [portfolio]);

    const columns: ColumnDef<StockItem>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: EditableCell,
            size: 150,
        },
        {
            accessorKey: "ticker",
            header: "Ticker",
            cell: EditableCell,
            size: 80,
        },
        {
            accessorKey: "quantity",
            header: "Qty",
            cell: EditableCell,
            size: 70,
        },
        {
            accessorKey: "currentPrice",
            header: "Price",
            cell: EditableCell,
            size: 80,
        },
        {
            accessorKey: "dividendYield",
            header: "Yield(%)",
            cell: EditableCell,
            size: 70,
        },
        // Monthly columns
        ...Array.from({ length: 12 }).map((_, i) => ({
            id: `month_${i}`,
            header: `${i + 1}월`,
            cell: EditableMonthCell,
            size: 60,
        })),
        {
            id: 'actions',
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => removeItem(row.original.id)} className="h-6 w-6 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            ),
            size: 50
        }
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        meta: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateData: (rowIndex: number, columnId: string, value: any) => {
                const row = data[rowIndex];
                const updates = { [columnId]: value };
                updateItem(row.id, updates);
            },
        },
    });

    const handleAddRow = () => {
        const newItem: StockItem = {
            id: crypto.randomUUID(),
            name: "New Stock",
            ticker: "TICKER",
            quantity: 0,
            currentPrice: 0,
            dividendYield: 0,
            monthlyDividends: Array(12).fill(0)
        }
        addItem(newItem);
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-primary">Portfolio Grid</h2>
                <Button onClick={handleAddRow} size="sm" className="gap-2">
                    <Plus className="h-4 w-4" /> Add Stock
                </Button>
            </div>
            <div className="rounded-md border border-border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} style={{ width: header.column.getSize() }}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
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
        </div>
    );
}
