"use client";

import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  UserIcon,
  SettingsIcon,
  BellIcon,
  LogOutIcon,
  CreditCardIcon,
  ReceiptText,
} from "lucide-react";
import { useRouter } from "next/navigation";

export const UserMenu = () => {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return;
  }

  if (!session?.user) {
    return (
      <>
        <Link
          href="/signup"
          className="rounded-full bg-gray-300 px-4 py-1.5 text-gray-900 transition hover:bg-gray-400"
        >
          Sign up
        </Link>

        <Link
          href="/login"
          className="rounded-full bg-black px-4 py-1.5 text-white transition hover:bg-gray-600"
        >
          Log in
        </Link>
      </>
    );
  }

  const listItems = [
    {
      icon: ReceiptText,
      property: "Order History",
      onClick: () => router.push("/orders"),
    },
    {
      icon: LogOutIcon,
      property: "Sign Out",
      onClick: () => {
        (authClient.signOut(), router.push("/"));
      },
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Avatar>
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name}
              className="h-8 w-8"
            />
            <AvatarFallback>{session.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuGroup>
          {listItems.map((item, index) => (
            <DropdownMenuItem
              key={index}
              className="cursor-pointer"
              onClick={item.onClick}
            >
              <item.icon />
              <span className="text-popover-foreground">{item.property}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
