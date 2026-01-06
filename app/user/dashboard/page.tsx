import getServerSession from "@/lib/getServerSession";

export default async function DashboardPage() {

  const session = await getServerSession();
  console.log("User session data:", session);

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-2 rounded-tl-2xl border border-neutral-200 bg-white p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        Dashboard
      </div>
    </div>
  );
}
