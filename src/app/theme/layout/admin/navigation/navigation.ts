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
    translate: 'nav.navigation',
    type: 'group',
    icon: 'icon-navigation',
    children: [
     /* {
        id: 'dashboard',
        title: 'Dashboard',
        translate: 'nav.dashboard',
        type: 'item',
        url: '/dashboard',
        icon: 'feather icon-home',
        classes: 'nav-item'
      },*/
      {
        id: 'accueil',
        title: 'Accueil',
        translate: 'nav.accueil',
        type: 'item',
        url: '/accueil',
        icon: 'feather icon-home',
        classes: 'nav-item'
      }
    ]
  },
  {
    id: 'user panel',
    title: 'User Panel',
    translate: 'nav.userPanel',
    type: 'group',
    icon: 'icon-ui',
    children: [
      {
        id: 'account',
        title: 'Account',
        translate: 'nav.account',
        type: 'collapse',
        icon: 'feather icon-user',
        children: [
          {
            id: 'profile',
            title: 'Profile',
            translate: 'nav.profile',
            type: 'item',
            url: '/profile',
            icon: 'feather icon-user'
          },
          {
            id: 'settings',
            title: 'Settings',
            translate: 'nav.settings',
            type: 'item',
            url: '/settings',
            icon: 'feather icon-settings'
          }
        ],
      },
      {
        id: 'cra',
        title: 'Cra management',
        translate: 'nav.cra',
        type: 'collapse',
        icon: 'feather icon-file-text',
        children: [
          {
            id: 'cra',
            title: 'Cra',
            type: 'item',
            url: '/cra',
            icon: 'feather icon-file-text'
          },
          {
            id: 'absence',
            title: 'Absence',
            translate: 'nav.absence',
            type: 'item',
            url: '/absence',
            icon: 'feather icon-user-x'
          },
          {
            id: 'frais',
            title: 'Frais',
            translate: 'nav.frais',
            type: 'item',
            url: '/listeFactures',
            icon: 'feather icon-credit-card'
          }
        ]
      },
    ]
  },
  {
    id: 'Admin-panel',
    title: 'Admin Panel',
    translate: 'nav.adminPanel',
    type: 'group',
    icon: 'icon-group',
    children: [
      {
        id: 'role',
        title: 'Role Management',
        translate: 'nav.role',
        type: 'item',
        url: '/role',
        classes: 'nav-item',
        icon: 'feather icon-briefcase'
      },
      {
        id: 'resource',
        title: 'Resource Management',
        translate: 'nav.resource',
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
    translate: 'nav.pages',
    type: 'group',
    icon: 'icon-pages',
    children: [
      {
        id: 'auth',
        title: 'Authentication',
        translate: 'nav.auth',
        type: 'collapse',
        icon: 'feather icon-lock',
        children: [
          {
            id: 'signup',
            title: 'Sign up',
            translate: 'nav.signup',
            type: 'item',
            url: '/auth/signup',
            target: true,
            breadcrumbs: false,
            icon: 'feather icon-user-plus'
          },
          {
            id: 'signin',
            title: 'Sign in',
            translate: 'nav.signin',
            type: 'item',
            url: '/auth/signin',
            target: true,
            breadcrumbs: false,
            icon: 'feather icon-unlock'
          }
        ]
      }
    ]
  }
];
