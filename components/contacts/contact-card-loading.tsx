export const ContactCardLoading = () => {
  return (
    <div>
      <div className="relative mb-6 px-6 pt-2">
        <div className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <div className="pl-9 border border-neutral-600 bg-neutral-800 rounded-md h-10 w-full animate-pulse" />
      </div>

      <div className="text-center py-12 h-[236px] overflow-y-auto flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-t-2 border-b-2 border-neutral-600 rounded-full animate-spin" />
      </div>
    </div>
  );
};
