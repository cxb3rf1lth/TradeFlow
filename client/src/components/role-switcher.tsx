import { useState } from "react";
import { Button } from "@/components/ui/button";
import { User, UserCog } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type UserRole = "executive" | "pa";

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export function RoleSwitcher({ currentRole, onRoleChange }: RoleSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" data-testid="button-role-switcher">
          {currentRole === "pa" ? (
            <>
              <UserCog className="h-4 w-4 mr-2" />
              PA Mode
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Executive
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Switch Role (Demo)</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={() => onRoleChange("executive")}
          data-testid="menu-role-executive"
        >
          <User className="h-4 w-4 mr-2" />
          Executive
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onRoleChange("pa")}
          data-testid="menu-role-pa"
        >
          <UserCog className="h-4 w-4 mr-2" />
          Virtual PA
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
