import { ReactNode } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type CrudTableProps<T> = {
  title: string;
  isLoading: boolean;
  isError?: boolean;
  headers: ReactNode[];
  items?: T[];
  renderRow: (item: T) => ReactNode;
  toolbar?: ReactNode;
  emptyState?: ReactNode;
};

export function CrudTable<T>({
  title,
  isLoading,
  isError,
  headers,
  items,
  renderRow,
  toolbar,
  emptyState,
}: CrudTableProps<T>) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {toolbar}
      </div>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong loading this data.</AlertDescription>
        </Alert>
      ) : !items || items.length === 0 ? (
        emptyState ?? <p className="text-muted-foreground">No data found.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h, idx) => (
                <TableHead key={idx}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>{items.map((i) => renderRow(i))}</TableBody>
        </Table>
      )}
    </div>
  );
}

