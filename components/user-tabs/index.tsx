import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RevenueCard from "./balance-chart";
import { MoveDownLeft, MoveUpRight, Plus } from "lucide-react";

const TransactionCard = ({
  type,
}: {
  type: "income" | "expense" | "revenue";
}) => {
  const cardClasses = {
    income: "bg-green-950/20 border-green-300/20",
    expense: "bg-red-950/20 border-red-300/20",
    revenue: "bg-sky-900/10 border-sky-100/20",
  };

  const CardIcon =
    type === "income"
      ? MoveDownLeft
      : type === "expense"
      ? MoveUpRight
      : Plus;

  const cardIconClasses = {
    income: "bg-green-900/20",
    expense: "bg-red-900/20",
    revenue: "bg-sky-900/20",
  };

  return (
    <Card className={`h-fit col-span-1 ${cardClasses[type]} rounded-2xl`}>
      <CardContent className="flex gap-3 items-center p-3">
        <div
          className={`flex items-center justify-center p-4 rounded-full ${cardIconClasses[type]}`}
        >
          <CardIcon className="w-7 h-7" />
        </div>
        <div className="flex p-3 flex-col gap-2 justify-center">
          <div className="flex gap-2 items-center">
            <span className="text-xl font-bold">$12,000</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sm text-muted-foreground capitalize">
              {type}
            </span>
            <span
              className={`text-sm ${
                type === "income"
                  ? "text-green-500/50"
                  : type === "expense"
                  ? "text-red-500/50"
                  : "text-sky-500/50"
              }`}
            >
              +2.1%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function UserTabs() {
  return (
    <Tabs defaultValue="dashboard" className="mt-14">
      <TabsList className="grid w-full max-w-xl grid-cols-2 text-blue-50/70">
        <TabsTrigger
          value="dashboard"
          className="data-[state=active]:bg-neutral-900"
        >
          Dashboard
        </TabsTrigger>
        <TabsTrigger
          value="transactions"
          className="data-[state=active]:bg-neutral-900"
        >
          Transactions
        </TabsTrigger>
      </TabsList>
      <TabsContent
        value="dashboard"
        className="grid grid-cols-1 md:grid-cols-4 h-full gap-5 mt-8"
      >
        <Card className="bg-transparent border-none col-span-3 h-full">
          <CardContent className="p-0 h-full">
            <RevenueCard />
          </CardContent>
        </Card>
        <div className="flex flex-col gap-5">
          <TransactionCard type="income" />
          <TransactionCard type="expense" />
          <TransactionCard type="expense" />
          <TransactionCard type="revenue" />
        </div>
      </TabsContent>
      <TabsContent value="transactions">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              Here you can see all your transactions.
            </CardDescription>
          </CardHeader>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
