import { type ReactNode } from "react";
import { SnackbarProvider } from "notistack";

export const AppSnackbarProvider = ({ children }: { children: ReactNode }) => {
  return <SnackbarProvider maxSnack={3}>{children}</SnackbarProvider>;
};
