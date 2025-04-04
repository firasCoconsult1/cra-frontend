export interface NavigationItem {
  id: string;
  title: string;
  type: 'item' | 'collapse' | 'group';
  translate?: string;
  icon?: string;
  hidden?: boolean;
  url?: string;
  classes?: string;
  exactMatch?: boolean;
  external?: boolean;
  target?: boolean;
  breadcrumbs?: boolean;

  children?: NavigationItem[];
}
export const NavigationItems: NavigationItem[] = [
  {
    id: 'navigation',
    title: 'Navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'account',
    title: 'User Panel',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'basic',
        title: 'Account',
        type: 'collapse',
        icon: 'feather icon-user',
        children: [
          {
            id: 'profile',
            title: 'Profile',
            type: 'item',
            url: '/profile',
            icon: 'feather icon-user'
          },
          {
            id: 'settings',
            title: 'Settings',
            type: 'item',
            url: '/settings',
            icon: 'feather icon-settings'
          },
          
        ]
      }
    ]
  },
  {
    id: 'Admin-panel',
    title: 'Admin Panel',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'role',
        title: 'Role Management',
        type: 'item',
        url: '/role',
        classes: 'nav-item',
        icon: 'feather icon-briefcase'
      },
      {
        id: 'resource',
        title: 'Resource Management',
        type: 'item',
        url: '/resource',
        classes: 'nav-item',
        icon: 'feather icon-users'
      }
    ]
  },
  
  {
    id: 'pages',
    title: 'Pages',
    type: 'group',
    icon: 'icon-pages',
    children: [
      {
        id: 'auth',
        title: 'Authentication',
        type: 'collapse',
        icon: 'feather icon-lock',
        children: [
          {
            id: 'signup',
            title: 'Sign up',
            type: 'item',
            url: '/auth/signup',
            target: true,
            breadcrumbs: false,
            icon: 'feather icon-user-plus'
          },
          {
            id: 'signin',
            title: 'Sign in',
            type: 'item',
            url: '/auth/signin',
            target: true,
            breadcrumbs: false,
            icon: 'feather icon-unlock'
          }
        ]
      },
     
    ]
  }
];
