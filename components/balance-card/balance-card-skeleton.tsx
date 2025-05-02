import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const BalanceCardSkeleton = () => {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-b flex flex-col from-red-600 via-yellow-600 to-purple-600 p-[1px] rounded-xl w-full shadow-2xl shadow-yellow-600/30">
        <Card className="w-full bg-zinc-800 border-zinc-700 rounded-xl">
          <CardContent className="py-4">
            <div className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full bg-zinc-700" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-24 bg-zinc-700" />
                  <Skeleton className="h-4 w-32 bg-zinc-700" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-5 w-16 bg-zinc-700 ml-auto" />
                <Skeleton className="h-4 w-20 bg-zinc-700 ml-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
