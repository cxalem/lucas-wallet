import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingScreen() {
  return (
    <section className="flex flex-col items-center min-h-screen text-zinc-100">
      <Card className="w-full max-w-3xl shadow-lg border-neutral-50/10 bg-neutral-800 max-h-[60vh]">
        <CardHeader className="border-b border-neutral-600 pb-3">
          <CardTitle className="flex items-center gap-2">
            <Skeleton className="h-3 w-3 rounded-full bg-neutral-700" />
            <Skeleton className="h-5 w-40 bg-neutral-700" />
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-[30vh] overflow-y-auto p-6 space-y-6">
            {/* Skeleton for AI message */}
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[80%]">
                <Skeleton className="h-8 w-8 rounded-full bg-neutral-700 flex-shrink-0" />
                <Skeleton className="h-16 w-64 rounded-lg bg-neutral-700 rounded-tl-none" />
              </div>
            </div>

            {/* Skeleton for user message */}
            <div className="flex justify-end">
              <div className="flex gap-3 max-w-[80%] flex-row-reverse">
                <Skeleton className="h-8 w-8 rounded-full bg-neutral-700 flex-shrink-0" />
                <Skeleton className="h-12 w-48 rounded-lg bg-neutral-700 rounded-tr-none" />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-neutral-600 p-4">
          <div className="w-full bg-neutral-700 rounded-3xl px-6 py-3 border border-neutral-50/20">
            <div className="flex w-full gap-2 mb-2">
              <Skeleton className="flex-1 h-8 bg-neutral-600 rounded" />
              <Skeleton className="h-8 w-8 bg-neutral-200 rounded-full" />
            </div>
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-6 w-32 bg-neutral-600 rounded-full" />
              <Skeleton className="h-6 w-32 bg-neutral-600 rounded-full" />
              <Skeleton className="h-6 w-24 bg-neutral-600 rounded-full" />
            </div>
          </div>
        </CardFooter>
      </Card>
    </section>
  );
}
