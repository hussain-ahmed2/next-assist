import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions/auth.action";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export default function PendingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-linear-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Account Status&nbsp;
        </p>
      </div>

      <div className="mt-12 text-center">
        <Badge variant="secondary" className="mb-4">Approval Needed</Badge>
        <h1 className="text-4xl font-bold mb-4">Hello! Your registration is pending.</h1>
        <p className="text-muted-foreground mb-8">
          An administrator needs to approve your access for this organization before you can enter the workspace.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Home</Link>
          </Button>
          <form action={signOutAction}>
            <Button type="submit" variant="destructive">
              Log Out
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
