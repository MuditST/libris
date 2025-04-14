import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="w-full min-h-screen grid place-items-center">
      {children}
    </div>
  );
};

export default Layout;
