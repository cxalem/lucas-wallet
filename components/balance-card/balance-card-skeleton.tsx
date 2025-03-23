export const BalanceCardSkeleton = () => {
  return (
    <div className="bg-gradient-to-b flex flex-col from-red-600 h-full via-yellow-600 to-purple-600 p-[1px] rounded-xl w-full shadow-2xl shadow-yellow-600/30">
      <div className="p-6 flex flex-col justify-between bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl h-full">
        {/* User welcome section skeleton */}
        <div className="space-y-2">
          <div className="h-9 bg-neutral-700/50 rounded-lg w-3/4 animate-pulse" />
          <div className="h-5 bg-neutral-700/50 rounded-lg w-full animate-pulse" />
        </div>

        {/* Balance display section skeleton */}
        <section className="space-y-3 rounded-lg">
          <div className="h-6 bg-neutral-700/50 rounded-lg w-1/3 animate-pulse" />
          <div className="flex justify-between place-items-end">
            <div className="space-y-2">
              <div className="h-10 bg-neutral-700/50 rounded-lg w-40 animate-pulse" />
            </div>
            <div className="h-7 bg-neutral-700/50 rounded-lg w-28 animate-pulse" />
          </div>
        </section>
      </div>
    </div>
  );
};
