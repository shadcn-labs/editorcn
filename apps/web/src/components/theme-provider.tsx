"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ThemeProvider = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) => (
  <NextThemesProvider
    attribute="class"
    defaultTheme="light"
    enableSystem
    disableTransitionOnChange
    enableColorScheme
    {...props}
  >
    {children}
  </NextThemesProvider>
);
