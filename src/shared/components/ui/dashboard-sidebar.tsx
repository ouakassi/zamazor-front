import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FolderKanban, 
  LogOut,
  ChevronRight,
  Inbox,
  Home
} from 'lucide-react';

export type NavItemData = {
  id: string;
  title: string;
  icon: React.ElementType;
  badge?: number | string;
  shortcut?: string;
  children?: NavItemData[];
};

export type NavGroupData = {
  heading?: string;
  items: NavItemData[];
};

const mockNavGroups: NavGroupData[] = [
  {
    heading: 'Management',
    items: [
      { id: 'overview', title: 'Overview', icon: LayoutDashboard },
      { id: 'products', title: 'Products', icon: FolderKanban },
      { id: 'orders', title: 'Orders', icon: Inbox },
    ]
  }
];

const mockBottomItems: NavItemData[] = [
  { id: 'store', title: 'Storefront', icon: Home },
  { id: 'logout', title: 'Log out', icon: LogOut },
];

function WorkspaceSwitcher({ selected }: { selected?: string }) {
  const current = selected || 'Zamazor Store';

  return (
    <div className="flex items-center gap-3 px-2.5 py-2 mb-4 rounded-xl border border-slate-100/50 select-none bg-slate-50/50">
      <div className="w-8 h-8 rounded-lg bg-emerald-900 text-white flex items-center justify-center font-bold text-[13px] shadow-sm">
        {current.charAt(0)}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[13px] font-bold leading-none mb-1 text-slate-900 truncate max-w-[150px]">{current}</span>
        <span className="text-[10px] text-slate-500 leading-none font-medium">Admin Desk</span>
      </div>
    </div>
  );
}

function NavItem({ 
  item, 
  activeId, 
  onSelect,
  level = 0
}: { 
  item: NavItemData; 
  activeId: string; 
  onSelect: (id: string) => void;
  level?: number;
}) {
  const isActive = activeId === item.id;
  const isLogout = item.id === 'logout';
  const hasChildren = !!item.children;
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    if (hasChildren) {
      setIsOpen(!isOpen);
    } else {
      onSelect(item.id);
    }
  };

  return (
    <div className="flex flex-col w-full">
      <div 
        className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all duration-200 select-none active:scale-[0.99]
          ${isActive 
            ? 'bg-slate-100 text-slate-900 font-bold shadow-xs' 
            : isLogout
              ? 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
              : 'text-slate-600 hover:bg-slate-100/60 hover:text-slate-900'
          }
        `}
        style={{ paddingLeft: `${level * 12 + 12}px` }}
        onClick={handleClick}
      >
        <div className="flex items-center gap-2.5">
          <item.icon 
            className={`w-[16px] h-[16px] transition-colors duration-200
              ${isActive 
                ? 'text-emerald-800' 
                : isLogout
                  ? 'text-slate-400 group-hover:text-rose-500'
                  : 'text-slate-400 group-hover:text-slate-600'
              }
            `} 
            strokeWidth={1.75} 
          />
          <span className="text-[13px] tracking-wide truncate">
            {item.title}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {item.shortcut && (
             <kbd className="hidden group-hover:inline-flex items-center justify-center h-5 px-1.5 text-[10px] font-medium font-mono text-slate-400 bg-slate-50 border border-slate-200 rounded-[4px] shadow-xs">
               {item.shortcut}
             </kbd>
          )}
          {item.badge && (
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100">
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronRight 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} 
              strokeWidth={2}
            />
          )}
        </div>
      </div>

      {hasChildren && (
        <div 
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
        >
          <div className="overflow-hidden min-h-0 relative flex flex-col gap-0.5 mt-0.5">
            <div 
              className="absolute top-0 bottom-0 border-l border-slate-200"
              style={{ left: `${level * 12 + 19.5}px` }}
            />
            {item.children!.map(child => (
              <NavItem 
                key={child.id} 
                item={child} 
                activeId={activeId} 
                onSelect={onSelect} 
                level={level + 1} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SidebarNav({ 
  className = '',
  activeId,
  onSelect,
  activeWorkspace
}: { 
  className?: string,
  activeId?: string,
  onSelect?: (id: string) => void,
  activeWorkspace?: string
}) {
  const [internalId, setInternalId] = useState('overview');
  const currentId = activeId !== undefined ? activeId : internalId;
  const handleSelect = onSelect || setInternalId;

  return (
    <div className={`flex flex-col w-[260px] h-full bg-white text-slate-800 border-r border-slate-200/85 p-4 font-sans ${className}`}>
      <WorkspaceSwitcher selected={activeWorkspace} />

      <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col gap-4 mt-2">
        {mockNavGroups.map((group, idx) => (
          <div key={idx} className="flex flex-col gap-0.5">
            {group.heading && (
              <span className="px-3 mb-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.heading}
              </span>
            )}
            {group.items.map(item => (
              <NavItem 
                key={item.id} 
                item={item} 
                activeId={currentId} 
                onSelect={handleSelect} 
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-0.5">
        {mockBottomItems.map(item => (
          <NavItem 
            key={item.id} 
            item={item} 
            activeId={currentId} 
            onSelect={handleSelect} 
          />
        ))}
      </div>
    </div>
  );
}
