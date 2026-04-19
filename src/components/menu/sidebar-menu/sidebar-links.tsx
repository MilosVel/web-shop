import { Landmark, type LucideIcon, Settings, Settings2, Users, UserCheck, House, Sheet } from 'lucide-react';
import { usePathname } from "next/navigation";
import { groupBy } from '@/utils/common';
// import { useSidebar } from '@/hooks';
import { getBasePath } from '@/utils/path';
import { cn } from '@/utils/theme';
import { DollarSign } from 'lucide-react';

type AppLinkGroup = 'Overview';

export type AppLinkItem = {
  name: string;
  path: string;
  icon: LucideIcon;
  group: AppLinkGroup;
  // checkPolicy: (permissions: PermissionsGroups) => boolean;
};

export const initialSidebarLinks: AppLinkItem[] = [
  {
    name: 'Home',
    icon: House,
    path: '/',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.agent?.view_agent_list?.read, // this need to be adjusted
  },
  {
    name: 'Plan i izvrsenje',
    icon: Sheet,
    path: '/plan-i-izvrsenje',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.users?.all_users?.read,
  },
  {
    name: 'Spiri',
    icon: DollarSign,
    path: '/spiri',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.agent?.view_agent_list?.read, // this need to be adjusted
  },
  {
    name: 'Admin page',
    // icon: Settings,
    icon: UserCheck,
    path: '/admin',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.agent?.view_agent_list?.read, // this need to be adjusted
  },
  {
    name: 'Settings',
    icon: Settings,
    path: '/settings',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.company?.view_company_list?.read,
  },
  {
    name: 'Auth page',
    icon: Users,
    path: '/sign-up',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.users?.all_users?.read,
  },
  {
    name: 'Create Table',
    icon: Sheet,
    path: '/create-table',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.users?.all_users?.read,
  },
  {
    name: 'Sifarnici',
    icon: Settings2,
    path: '/sifarnici',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.users?.all_users?.read,
  },
  {
    name: 'Izvodi',
    icon: Settings2,
    path: '/izvodi',
    group: 'Overview',
    // checkPolicy: (permissions) => permissions?.users?.all_users?.read,
  },
];


type SidebarLinksProps = {
  onSidebarItemClick: (path: string) => VoidFunction;
};

export function SidebarLinks({ onSidebarItemClick }: SidebarLinksProps) {
  const pathname = usePathname();

  // const { sidebarAppLinks } = useSidebar();

  const sidebarAppLinks = groupBy(initialSidebarLinks, 'group');


  return (
    <ul className="flex flex-col gap-6">
      {sidebarAppLinks.map((group, index) => {
        return (
          <div key={group.title} className="mt-4 pb-3 3xl:mt-6">
            <h2
              className={cn(
                'mb-2 truncate px-6 text-xs font-normal uppercase tracking-widest 2xl:px-8',
                index !== 0 && 'mt-6 3xl:mt-7',
              )}
            >
              {group.title}
            </h2>
            <ul className="">
              {group.data.map((item) => {
                const Icon = item.icon;

                const currentItemBasePath = getBasePath(item.path);
                const isPathActive = pathname.startsWith(currentItemBasePath);
                return (
                  <li
                    key={item.name}
                    onClick={onSidebarItemClick(item.path)}
                    className={cn(
                      'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2 cursor-pointer',
                      isPathActive
                        ? 'before:top-2/5 text-primary before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                        : 'text-muted-foreground transition-colors duration-200 hover:bg-accent/50 hover:text-foreground',
                    )}
                  >
                    <div className="flex items-center truncate">
                      <Icon
                        className={cn(
                          'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                          isPathActive
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground',
                        )}
                        strokeWidth={1}
                      />
                      <span className="truncate">{item.name}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </ul>
  );
}
