import {
  LayoutDashboard,
  Package,
  BookOpen,
  Boxes,
  Truck,
  Users,
  ShoppingCart,
  Layers,
  Warehouse,
  TrendingUp,
  Factory,
  PackageCheck,
  Receipt,
  RotateCcw,
  CreditCard,
  UserCog,
  Wallet,
  BarChart3,
  PiggyBank,
  LineChart,
  Store,
  ClipboardList,
  PackageOpen,
} from 'lucide-react';

/** Sidebar groups. Each item: { label, href, icon, roles? } (roles omitted = all). */
export const NAV = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard }],
  },
  {
    group: 'Masters',
    items: [
      { label: 'Products', href: '/products', icon: Package },
      { label: 'Recipe / BOM', href: '/recipe-bom', icon: BookOpen },
      { label: 'Raw Materials', href: '/raw-materials', icon: Boxes },
      { label: 'Vendors', href: '/vendors', icon: Truck },
      { label: 'Customers', href: '/customers', icon: Users },
    ],
  },
  {
    group: 'Purchasing',
    items: [
      { label: 'Purchase Entry', href: '/purchases', icon: ShoppingCart },
      { label: 'Raw Material Stock', href: '/stock/raw-materials', icon: Warehouse },
      { label: 'Price Trends', href: '/price-trends', icon: TrendingUp },
    ],
  },
  {
    group: 'Production',
    items: [
      { label: 'Production Entry', href: '/production', icon: Factory },
      { label: 'Finished Stock', href: '/stock/finished', icon: PackageCheck },
    ],
  },
  {
    group: 'Sales',
    items: [
      { label: 'Sales Entry', href: '/sales', icon: Receipt },
      { label: 'Returns', href: '/returns', icon: RotateCcw },
      { label: 'Credit / Udhaar', href: '/credit-udhaar', icon: CreditCard },
      { label: 'Delivery Charges', href: '/delivery-charges', icon: PackageOpen, roles: ['admin', 'manager', 'accountant'] },
    ],
  },
  {
    group: 'Wholesale (B2B)',
    items: [
      { label: 'Wholesale Clients', href: '/b2b/clients', icon: Store, roles: ['admin', 'manager'] },
      { label: 'Wholesale Orders', href: '/b2b/orders', icon: ClipboardList, roles: ['admin', 'manager', 'sales'] },
    ],
  },
  {
    group: 'Team',
    items: [
      { label: 'Team & Attendance', href: '/team', icon: UserCog },
      { label: 'Salary & Expenses', href: '/salary-expenses', icon: Wallet, roles: ['admin', 'manager', 'accountant'] },
    ],
  },
  {
    group: 'Reports',
    items: [
      { label: 'Sales Report', href: '/reports/sales', icon: BarChart3, roles: ['admin', 'manager', 'accountant'] },
      { label: 'Profit & Loss', href: '/reports/profit-loss', icon: LineChart, roles: ['admin', 'manager', 'accountant'] },
      { label: 'Investment & ROI', href: '/investment', icon: PiggyBank, roles: ['admin'] },
    ],
  },
];
