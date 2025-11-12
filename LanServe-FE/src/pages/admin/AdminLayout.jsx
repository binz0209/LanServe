import React, { useState } from "react";
import { Outlet, Link, useLocation, Navigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  FileText,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  // Check admin role
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const isAdmin = user?.role === "Admin";

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { name: "Người dùng", icon: Users, path: "/admin/users" },
    { name: "Dự án", icon: FolderKanban, path: "/admin/projects" },
    { name: "Đơn hàng", icon: FileText, path: "/admin/contracts" },
    { name: "Banners", icon: FileText, path: "/admin/banners" },
    { name: "Thống kê", icon: BarChart3, path: "/admin/statistics" },
    { name: "Cài đặt", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar - Fixed */}
      <aside
        className={`bg-slate-800 text-white transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-0"
        } flex flex-col fixed left-0 top-0 h-full z-40`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <h1 className="text-xl font-bold">LanServe Admin</h1>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden hover:bg-slate-700 p-1 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu - Scrollable */}
        <nav className="flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-slate-700 transition-colors ${
                  isActive ? "bg-slate-700 border-r-4 border-blue-500" : ""
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content - Scrollable */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isSidebarOpen ? "ml-64" : "ml-0"
      }`}>
        {/* Top Bar - Fixed */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden hover:bg-gray-100 p-2 rounded"
          >
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <span className="text-sm font-medium">Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
