"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

import { api } from "@/trpc/react";
import { authClient } from "@/lib/auth-client";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { InvoiceTemplate } from "@/server/services/invoice-template";
import { type AppRouter } from "@/server/api/root";
import { type inferProcedureOutput } from "@trpc/server";

// Extend the type to ensure TS knows about productCost if strictly typed
type Invoices = inferProcedureOutput<AppRouter["order"]["getAllAdminSales"]>;
type SortKey = "createdAt_desc" | "createdAt_asc";

// Configuration for the chart colors and labels
const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  profit: {
    label: "Profit",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export default function ManageInvoicesPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [invoices, setInvoices] = useState<Invoices>([]);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");
  const [date, setDate] = useState<DateRange | undefined>();

  const { data: fetchedInvoices } = api.order.getAllAdminSales.useQuery(
    undefined,
    { enabled: !!session },
  );

  useEffect(() => {
    if (fetchedInvoices) {
      setInvoices(fetchedInvoices);
    }
  }, [fetchedInvoices]);

  // --- Filter and Sort Logic ---
  const filteredAndSortedInvoices = useMemo(() => {
    let result = [...invoices];

    if (date?.from) {
      const from = new Date(date.from);
      from.setHours(0, 0, 0, 0);
      const to = date.to ? new Date(date.to) : new Date(from);
      to.setHours(23, 59, 59, 999);

      result = result.filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return invoiceDate >= from && invoiceDate <= to;
      });
    }

    switch (sortKey) {
      case "createdAt_asc":
        return result.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "createdAt_desc":
      default:
        return result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [invoices, sortKey, date]);

  // --- Financial Calculations ---
  const { chartData, totalRevenue, totalProfit } = useMemo(() => {
    const dailyMap = new Map<
      string,
      { date: string; revenue: number; profit: number }
    >();
    let tRev = 0;
    let tProf = 0;

    // Iterate through filtered invoices to aggregate data
    filteredAndSortedInvoices.forEach((invoice) => {
      // 1. Calculate Invoice Financials
      const invoiceRevenue = parseFloat(invoice.totalAmount) || 0;

      // Calculate total cost of items in this invoice
      const invoiceCost = invoice.orderItems.reduce((acc, item) => {
        // @ts-ignore - Assuming productCost exists on item even if not in inferred type
        const cost = Number(item.productCost) || 0;
        return acc + cost * item.quantity;
      }, 0);

      const invoiceProfit = invoiceRevenue - invoiceCost;

      // 2. Add to Totals
      tRev += invoiceRevenue;
      tProf += invoiceProfit;

      // 3. Group by Date for Chart
      const dayKey = new Date(invoice.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }); // e.g., "Jan 12"

      const existing = dailyMap.get(dayKey);
      if (existing) {
        existing.revenue += invoiceRevenue;
        existing.profit += invoiceProfit;
      } else {
        dailyMap.set(dayKey, {
          date: dayKey,
          revenue: invoiceRevenue,
          profit: invoiceProfit,
        });
      }
    });

    // Convert map to array and sort by date (roughly)
    // Note: To sort chart data chronologically correctly, we might need the raw timestamp.
    // For simplicity, we rely on the fact that 'filteredAndSortedInvoices' is already sorted
    // if sortKey is 'createdAt_asc'. If it's desc, we flip it for the chart.

    let data = Array.from(dailyMap.values());

    // Ensure chart goes from Left (Old) to Right (New)
    // We check the sortKey state to decide if we need to reverse the array for the chart
    if (sortKey === "createdAt_desc") {
      data = data.reverse();
    }

    return { chartData: data, totalRevenue: tRev, totalProfit: tProf };
  }, [filteredAndSortedInvoices, sortKey]);

  const goToInvoice = (invoiceId: string) => {
    router.push(`/admin/sales/invoices/${invoiceId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Invoices & Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Manage sales and view financial performance.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-[260px] justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2">
            <Select
              value={sortKey}
              onValueChange={(value: SortKey) => setSortKey(value)}
            >
              <SelectTrigger className="h-9 w-full text-xs sm:w-40">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt_desc">Newest first</SelectItem>
                <SelectItem value="createdAt_asc">Oldest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <span className="text-muted-foreground text-xs">
              Selected Period
            </span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {totalRevenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <span className="text-muted-foreground text-xs">
              Selected Period
            </span>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "text-2xl font-bold",
                totalProfit >= 0 ? "text-green-600" : "text-red-600",
              )}
            >
              $
              {totalProfit.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/60">
            <tr className="text-left">
              <th className="px-4 py-2">Invoice ID</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredAndSortedInvoices.map((invoice) => (
              <tr
                key={invoice.id}
                onClick={() => goToInvoice(invoice.id)}
                tabIndex={0}
                className="hover:bg-muted/40 focus:bg-muted/40 cursor-pointer border-t transition-colors outline-none"
              >
                <td className="px-4 py-2 font-mono text-xs">
                  {invoice.id.slice(0, 8)}...
                </td>
                <td className="text-muted-foreground px-4 py-2 text-xs">
                  {new Date(invoice.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 font-medium">
                  $ {parseFloat(invoice.totalAmount).toFixed(2)}
                </td>
                <td className="px-4 py-2 text-xs">
                  {invoice.orderItems.length} items
                </td>

                <td className="px-4 py-2" onClick={(e) => e.stopPropagation()}>
                  <PDFDownloadLink
                    document={
                      <InvoiceTemplate
                        orderId={invoice.id}
                        date={new Date(invoice.createdAt)}
                        address={invoice.shippingAddress ?? ""}
                        items={invoice.orderItems.map((item) => ({
                          name: item.productName ?? "Unknown Product",
                          quantity: item.quantity,
                          price: Number(item.unitPrice) || 0,
                          discountPercent: Number(item.discountPercent) || 0,
                          subtotal: Number(item.subtotal) || 0,
                        }))}
                        total={Number(invoice.totalAmount) || 0}
                      />
                    }
                    fileName={`invoice-${invoice.id}.pdf`}
                    style={{ textDecoration: "none" }}
                  >
                    {({ loading }) => (
                      <Button variant="ghost" size="sm" className="h-8">
                        {loading ? "..." : "PDF"}
                      </Button>
                    )}
                  </PDFDownloadLink>
                </td>
              </tr>
            ))}

            {filteredAndSortedInvoices.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="text-muted-foreground px-4 py-8 text-center text-sm"
                >
                  No data found for this period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Chart Section */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Comparing Revenue vs. Profit for the selected date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="max-h-[400px] min-h-[200px] w-full"
            >
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                  name="Revenue"
                />
                <Bar
                  dataKey="profit"
                  fill="var(--color-profit)"
                  radius={[4, 4, 0, 0]}
                  name="Profit"
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
