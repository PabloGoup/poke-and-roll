<!-- Design System -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-container-high": "#dfeaef",
                    "on-error-container": "#93000a",
                    "inverse-on-surface": "#e7f3f7",
                    "primary-fixed-dim": "#ffb3b0",
                    "inverse-surface": "#283236",
                    "tertiary-fixed-dim": "#4bddb7",
                    "surface-container": "#e4f0f4",
                    "error-container": "#ffdad6",
                    "secondary-fixed": "#dde4e6",
                    "on-surface": "#131d21",
                    "surface-dim": "#d1dce0",
                    "background": "#f1fbff",
                    "surface-container-low": "#eaf5fa",
                    "tertiary-fixed": "#6dfad2",
                    "on-error": "#ffffff",
                    "on-primary-fixed": "#410006",
                    "secondary-fixed-dim": "#c1c8ca",
                    "surface-bright": "#f1fbff",
                    "surface": "#f1fbff",
                    "on-tertiary-fixed": "#002018",
                    "tertiary-container": "#00b08d",
                    "outline": "#8c706f",
                    "on-primary-container": "#6d0010",
                    "on-secondary": "#ffffff",
                    "outline-variant": "#e0bfbd",
                    "on-background": "#131d21",
                    "surface-tint": "#ae2f34",
                    "on-surface-variant": "#584140",
                    "primary": "#ae2f34",
                    "on-tertiary-fixed-variant": "#005140",
                    "tertiary": "#006b55",
                    "surface-container-highest": "#d9e4e9",
                    "primary-container": "#ff6b6b",
                    "surface-container-lowest": "#ffffff",
                    "error": "#ba1a1a",
                    "secondary-container": "#dae1e3",
                    "inverse-primary": "#ffb3b0",
                    "on-tertiary-container": "#003b2e",
                    "on-secondary-fixed-variant": "#41484a",
                    "on-secondary-container": "#5d6466",
                    "secondary": "#586062",
                    "on-primary-fixed-variant": "#8c1520",
                    "on-secondary-fixed": "#161d1f",
                    "surface-variant": "#d9e4e9",
                    "on-primary": "#ffffff",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#ffdad8"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "base": "4px",
                    "xl": "32px",
                    "margin-desktop": "32px",
                    "gutter": "24px",
                    "lg": "24px",
                    "xs": "4px",
                    "margin-mobile": "16px",
                    "sm": "8px",
                    "md": "16px"
            },
            "fontFamily": {
                    "display-lg-mobile": ["Inter"],
                    "headline-sm": ["Inter"],
                    "code": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-md": ["Inter"],
                    "display-lg": ["Inter"],
                    "body-lg": ["Inter"],
                    "label-md": ["Inter"]
            },
            "fontSize": {
                    "display-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
                    "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                    "code": ["13px", {"lineHeight": "18px", "fontWeight": "500"}],
                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .active-tab {
            font-variation-settings: 'FILL' 1;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body-md min-h-screen pb-20 md:pb-0 md:pl-[280px]">
<!-- Navigation Drawer (Desktop Shell) -->
<aside class="hidden md:flex fixed left-0 top-0 h-full z-[60] flex flex-col p-md bg-surface-container-low dark:bg-inverse-surface h-full w-[280px] rounded-r-xl shadow-xl dark:shadow-none">
<div class="mb-xl px-sm">
<h1 class="font-headline-md text-headline-md font-bold text-primary">SushiPoke AI</h1>
</div>
<nav class="flex-1 flex flex-col gap-xs">
<a class="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant dark:hover:bg-secondary-container transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="group">group</span>
<span class="font-body-lg text-body-lg">Agent Overview</span>
</a>
<a class="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant dark:hover:bg-secondary-container transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="insights">insights</span>
<span class="font-body-lg text-body-lg">Performance</span>
</a>
<a class="flex items-center gap-md px-md py-sm rounded-lg bg-primary-fixed dark:bg-primary-fixed-dim text-on-primary-fixed dark:text-on-primary-fixed-variant font-bold transition-colors duration-200" href="#">
<span class="material-symbols-outlined active-tab" data-icon="chat_bubble" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
<span class="font-body-lg text-body-lg">Inbox</span>
</a>
<a class="flex items-center gap-md px-md py-sm rounded-lg text-on-surface-variant dark:text-secondary-fixed-dim hover:bg-surface-variant dark:hover:bg-secondary-container transition-colors duration-200" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-body-lg text-body-lg">Settings</span>
</a>
</nav>
<div class="mt-auto border-t border-outline-variant pt-md px-sm">
<div class="flex items-center gap-md">
<div class="w-10 h-10 rounded-full bg-primary-container overflow-hidden">
<img alt="Sushi Manager" class="w-full h-full object-cover" data-alt="A professional headshot of a sushi restaurant manager with a clean, friendly expression. The lighting is warm and inviting, set against a modern restaurant background. The aesthetic is clean, corporate, and minimalist with soft focal depth." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjohJuLtj08fE_OxEzXyF2UKTBS5aOh4Kxg28xoM2qNztIKMMEaAKApfu_mJGT7W50F_sDdVFLdITuj4XpBnwMrnuYlzdoSYTXTQitnR-OXmM9rXXLWYcY0CtSLskS4JJq4q7c1Amfyn3nCiZm5XsSl2x_T6-IMUVRMJFCNSp42NJgfxHhb8qj7vPJlND9MhaAgC_MX9_0kYTXHl0Nqzzj47bZ4UqKN3vM5EPSXLywlSdbVPQXHbihCT6I9hAEITkEoeILbhc0G0Y"/>
</div>
<div>
<p class="font-label-md text-on-surface font-bold">Sushi Manager</p>
<p class="text-xs text-on-surface-variant">Admin Access</p>
</div>
</div>
</div>
</aside>
<!-- Top App Bar (Mobile Context) -->
<header class="md:hidden sticky top-0 z-50 flex justify-between items-center w-full px-margin-mobile h-16 bg-surface dark:bg-surface-dim border-b border-outline-variant dark:border-outline">
<div class="flex items-center gap-sm">
<div class="w-8 h-8 rounded-full bg-primary-container overflow-hidden">
<img alt="Agent profile photo" class="w-full h-full object-cover" data-alt="A close-up portrait of a customer service agent wearing a headset, smiling warmly. The image is styled with professional studio lighting, emphasizing a modern tech-forward atmosphere with soft-focus office elements in the background and a vibrant salmon-toned color palette." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD7lwHB_gc506z5izG3xnfsFzF-NahjynJcBIo4X8xHnaQOeiht0Cxs0Y7XanbRmPVgnK3vuHF5Hi8av9gm3LjooSMOLZd13MBVIlghewDmQ_JTBDMI1Shbhb21vQmbBFtlDstpoP38zcW5R1SqIpXQB-rLt6h-Y4cdslJBqxM-g7XI-_UhyzuCjnjD5LMP-fsaZq2HaFIrJ-1MR3NSo3Bsr2W8Nt2VyyD7nRZboCKl8DqsGS_TEO9rcWV7aOEor-q2xr9B2uZ1wGc"/>
</div>
<span class="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">SushiPoke AI</span>
</div>
<button class="text-primary hover:bg-surface-container-low p-2 rounded-full transition-transform active:scale-95">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
</header>
<!-- Main Content Area -->
<main class="max-w-5xl mx-auto p-margin-mobile md:p-xl space-y-md">
<!-- Header & Search -->
<section class="space-y-md">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-md">
<h2 class="font-headline-md text-headline-md text-on-surface">Unified Inbox</h2>
<div class="relative flex-1 md:max-w-sm">
<span class="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline" data-icon="search">search</span>
<input class="w-full h-10 pl-10 pr-4 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none" placeholder="Search conversations..." type="text"/>
</div>
</div>
<!-- Filter Chips -->
<div class="flex gap-sm overflow-x-auto pb-2 no-scrollbar">
<button class="px-md py-xs rounded-full bg-primary text-on-primary text-label-md whitespace-nowrap">All Messages</button>
<button class="px-md py-xs rounded-full bg-surface-container text-on-surface-variant text-label-md whitespace-nowrap hover:bg-surface-container-high transition-colors">WhatsApp</button>
<button class="px-md py-xs rounded-full bg-surface-container text-on-surface-variant text-label-md whitespace-nowrap hover:bg-surface-container-high transition-colors">Instagram</button>
<button class="px-md py-xs rounded-full bg-surface-container text-on-surface-variant text-label-md whitespace-nowrap hover:bg-surface-container-high transition-colors">Escalated</button>
</div>
</section>
<!-- Chat List (Bento-ish Grid / Professional List) -->
<div class="grid grid-cols-1 gap-base">
<!-- Chat Item 1 -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md hover:bg-surface-container transition-all cursor-pointer">
<div class="relative">
<img alt="Customer" class="w-12 h-12 rounded-full object-cover bg-surface-container-high" data-alt="A stylized portrait of a female customer with a vibrant, modern look. The lighting is soft and flat, consistent with a clean UI design. The background is a solid pale teal, and the overall style is professional and friendly." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCYBQKN3CEQYMC2LJIMtRLjOiWTmed2NNmcIiiLDSOdLHLyAfnNXTDeXwhk8isSv4BkwobgQ6FHaZMtMuwqC8HLAMKGb0zxcHdTA9Rua3BmNNkQZd_ZGNd6lGQBzZv8sVG91HjG93nRVU2e7sLgqVMa6a4IPeeBP522K2lewUgRd64gYadpxo_o2LnuXfhDJXNEcl3ji1u-MXwgdxWPs7Qj7s3xhQ9JP9YoYWi24R_KnZbsMK7dzgA8OjIx3AY27w84k_e55OXOAE"/>
<div class="absolute -bottom-1 -right-1 bg-[#25D366] text-white rounded-full p-1 border-2 border-surface-container-lowest">
<svg class="w-3 h-3" fill="currentColor" viewbox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.277l-.582 2.128 2.183-.573c.953.524 1.954.801 3.147.801 3.181 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.767-5.766zm3.375 8.203c-.147.415-.844.762-1.133.791-.245.025-.53.039-1.571-.395-1.072-.446-1.791-1.427-1.845-1.5-.054-.073-.439-.584-.439-1.127 0-.543.284-.81.385-.921.102-.11.221-.138.294-.138.074 0 .147.001.211.004.068.003.16.002.243.202.101.243.348.849.378.91.031.062.05.133.01.21-.04.077-.058.12-.119.189-.061.068-.127.153-.183.205-.064.059-.131.124-.056.252.075.127.334.55.717.89.493.437.91.573 1.037.637.129.064.203.053.28-.034.077-.087.329-.385.418-.517.087-.133.176-.11.296-.065.12.046.76.358.892.424.131.066.218.1.25.154.032.054.032.312-.115.727z"></path></svg>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="font-bold text-on-surface truncate">Sofia Rodriguez</h3>
<span class="text-xs text-on-surface-variant">14:20</span>
</div>
<p class="text-body-md text-on-surface-variant truncate">¿Tienen promociones para el combo de 30 piezas hoy?</p>
<div class="flex items-center gap-sm mt-2">
<span class="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded uppercase">Agente Ventas</span>
<div class="flex items-center gap-1 text-[10px] text-on-tertiary-container bg-tertiary-fixed px-2 py-0.5 rounded-full">
<span class="w-1.5 h-1.5 bg-tertiary rounded-full animate-pulse"></span>
                            Respondiendo
                        </div>
</div>
</div>
</div>
<!-- Chat Item 2 -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md hover:bg-surface-container transition-all cursor-pointer">
<div class="relative">
<img alt="Customer" class="w-12 h-12 rounded-full object-cover bg-surface-container-high" data-alt="A portrait of a male customer with a tech-savvy vibe, wearing glasses and a minimalist grey shirt. The background is a soft workspace. The image lighting is natural, bright, and professional, maintaining the corporate modern aesthetic of the brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCUhvUoae12JKTVz3tuZy24qGTmdy57Bh-FJtVFdTpJlfTko-h9Ne25rI-sAxH91eM8BKGL0lsJh-6CzUm1DG-UODVHVZB-gAncVS94CWTsr5kq0qUJtdSmwoAXl5EKxp3XYqb0SY8bFpSf_38I9O-d9IFy4RUB_gjOK9MihEozCCDpHDoV2s6Xb7rB8TqhXQfHc88DPZ3ZA5qKqkj1iHP_dCnr2wU_56S-l8TD57RavvXRvBDVpeOHL90LuGg2RHOKXU0cY3Up72s"/>
<div class="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white rounded-full p-1 border-2 border-surface-container-lowest">
<svg class="w-3 h-3" fill="currentColor" viewbox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"></path></svg>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="font-bold text-on-surface truncate">Marco Polo</h3>
<span class="text-xs text-on-surface-variant">10:05</span>
</div>
<p class="text-body-md text-on-surface-variant truncate">The delivery is running 15 minutes late. Any update?</p>
<div class="flex items-center gap-sm mt-2">
<span class="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded uppercase">Agente Logística</span>
<div class="flex items-center gap-1 text-[10px] text-on-error-container bg-error-container px-2 py-0.5 rounded-full">
<span class="w-1.5 h-1.5 bg-error rounded-full"></span>
                            Esperando
                        </div>
</div>
</div>
</div>
<!-- Chat Item 3 -->
<div class="group bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md hover:bg-surface-container transition-all cursor-pointer">
<div class="relative">
<img alt="Customer" class="w-12 h-12 rounded-full object-cover bg-surface-container-high" data-alt="A portrait of a cheerful female customer, featuring bright colors and a high-key lighting setup. The background is slightly blurred to keep the focus on the user. The style is sleek, contemporary, and aligned with premium software interface design." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5U5lZo1Ar9AErQhaGByfWYMUn8y6c1Qbd5IlcbsEA9sqQ-68_oFzv8AVbfaJk7_ZpTG_kkMQweUcJKEOhzWyJ35JbU_pqYLIes4yHW2ARpLPoxMh36e-PxTs5y8c7xBTHgIZV8IBHN0oPolRfn8KgbEGi6yaOprv38lYZZJSgrKjo40rP5ZKvjNyKHftjSHUE13aJDI2_sc1NcqPUQYw_d1uCcJOdKo6p36J9yY6TsLENimTsxkHQuCstlIdDte0gaw8PjVzmGXQ"/>
<div class="absolute -bottom-1 -right-1 bg-[#25D366] text-white rounded-full p-1 border-2 border-surface-container-lowest">
<svg class="w-3 h-3" fill="currentColor" viewbox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.277l-.582 2.128 2.183-.573c.953.524 1.954.801 3.147.801 3.181 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.767-5.766zm3.375 8.203c-.147.415-.844.762-1.133.791-.245.025-.53.039-1.571-.395-1.072-.446-1.791-1.427-1.845-1.5-.054-.073-.439-.584-.439-1.127 0-.543.284-.81.385-.921.102-.11.221-.138.294-.138.074 0 .147.001.211.004.068.003.16.002.243.202.101.243.348.849.378.91.031.062.05.133.01.21-.04.077-.058.12-.119.189-.061.068-.127.153-.183.205-.064.059-.131.124-.056.252.075.127.334.55.717.89.493.437.91.573 1.037.637.129.064.203.053.28-.034.077-.087.329-.385.418-.517.087-.133.176-.11.296-.065.12.046.76.358.892.424.131.066.218.1.25.154.032.054.032.312-.115.727z"></path></svg>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-start mb-1">
<h3 class="font-bold text-on-surface truncate">Elena Vance</h3>
<span class="text-xs text-on-surface-variant">Yesterday</span>
</div>
<p class="text-body-md text-on-surface-variant truncate">Thank you! The poke bowl was delicious.</p>
<div class="flex items-center gap-sm mt-2">
<span class="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2 py-0.5 rounded uppercase">Admin</span>
<div class="flex items-center gap-1 text-[10px] text-on-secondary-fixed-variant bg-secondary-fixed px-2 py-0.5 rounded-full">
<span class="w-1.5 h-1.5 bg-secondary rounded-full"></span>
                            Escalado
                        </div>
</div>
</div>
</div>
</div>
</main>
<!-- Floating Action Button -->
<button class="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-50">
<span class="material-symbols-outlined" data-icon="campaign">campaign</span>
</button>
<!-- Bottom Nav Bar (Mobile Shell) -->
<nav class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline rounded-t-xl shadow-lg dark:shadow-none h-16">
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high transition-all" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-label-md text-label-md">Dashboard</span>
</a>
<a class="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-md py-xs scale-90 transition-all duration-150" href="#">
<span class="material-symbols-outlined" data-icon="chat_bubble" style="font-variation-settings: 'FILL' 1;">chat_bubble</span>
<span class="font-label-md text-label-md">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high transition-all" href="#">
<span class="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
<span class="font-label-md text-label-md">Menu</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high transition-all" href="#">
<span class="material-symbols-outlined" data-icon="calendar_today">calendar_today</span>
<span class="font-label-md text-label-md">Planner</span>
</a>
</nav>
<script>
        // Simple micro-interaction for list items
        document.querySelectorAll('.group').forEach(item => {
            item.addEventListener('mousedown', () => {
                item.style.transform = 'scale(0.98)';
            });
            item.addEventListener('mouseup', () => {
                item.style.transform = 'scale(1)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        });
    </script>
</body></html>

<!-- Centro de Mensajería -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-container-high": "#dfeaef",
                    "on-error-container": "#93000a",
                    "inverse-on-surface": "#e7f3f7",
                    "primary-fixed-dim": "#ffb3b0",
                    "inverse-surface": "#283236",
                    "tertiary-fixed-dim": "#4bddb7",
                    "surface-container": "#e4f0f4",
                    "error-container": "#ffdad6",
                    "secondary-fixed": "#dde4e6",
                    "on-surface": "#131d21",
                    "surface-dim": "#d1dce0",
                    "background": "#f1fbff",
                    "surface-container-low": "#eaf5fa",
                    "tertiary-fixed": "#6dfad2",
                    "on-error": "#ffffff",
                    "on-primary-fixed": "#410006",
                    "secondary-fixed-dim": "#c1c8ca",
                    "surface-bright": "#f1fbff",
                    "surface": "#f1fbff",
                    "on-tertiary-fixed": "#002018",
                    "tertiary-container": "#00b08d",
                    "outline": "#8c706f",
                    "on-primary-container": "#6d0010",
                    "on-secondary": "#ffffff",
                    "outline-variant": "#e0bfbd",
                    "on-background": "#131d21",
                    "surface-tint": "#ae2f34",
                    "on-surface-variant": "#584140",
                    "primary": "#ae2f34",
                    "on-tertiary-fixed-variant": "#005140",
                    "tertiary": "#006b55",
                    "surface-container-highest": "#d9e4e9",
                    "primary-container": "#ff6b6b",
                    "surface-container-lowest": "#ffffff",
                    "error": "#ba1a1a",
                    "secondary-container": "#dae1e3",
                    "inverse-primary": "#ffb3b0",
                    "on-tertiary-container": "#003b2e",
                    "on-secondary-fixed-variant": "#41484a",
                    "on-secondary-container": "#5d6466",
                    "secondary": "#586062",
                    "on-primary-fixed-variant": "#8c1520",
                    "on-secondary-fixed": "#161d1f",
                    "surface-variant": "#d9e4e9",
                    "on-primary": "#ffffff",
                    "on-tertiary": "#ffffff",
                    "primary-fixed": "#ffdad8"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "base": "4px",
                    "xl": "32px",
                    "margin-desktop": "32px",
                    "gutter": "24px",
                    "lg": "24px",
                    "xs": "4px",
                    "margin-mobile": "16px",
                    "sm": "8px",
                    "md": "16px"
            },
            "fontFamily": {
                    "display-lg-mobile": ["Inter"],
                    "headline-sm": ["Inter"],
                    "code": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-md": ["Inter"],
                    "display-lg": ["Inter"],
                    "body-lg": ["Inter"],
                    "label-md": ["Inter"]
            },
            "fontSize": {
                    "display-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
                    "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                    "code": ["13px", {"lineHeight": "18px", "fontWeight": "500"}],
                    "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                    "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                    "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                    "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                    "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}]
            }
          },
        },
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e0bfbd; border-radius: 10px; }
        .active-pill { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background font-body-md text-body-md overflow-x-hidden">
<!-- Top AppBar -->
<header class="bg-surface dark:bg-surface-dim text-primary dark:text-primary-fixed-dim docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows flex justify-between items-center w-full px-margin-mobile h-16 sticky z-40">
<div class="flex items-center gap-md">
<img alt="Agent profile photo" class="w-10 h-10 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiHC8GeYt4S_ktFtsg-WuK1nTqlJPo0w4hJLXeX5qeNZLxTvT8F8rirwHFLMZbgLE9jmWcdrGhstoIsA9mPc9oO2Rp3qrWdJkGMVMp4gLRGZ1ujM66xmYFd9LZ3X3Q67VLf_mlWFcGJGrGTsY2r969IySB6DEhU_W1emF-HiV-53mjiz5ZPhIurzGmXPrAzlILlNjooyFTYwcrYoZn3QbadHI3JfDeIVkB2jmN_uFHkyMz2s1LnMCSZnx3_qDApHZ-qIBxbYQjVFo"/>
<span class="font-display-lg-mobile text-display-lg-mobile font-bold text-primary dark:text-primary-fixed-dim">SushiPoke AI</span>
</div>
<div class="flex items-center gap-md">
<button class="material-symbols-outlined text-on-surface-variant hover:bg-surface-container-low p-sm rounded-full transition-transform active:scale-95">notifications</button>
<div class="hidden md:flex gap-md">
<span class="text-primary font-bold border-b-2 border-primary px-sm py-xs">Menu</span>
<span class="text-on-surface-variant hover:text-primary px-sm py-xs cursor-pointer transition-colors">Analytics</span>
<span class="text-on-surface-variant hover:text-primary px-sm py-xs cursor-pointer transition-colors">Agents</span>
</div>
</div>
</header>
<main class="max-w-7xl mx-auto px-margin-mobile md:px-margin-desktop py-lg pb-32">
<!-- Search & Action Row -->
<section class="flex flex-col md:flex-row md:items-center justify-between gap-md mb-lg">
<div class="relative flex-1 max-w-md">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" placeholder="Search products or promos..." type="text"/>
</div>
<button class="bg-primary-container text-on-primary-container px-lg py-3 rounded-xl font-bold flex items-center justify-center gap-sm shadow-md hover:brightness-110 active:scale-95 transition-all">
<span class="material-symbols-outlined">add_circle</span>
                Crear Promo
            </button>
</section>
<!-- Category Filters -->
<nav class="flex gap-sm overflow-x-auto pb-md no-scrollbar mb-lg">
<button class="active-pill bg-primary text-on-primary px-lg py-2 rounded-full whitespace-nowrap font-bold">All Items</button>
<button class="active-pill bg-surface-container text-on-surface-variant px-lg py-2 rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors">Rolls</button>
<button class="active-pill bg-surface-container text-on-surface-variant px-lg py-2 rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors">Poke</button>
<button class="active-pill bg-surface-container text-on-surface-variant px-lg py-2 rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors">Combos</button>
<button class="active-pill bg-surface-container text-on-surface-variant px-lg py-2 rounded-full whitespace-nowrap hover:bg-surface-container-high transition-colors">Promos</button>
</nav>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
<!-- Featured Promo Card (Spans 2 columns on large) -->
<div class="lg:col-span-2 relative overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest group">
<div class="absolute top-4 left-4 z-10 bg-tertiary-container text-on-tertiary-container px-md py-1 rounded-full text-label-md font-bold uppercase tracking-wider">Active Promo</div>
<div class="h-48 w-full relative">
<img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" data-alt="A top-down professional food photograph of a deluxe sushi platter on a minimalist dark stone surface. The lighting is soft and cinematic, highlighting the vibrant oranges of salmon and greens of avocado. The aesthetic is modern corporate, clean, and high-contrast, perfectly capturing the premium efficiency of the SushiPoke AI brand." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAG1jjlReX9oLdwRkhcYfhT23_X977Gn8YN5lu6NaWGlYcRXh5psjCxecrZkf2rAq-yyneQOmSRlW0AVigISFT3zTUswfkcqyaZT-w4cKo33Grv9KEwDfqOmKoTXZpylJ41RuXOtdPJBGq1mDk-13PgcrTuYB4mGBlCmBxlETROEDeWNbr4LlaF3HR7Lg7NO_266PJyY7jddfvkNjRG18lsavRrnAuEYW2SdOhc-INPJuYFKLcwFzdggknS7L0JTU96TkkkFYajSzc"/>
</div>
<div class="p-md flex flex-col justify-between">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-xs">Omakase Platter XL</h3>
<p class="text-on-surface-variant mb-md">32 pieces of chef-selected premium rolls and nigiri. Perfect for events.</p>
</div>
<div class="flex items-center justify-between border-t border-outline-variant pt-md">
<div class="flex flex-col">
<span class="text-label-md text-on-surface-variant line-through">$85.00</span>
<span class="text-headline-md text-headline-md text-primary font-bold">$69.99</span>
</div>
<div class="flex items-center gap-sm">
<span class="text-label-md font-bold text-on-surface-variant">Disponibilidad</span>
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
</div>
</div>
</div>
<!-- Standard Product Card 1 -->
<div class="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden group">
<div class="h-40 relative">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="A close-up high-resolution shot of fresh Salmon Nigiri on a white ceramic plate. The texture of the fish is glistening and detailed. The background is a clean, bright kitchen environment with soft morning light, following the brand's tech-forward and pristine visual identity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiBYIDZNNUIsuFkt5Bzmt4IvCSJqC9_JxoDvp5oXwZjqYzQhjHSYCwaBIzPjCbBSrYc0YjXl3cjOeRGTC_4208vi3eKvxMPBfdFGcPYQ6zBQt-GxbFy7kJKFa9LJxlSIVYywUWH6CEUMCyKvz4wif6F0SlNttkIyGmGzAr2I7BH7N8-PoAMJbP32b6xzs7TQ69aprhbvJ08VhTGvsBzU4hg-7toNZlHCHpdWWhd_rYcKE9Ak1IAnpfuEdw5PY4s6L3yX31h3eI7t4"/>
</div>
<div class="p-md flex-1 flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface">Spicy Salmon Roll</h4>
<span class="text-label-md text-on-surface-variant mb-md">Category: Rolls</span>
<div class="mt-auto pt-md border-t border-outline-variant flex items-center justify-between">
<span class="text-headline-sm text-headline-sm text-secondary font-bold">$14.50</span>
<div class="flex items-center gap-xs">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
</div>
</div>
</div>
<!-- Standard Product Card 2 -->
<div class="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden group">
<div class="h-40 relative">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="A vibrant Poke Bowl with tuna, edamame, and radish slices. The colors are punchy and fresh. Minimalist overhead composition against a light grey background with soft shadows, embodying the efficient and commercial personality of the sushi management platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNMH_C6ONFH8Y2ZLc8Tkq2KpHg3Uex7ZqXEnvKKNqlNa1vkNjJ9e6R6m7ohmwt9RxdAkgtVrQBo2DD5z9vHC-dCAiFPEPftMapZfg9SsyZnKOOW0IKUTHx6chVKYBqqrsHAT1vF9cZS-aioYTRGFzAkEusWhc4899FZaxGdd4R0FHnKa-A0Ag9skYv7FKflq1SLy8pDZP2nO9tMKM47IGmJez1YY35PEwS4by3_Uzv67WbTDaL2V2beNyMLmP59dGBnyPs6dRp-ro"/>
</div>
<div class="p-md flex-1 flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface">Ahi Tuna Poke</h4>
<span class="text-label-md text-on-surface-variant mb-md">Category: Poke</span>
<div class="mt-auto pt-md border-t border-outline-variant flex items-center justify-between">
<span class="text-headline-sm text-headline-sm text-secondary font-bold">$18.90</span>
<div class="flex items-center gap-xs">
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
</div>
</div>
</div>
<!-- Dashboard Style Stats Card (Inventory Status) -->
<div class="rounded-xl border border-outline-variant bg-secondary-fixed-dim p-md flex flex-col justify-center items-center text-center">
<span class="material-symbols-outlined text-[48px] text-on-secondary-fixed-variant mb-sm">inventory_2</span>
<h5 class="text-label-md font-bold text-on-secondary-fixed-variant uppercase">Inventory Health</h5>
<span class="text-display-lg text-display-lg font-bold text-on-secondary-fixed">94%</span>
<p class="text-body-md text-on-secondary-fixed-variant">6 items currently out of stock across all categories.</p>
</div>
<!-- Standard Product Card 3 -->
<div class="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden group">
<div class="h-40 relative">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="California Rolls presented on a bamboo board. Close-up macro photography showing the texture of sesame seeds and crab meat. The style is bright and airy, using the primary salmon accents of the design system for the garnish, ensuring brand consistency." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFfS-DNX8Fffv4lUpn7e2Spe342m92r0ulh0CPjn-yetaG3LwxLIYQvoso8S3Qy_Obg-y5wyyQynWcvjHCpkxQwdbWJ5Huxiosfx2dX47mZuiDCrxuKNXW3aK2bg4QL5wlzVoKnHifCTeDfoIalnJjjBnhw5oh3t7VFtpp3BnNp8QdQTYkF09Yvr5CMCjsLwGswD7lCya9b078exlgTFdIeC2vpYncHQbiTo3UmC7HoNxx7bKO2jNyHjHR_QA1460fMKBR4-0QuX8"/>
</div>
<div class="p-md flex-1 flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface">California Classic</h4>
<span class="text-label-md text-on-surface-variant mb-md">Category: Rolls</span>
<div class="mt-auto pt-md border-t border-outline-variant flex items-center justify-between">
<span class="text-headline-sm text-headline-sm text-secondary font-bold">$12.00</span>
<div class="flex items-center gap-xs">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
</div>
</div>
</div>
<!-- Standard Product Card 4 -->
<div class="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden group">
<div class="h-40 relative">
<img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" data-alt="Modern Dragon Roll with eel and avocado slices drizzled with sauce. Vibrant, sharp focus on the front piece with a creamy bokeh background. High-key lighting that emphasizes the cleanliness of a high-end sushi kitchen." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEzqS9YQthhxt_DzhBRva-f1yuG76C6nhtH3ytpFGfc6dGv3EK2ysNb6HLq7Ntynb1HAlxwKstWoEZ9F3AKasLqaNVbw_b4TWloaBI6MNpy0Y9706LfBHSA0WM5Lp6UaR4dyyjFaBIAq12CjARoQPHXr70GaT42Wpv4hCX79c7Xq168OmihNScxLfuxPKQSVo0sgkuiyAoebygfc6bojLX42fqAC-kYICdCK3r_xhFDRa9nc8aPRbG-m4rM2ArZCYK3Y6vDf7bxFw"/>
</div>
<div class="p-md flex-1 flex flex-col">
<h4 class="font-headline-sm text-headline-sm text-on-surface">Dragon Tempura</h4>
<span class="text-label-md text-on-surface-variant mb-md">Category: Rolls</span>
<div class="mt-auto pt-md border-t border-outline-variant flex items-center justify-between">
<span class="text-headline-sm text-headline-sm text-secondary font-bold">$16.20</span>
<div class="flex items-center gap-xs">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox"/>
<div class="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
</div>
</div>
</div>
<!-- Add New Card (Empty State Trigger) -->
<button class="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl p-md group hover:bg-surface-container transition-all">
<div class="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:scale-110 transition-transform">
<span class="material-symbols-outlined">add</span>
</div>
<span class="mt-md font-bold text-on-surface-variant">Add New Product</span>
</button>
</div>
</main>
<!-- Bottom NavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline shadow-lg dark:shadow-none rounded-t-xl h-20 md:hidden">
<div class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high dark:hover:bg-secondary cursor-pointer transition-all active:scale-90 duration-150">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-md text-label-md">Dashboard</span>
</div>
<div class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high dark:hover:bg-secondary cursor-pointer transition-all active:scale-90 duration-150">
<span class="material-symbols-outlined">chat_bubble</span>
<span class="font-label-md text-label-md">Inbox</span>
</div>
<div class="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-md py-xs shadow-md active:scale-90 transition-all duration-150">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">restaurant_menu</span>
<span class="font-label-md text-label-md">Menu</span>
</div>
<div class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high dark:hover:bg-secondary cursor-pointer transition-all active:scale-90 duration-150">
<span class="material-symbols-outlined">calendar_today</span>
<span class="font-label-md text-label-md">Planner</span>
</div>
</nav>
<!-- Floating Action Button for Desktop Quick Access -->
<button class="hidden md:flex fixed bottom-8 right-8 bg-primary text-on-primary w-14 h-14 rounded-full shadow-xl items-center justify-center active:scale-95 transition-all z-50">
<span class="material-symbols-outlined">inventory</span>
</button>
<script>
        // Simple Interaction logic
        document.querySelectorAll('.active-pill').forEach(pill => {
            pill.addEventListener('click', function() {
                document.querySelectorAll('.active-pill').forEach(p => {
                    p.classList.remove('bg-primary', 'text-on-primary');
                    p.classList.add('bg-surface-container', 'text-on-surface-variant');
                });
                this.classList.remove('bg-surface-container', 'text-on-surface-variant');
                this.classList.add('bg-primary', 'text-on-primary');
            });
        });

        // Availability Toggle Toast Simulation
        document.querySelectorAll('input[type="checkbox"]').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const state = this.checked ? 'Available' : 'Unavailable';
                console.log(`Product state updated to: ${state}`);
                // In a real app, this would trigger an API call
            });
        });
    </script>
</body></html>

<!-- Catálogo de Productos -->
<!DOCTYPE html>

<html class="light" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>SushiPoke AI - Content Planner</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
    tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          "colors": {
            "surface-container-high": "#dfeaef",
            "on-error-container": "#93000a",
            "inverse-on-surface": "#e7f3f7",
            "primary-fixed-dim": "#ffb3b0",
            "inverse-surface": "#283236",
            "tertiary-fixed-dim": "#4bddb7",
            "surface-container": "#e4f0f4",
            "error-container": "#ffdad6",
            "secondary-fixed": "#dde4e6",
            "on-surface": "#131d21",
            "surface-dim": "#d1dce0",
            "background": "#f1fbff",
            "surface-container-low": "#eaf5fa",
            "tertiary-fixed": "#6dfad2",
            "on-error": "#ffffff",
            "on-primary-fixed": "#410006",
            "secondary-fixed-dim": "#c1c8ca",
            "surface-bright": "#f1fbff",
            "surface": "#f1fbff",
            "on-tertiary-fixed": "#002018",
            "tertiary-container": "#00b08d",
            "outline": "#8c706f",
            "on-primary-container": "#6d0010",
            "on-secondary": "#ffffff",
            "outline-variant": "#e0bfbd",
            "on-background": "#131d21",
            "surface-tint": "#ae2f34",
            "on-surface-variant": "#584140",
            "primary": "#ae2f34",
            "on-tertiary-fixed-variant": "#005140",
            "tertiary": "#006b55",
            "surface-container-highest": "#d9e4e9",
            "primary-container": "#ff6b6b",
            "surface-container-lowest": "#ffffff",
            "error": "#ba1a1a",
            "secondary-container": "#dae1e3",
            "inverse-primary": "#ffb3b0",
            "on-tertiary-container": "#003b2e",
            "on-secondary-fixed-variant": "#41484a",
            "on-secondary-container": "#5d6466",
            "secondary": "#586062",
            "on-primary-fixed-variant": "#8c1520",
            "on-secondary-fixed": "#161d1f",
            "surface-variant": "#d9e4e9",
            "on-primary": "#ffffff",
            "on-tertiary": "#ffffff",
            "primary-fixed": "#ffdad8"
          },
          "borderRadius": {
            "DEFAULT": "0.125rem",
            "lg": "0.25rem",
            "xl": "0.5rem",
            "full": "0.75rem"
          },
          "spacing": {
            "base": "4px",
            "xl": "32px",
            "margin-desktop": "32px",
            "gutter": "24px",
            "lg": "24px",
            "xs": "4px",
            "margin-mobile": "16px",
            "sm": "8px",
            "md": "16px"
          },
          "fontFamily": {
            "display-lg-mobile": ["Inter"],
            "headline-sm": ["Inter"],
            "code": ["Inter"],
            "body-md": ["Inter"],
            "headline-md": ["Inter"],
            "display-lg": ["Inter"],
            "body-lg": ["Inter"],
            "label-md": ["Inter"]
          },
          "fontSize": {
            "display-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
            "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
            "code": ["13px", {"lineHeight": "18px", "fontWeight": "500"}],
            "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
            "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
            "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
            "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
            "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}]
          }
        },
      },
    }
  </script>
<style>
    body { font-family: 'Inter', sans-serif; }
    .material-symbols-outlined {
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #e0bfbd; border-radius: 10px; }
    .active-nav-indicator { view-transition-name: nav-active; }
  </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background min-h-screen pb-24 md:pb-0 md:pl-[280px]">
<!-- Desktop Navigation Drawer -->
<aside class="hidden md:flex fixed left-0 top-0 h-full z-[60] flex-col p-md w-[280px] bg-surface-container-low border-r border-outline-variant">
<div class="mb-xl flex items-center gap-sm">
<div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
<span class="material-symbols-outlined">restaurant_menu</span>
</div>
<h1 class="font-headline-md text-headline-md font-bold text-primary">SushiPoke AI</h1>
</div>
<div class="flex items-center gap-md p-md bg-surface-container rounded-xl mb-xl">
<img class="w-12 h-12 rounded-full object-cover" data-alt="A professional headshot of a female digital manager in a bright, modern office setting. She has a confident smile, wearing a sleek charcoal blazer. The lighting is soft and natural, emphasizing a high-end corporate aesthetic with a clean, minimalist background that suggests a premium sushi brand environment." src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2v_z0ykydfV1Y7Ys5A6sV05MXNj_SoeWcKwS6SJ6xbF1EW7wJZdtD1guUrz6xCU27nwJIaoE1LnnnxqzE65LD9VOICZjP_IavEFg4rmMG2QUHuVxSwDI1H33oreCBl0sBKyW3J6g0UJp6MeJARC9x0RhlxZb19XG0uH4OpXEU5NDYo79FazKFgS59grqRxehwYYh1iXMvDzGf5GklTbPJLs1iz0qc8ySuIJygNXuMggJo39v-wXvm12VJkv0TtXIOd2STXJYvpXs"/>
<div>
<p class="font-bold text-on-surface">Sushi Manager</p>
<p class="text-label-md text-on-surface-variant">Admin Access</p>
</div>
</div>
<nav class="flex-1 space-y-sm">
<a class="flex items-center gap-md p-md rounded-xl text-on-surface-variant hover:bg-surface-variant transition-colors duration-200" href="#">
<span class="material-symbols-outlined">group</span>
<span class="font-body-lg text-body-lg">Agent Overview</span>
</a>
<a class="flex items-center gap-md p-md rounded-xl text-on-surface-variant hover:bg-surface-variant transition-colors duration-200" href="#">
<span class="material-symbols-outlined">insights</span>
<span class="font-body-lg text-body-lg">Performance</span>
</a>
<a class="flex items-center gap-md p-md rounded-xl bg-primary-fixed text-on-primary-fixed font-bold" href="#">
<span class="material-symbols-outlined">calendar_today</span>
<span class="font-body-lg text-body-lg">Planner</span>
</a>
<a class="flex items-center gap-md p-md rounded-xl text-on-surface-variant hover:bg-surface-variant transition-colors duration-200" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-body-lg text-body-lg">Settings</span>
</a>
</nav>
<div class="mt-auto pt-md border-t border-outline-variant">
<a class="flex items-center gap-md p-md rounded-xl text-on-surface-variant hover:bg-surface-variant transition-colors duration-200" href="#">
<span class="material-symbols-outlined">logout</span>
<span class="font-body-lg text-body-lg">Logout</span>
</a>
<p class="text-center text-xs text-on-surface-variant mt-sm">v1.2.4</p>
</div>
</aside>
<!-- Mobile Top App Bar -->
<header class="md:hidden sticky top-0 z-50 bg-surface h-16 flex justify-between items-center px-margin-mobile border-b border-outline-variant">
<div class="flex items-center gap-sm">
<img alt="Profile" class="w-8 h-8 rounded-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-0N0HDkuRUDSq0KT45qdKzWmMoOAfKMswcjYA5bcqNSnUGE3lKBHXp_jqmvETy8FxaWXB0kXt1Xuxlgy7A841O0xRjw_uLNlHHONBDLvpmdeAfddoTRbxvwwzpT7Ns1n6CxtBvIu5Fp3AejbPpGGQt0oKOiQOMazMRX0pQ11j8tq91oopvSWFiMyyhDCQlDdyKwx1xyLwx7wbfPhadmz_qd52-YhBuDcOJtYaBa8Yf0yDS0JQ0xnFpNqzPs21CJKjkuTZcruSMpk"/>
<h1 class="font-display-lg-mobile text-display-lg-mobile font-bold text-primary">SushiPoke AI</h1>
</div>
<button class="text-primary active:scale-95 transition-transform">
<span class="material-symbols-outlined">notifications</span>
</button>
</header>
<main class="p-margin-mobile md:p-margin-desktop max-w-7xl mx-auto">
<!-- Header Section -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl">
<div>
<h2 class="font-display-lg-mobile text-display-lg-mobile md:text-display-lg font-bold text-on-surface">Content Planner</h2>
<p class="text-body-lg text-on-surface-variant">Manage your Instagram community and scheduled posts.</p>
</div>
<button class="bg-primary text-on-primary px-lg py-md rounded-xl font-bold flex items-center justify-center gap-sm shadow-lg hover:brightness-110 active:scale-95 transition-all">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
        Generar con IA
      </button>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<!-- Left Column: Calendar View -->
<section class="lg:col-span-8 flex flex-col gap-gutter">
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm">
<div class="flex items-center justify-between mb-lg">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Septiembre 2023</h3>
<div class="flex gap-xs">
<button class="p-sm hover:bg-surface-container rounded-lg transition-colors"><span class="material-symbols-outlined">chevron_left</span></button>
<button class="p-sm hover:bg-surface-container rounded-lg transition-colors"><span class="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
<!-- Calendar Header (Days) -->
<div class="grid grid-cols-7 text-center mb-sm">
<div class="text-label-md text-on-surface-variant">LUN</div>
<div class="text-label-md text-on-surface-variant">MAR</div>
<div class="text-label-md text-on-surface-variant">MIÉ</div>
<div class="text-label-md text-on-surface-variant">JUE</div>
<div class="text-label-md text-on-surface-variant">VIE</div>
<div class="text-label-md text-on-surface-variant font-bold text-primary">SÁB</div>
<div class="text-label-md text-on-surface-variant font-bold text-primary">DOM</div>
</div>
<!-- Vertical Scrollable List for Mobile / Grid for Desktop -->
<div class="grid grid-cols-7 gap-xs md:gap-sm">
<!-- Day Cell - Repeatable -->
<script>
              const days = Array.from({length: 30}, (_, i) => i + 1);
              const events = {
                12: { type: 'Programado', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=400' },
                15: { type: 'Publicado', img: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&q=80&w=400' },
                18: { type: 'Borrador', img: 'https://images.unsplash.com/photo-1583623025817-d180a2221d0a?auto=format&fit=crop&q=80&w=400' }
              };
              
              document.currentScript.outerHTML = days.map(d => {
                const event = events[d];
                return `
                  <div class="aspect-square md:aspect-auto md:min-h-[120px] bg-background border border-outline-variant rounded-lg p-xs md:p-sm relative hover:border-primary cursor-pointer transition-colors group">
                    <span class="text-label-md text-on-surface-variant group-hover:text-primary font-bold">${d}</span>
                    ${event ? `
                      <div class="mt-xs hidden md:block overflow-hidden rounded-md border border-outline-variant">
                        <img src="${event.img}" class="w-full h-12 object-cover" data-alt="Close-up high-resolution image of premium sushi like Nigiri and Maki arranged artistically. The lighting is warm and inviting, highlighting the freshness of the fish. Professional culinary photography style for a high-end social media feed.">
                        <div class="px-xs py-[2px] ${event.type === 'Publicado' ? 'bg-tertiary text-on-tertiary' : event.type === 'Programado' ? 'bg-primary text-on-primary' : 'bg-secondary text-on-secondary'} text-[8px] font-bold text-center uppercase tracking-tighter">
                          ${event.type}
                        </div>
                      </div>
                      <div class="md:hidden absolute bottom-1 right-1 w-2 h-2 rounded-full ${event.type === 'Publicado' ? 'bg-tertiary' : event.type === 'Programado' ? 'bg-primary' : 'bg-secondary'}"></div>
                    ` : ''}
                  </div>
                `;
              }).join('');
            </script>
</div>
</div>
<!-- Timeline Section -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg shadow-sm">
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-lg">Próximos Posts</h3>
<div class="space-y-md">
<div class="flex items-center gap-md p-md bg-background border border-outline-variant rounded-xl hover:shadow-md transition-shadow">
<img class="w-16 h-16 rounded-lg object-cover" data-alt="A vibrant, colorful bowl of fresh Poke ingredients, including salmon, avocado, and edamame, shot from a top-down perspective. The composition is clean and modern, lit with bright, natural daylight that makes the colors pop. Designed for a high-engagement Instagram post." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOcdT5N8ADW0c3efhoI_iDZMYxSravnAB_qAKZSbKuIajcQz-_Tb4uQM4dBxz3hWCZ1GTQJOun-XOk7ZUf4DRcuR0VdyCxhRzSFfa6CazE_morDGbcnHTOXen-DNddELJoDPFPMtbJ6XuVBXhAxd76GClBnhFxjU3fJKBNzT0ntG5YK62y-NEbHh_8kPBlEyAzP6-3Pxq_HMRNiA4jUaEJwC_ImurLhjagDKyABM0SJw_WcRvaCB20_wGsynG3g570utSt1--Jrac"/>
<div class="flex-1">
<div class="flex justify-between items-start">
<h4 class="font-bold text-on-surface">Poke Bowl Signature Reel</h4>
<span class="px-sm py-xs bg-primary-fixed text-on-primary-fixed rounded-full text-[10px] font-bold uppercase tracking-wider">Programado</span>
</div>
<p class="text-body-md text-on-surface-variant line-clamp-1">Mañana, 12:30 PM • Instagram Reels</p>
<div class="flex gap-sm mt-xs">
<button class="text-primary text-xs font-bold flex items-center gap-1 hover:underline"><span class="material-symbols-outlined text-sm">edit</span> Editar</button>
<button class="text-on-surface-variant text-xs font-bold flex items-center gap-1 hover:underline"><span class="material-symbols-outlined text-sm">visibility</span> Previsualizar</button>
</div>
</div>
</div>
<div class="flex items-center gap-md p-md bg-background border border-outline-variant rounded-xl opacity-80">
<img class="w-16 h-16 rounded-lg object-cover" data-alt="An atmospheric, low-key lighting shot of a sushi chef preparing maki rolls. The scene is professional and focused, showing hands and a sharp knife in a clean, high-end kitchen. Deep shadows and warm highlights create a premium culinary brand feel." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKJN3DSVJSQdf08im7m1dUA6-BPqYaLnpz7BMNgUYDS_fTConHD0MIYC4mQXsm2-ERftfl6-Xrl--JJVmSd4KFxkteCEJNqZqpUOy_dNBRrf4KeprC8unpXvJKgiUnzn07R3OBvrp_XyYqZ1GqTunUs4Uj1obEHeE3jZIN3ehDv3f6f4Vhw1_1UbzhwneqXKzdlPOFfmrVFrv4q47xWAR5FYYeKA8wzsCVsEUC2MzcqWDCvgu0PLUmjGZGJCHD2YCG0HA0nuF_sZk"/>
<div class="flex-1">
<div class="flex justify-between items-start">
<h4 class="font-bold text-on-surface">Behind the Scenes: Chef Yuki</h4>
<span class="px-sm py-xs bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold uppercase tracking-wider">Borrador</span>
</div>
<p class="text-body-md text-on-surface-variant line-clamp-1">Viernes, 06:00 PM • Story</p>
<div class="flex gap-sm mt-xs">
<button class="text-primary text-xs font-bold flex items-center gap-1 hover:underline"><span class="material-symbols-outlined text-sm">auto_awesome</span> Completar con IA</button>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Right Column: Preview & Stats -->
<aside class="lg:col-span-4 flex flex-col gap-gutter">
<!-- Post Preview -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm sticky top-margin-desktop">
<div class="p-md border-b border-outline-variant flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">visibility</span>
<span class="font-bold text-on-surface">Preview del Post</span>
</div>
<!-- Mock Instagram View -->
<div class="p-sm bg-white">
<div class="flex items-center gap-sm mb-sm p-sm">
<div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary text-[10px] font-bold">SP</div>
<span class="text-xs font-bold">sushipoke_official</span>
</div>
<img class="w-full aspect-square object-cover rounded-sm mb-sm" data-alt="A stunning, high-contrast shot of fresh sushi nigiri on a black slate platter. The lighting is dramatic and focused, highlighting the textures of the raw fish and the glisten of the rice. Minimalist composition with a luxurious, modern gourmet aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPndoUeTkrHkiZyCHXFJ3bPm08r5IHP2SQ5Wg0i1xOljsQt12RHhuO1FP3ARVnv9JGNg85WrVUew27QMwyXm9DCZN_1KdG38uNDYBRvCiBXNKvpagwe65uejcncmGPuS2AHXtp2B5rTnsLSH39SW0XOju3ZlHHxAi_BrP0VrxjXZ8w2te0-77OB0o3s72bGwydJev-WqU4DtVCHMcVj8fjccLhpDb5lvOFaA1Cl6qoBgdLFsAAadgg16NZWz8BRJki2QBY24rimus"/>
<div class="flex gap-sm px-sm mb-xs">
<span class="material-symbols-outlined text-xl">favorite</span>
<span class="material-symbols-outlined text-xl">chat_bubble</span>
<span class="material-symbols-outlined text-xl">send</span>
</div>
<div class="px-sm pb-md">
<p class="text-xs mb-sm"><strong>sushipoke_official</strong> ✨ La frescura del mar en cada bocado. Descubre nuestro nuevo Salmon Supreme Roll...</p>
<!-- AI Copy Component -->
<div class="bg-surface-container p-md rounded-lg relative overflow-hidden group">
<div class="absolute top-0 right-0 p-xs">
<span class="text-[8px] bg-primary text-on-primary px-xs py-[2px] rounded-full uppercase">AI Suggested</span>
</div>
<p class="text-[13px] text-on-surface leading-tight italic">
                  "¿Listo para un viaje de sabores? 🍣 Nuestro Salmon Supreme no es solo un roll, es una experiencia. Marinado 24h y servido con amor. ¡Te esperamos! #SushiLovers #PokeBowl #FreshFood"
                </p>
<div class="mt-sm flex gap-xs">
<button class="bg-white px-sm py-xs border border-outline-variant rounded-md text-[10px] font-bold hover:bg-background transition-colors">Re-generar</button>
<button class="bg-primary text-on-primary px-sm py-xs rounded-md text-[10px] font-bold hover:brightness-110 transition-all">Usar Copia</button>
</div>
</div>
</div>
</div>
<div class="p-md bg-background flex flex-col gap-sm">
<div class="flex justify-between items-center text-xs">
<span class="text-on-surface-variant">Alcance Estimado:</span>
<span class="font-bold text-tertiary">2.4k - 3.8k</span>
</div>
<div class="flex justify-between items-center text-xs">
<span class="text-on-surface-variant">Mejor hora para publicar:</span>
<span class="font-bold text-on-surface">19:45 PM</span>
</div>
</div>
</div>
<!-- Quick Stats Card -->
<div class="bg-primary p-md rounded-xl text-on-primary shadow-lg">
<h4 class="text-label-md font-bold uppercase mb-md opacity-80">Estado de Cuenta</h4>
<div class="grid grid-cols-2 gap-md">
<div>
<p class="text-display-lg-mobile font-bold">12</p>
<p class="text-[10px] opacity-80 uppercase font-bold">Posts este mes</p>
</div>
<div>
<p class="text-display-lg-mobile font-bold">85%</p>
<p class="text-[10px] opacity-80 uppercase font-bold">Engagement Rate</p>
</div>
</div>
</div>
</aside>
</div>
</main>
<!-- Mobile Bottom Navigation Bar -->
<nav class="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs bg-surface-container-lowest border-t border-outline-variant shadow-lg rounded-t-xl">
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant px-md py-xs hover:bg-surface-container-high transition-all" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-md text-label-md">Dashboard</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant px-md py-xs hover:bg-surface-container-high transition-all" href="#">
<span class="material-symbols-outlined">chat_bubble</span>
<span class="font-label-md text-label-md">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-md py-xs active:scale-90 transition-all duration-150" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">calendar_today</span>
<span class="font-label-md text-label-md">Planner</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant px-md py-xs hover:bg-surface-container-high transition-all" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
<span class="font-label-md text-label-md">Menu</span>
</a>
</nav>
<!-- Floating Action Button (Mobile Only) -->
<button class="md:hidden fixed bottom-24 right-margin-mobile w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center active:scale-95 transition-transform z-[40]">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add</span>
</button>
<script>
    // Micro-interactions and simple state management
    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function() {
        // Visual feedback for interactions
        this.classList.add('scale-95');
        setTimeout(() => this.classList.remove('scale-95'), 100);
      });
    });

    // Simple horizontal scroll behavior for calendar on mobile if needed
    // (Already handled by grid responsive layout)
  </script>
</body></html>

<!-- Planificador de Contenido -->
<!DOCTYPE html>

<html class="light" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container-high": "#dfeaef",
                        "on-error-container": "#93000a",
                        "inverse-on-surface": "#e7f3f7",
                        "primary-fixed-dim": "#ffb3b0",
                        "inverse-surface": "#283236",
                        "tertiary-fixed-dim": "#4bddb7",
                        "surface-container": "#e4f0f4",
                        "error-container": "#ffdad6",
                        "secondary-fixed": "#dde4e6",
                        "on-surface": "#131d21",
                        "surface-dim": "#d1dce0",
                        "background": "#f1fbff",
                        "surface-container-low": "#eaf5fa",
                        "tertiary-fixed": "#6dfad2",
                        "on-error": "#ffffff",
                        "on-primary-fixed": "#410006",
                        "secondary-fixed-dim": "#c1c8ca",
                        "surface-bright": "#f1fbff",
                        "surface": "#f1fbff",
                        "on-tertiary-fixed": "#002018",
                        "tertiary-container": "#00b08d",
                        "outline": "#8c706f",
                        "on-primary-container": "#6d0010",
                        "on-secondary": "#ffffff",
                        "outline-variant": "#e0bfbd",
                        "on-background": "#131d21",
                        "surface-tint": "#ae2f34",
                        "on-surface-variant": "#584140",
                        "primary": "#ae2f34",
                        "on-tertiary-fixed-variant": "#005140",
                        "tertiary": "#006b55",
                        "surface-container-highest": "#d9e4e9",
                        "primary-container": "#ff6b6b",
                        "surface-container-lowest": "#ffffff",
                        "error": "#ba1a1a",
                        "secondary-container": "#dae1e3",
                        "inverse-primary": "#ffb3b0",
                        "on-tertiary-container": "#003b2e",
                        "on-secondary-fixed-variant": "#41484a",
                        "on-secondary-container": "#5d6466",
                        "secondary": "#586062",
                        "on-primary-fixed-variant": "#8c1520",
                        "on-secondary-fixed": "#161d1f",
                        "surface-variant": "#d9e4e9",
                        "on-primary": "#ffffff",
                        "on-tertiary": "#ffffff",
                        "primary-fixed": "#ffdad8"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "base": "4px",
                        "xl": "32px",
                        "margin-desktop": "32px",
                        "gutter": "24px",
                        "lg": "24px",
                        "xs": "4px",
                        "margin-mobile": "16px",
                        "sm": "8px",
                        "md": "16px"
                    },
                    "fontFamily": {
                        "display-lg-mobile": ["Inter"],
                        "headline-sm": ["Inter"],
                        "code": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "body-lg": ["Inter"],
                        "label-md": ["Inter"]
                    },
                    "fontSize": {
                        "display-lg-mobile": ["24px", {"lineHeight": "32px", "fontWeight": "700"}],
                        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                        "code": ["13px", {"lineHeight": "18px", "fontWeight": "500"}],
                        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                        "display-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.05em", "fontWeight": "600"}]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f1fbff;
        }
        .bento-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: minmax(100px, auto);
            gap: 16px;
        }
        @media (max-width: 768px) {
            .bento-grid {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-background text-on-background">
<!-- TopAppBar -->
<header class="bg-surface dark:bg-surface-dim docked full-width top-0 border-b border-outline-variant dark:border-outline flex justify-between items-center w-full px-margin-mobile h-16 fixed z-40">
<div class="flex items-center gap-md">
<div class="w-10 h-10 rounded-full overflow-hidden border-2 border-primary">
<img alt="Sushi Manager" class="w-full h-full object-cover" data-alt="A professional headshot of a female operations manager with a confident smile, wearing a modern charcoal uniform. The background is a blurred, high-end sushi restaurant with warm ambient lighting and minimalist wooden accents. The photo has a professional, corporate light-mode aesthetic with high clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3lASm5Se13y7vhk2wHivcWal_Iap5rbJqKBl3QQNO9tf_q3ztibNS7itDnGxjhkxGbytBypk9qvkoKqEFjNx2dHjh8TzV9a3c3lNigLK8-LNKS3w0azX4azGrdlUK3QQFr-5QZA2XoBQccgWFtpQnVHURhAcHYrF65eM-Md2DO_C0hyunm1jiNOXAihmyEWvnsFRCTIFT8ChIMiIk__DiHUUNkMPP_7Y3dC6xoU2_LWBkWshTXWTT9DtFXsVF754bLjvt_9lp1qU"/>
</div>
<h1 class="font-display-lg-mobile text-display-lg-mobile font-bold text-primary dark:text-primary-fixed-dim">SushiPoke AI</h1>
</div>
<div class="flex items-center gap-md">
<button class="material-symbols-outlined text-primary dark:text-primary-fixed-dim p-sm rounded-full hover:bg-surface-container-low transition-all active:scale-95">notifications</button>
</div>
</header>
<main class="pt-24 pb-32 px-margin-mobile max-w-7xl mx-auto">
<!-- Hero Stats Section -->
<section class="mb-lg">
<h2 class="font-headline-md text-headline-md text-on-surface mb-md">Panel de Control</h2>
<div class="grid grid-cols-1 md:grid-cols-4 gap-md">
<!-- Sales Metric (Large) -->
<div class="md:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between relative overflow-hidden">
<div class="z-10">
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Ventas de Hoy</p>
<p class="font-display-lg text-display-lg text-primary mt-xs">$12,840.00</p>
<div class="flex items-center gap-xs mt-sm text-tertiary">
<span class="material-symbols-outlined text-[18px]">trending_up</span>
<span class="font-label-md text-label-md">+14% vs ayer</span>
</div>
</div>
<div class="absolute bottom-0 right-0 w-1/2 h-2/3 opacity-10">
<span class="material-symbols-outlined text-[120px] text-primary">restaurant_menu</span>
</div>
</div>
<!-- Agent Summary Bento -->
<div class="bg-primary-container text-on-primary-container rounded-xl p-md flex flex-col justify-between">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined">headset_mic</span>
<span class="bg-on-primary-container/20 px-sm py-1 rounded-full font-label-md text-[10px]">12 ONLINE</span>
</div>
<div>
<p class="font-body-md text-body-md opacity-90">Atención</p>
<p class="font-headline-sm text-headline-sm">98.2%</p>
</div>
</div>
<div class="bg-surface-container-high rounded-xl p-md border border-outline-variant flex flex-col justify-between">
<div class="flex justify-between items-start">
<span class="material-symbols-outlined text-primary">shopping_cart</span>
<span class="bg-primary/10 text-primary px-sm py-1 rounded-full font-label-md text-[10px]">8 ACTIVE</span>
</div>
<div>
<p class="font-body-md text-body-md text-on-surface-variant">Ventas</p>
<p class="font-headline-sm text-headline-sm text-on-surface">45 Pedidos</p>
</div>
</div>
</div>
</section>
<!-- Secondary Agents & Monitoring -->
<section class="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
<span class="material-symbols-outlined">feedback</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface-variant">Reclamos</p>
<p class="font-headline-sm text-headline-sm text-on-surface">3 Pendientes</p>
</div>
</div>
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
<span class="material-symbols-outlined">movie_edit</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface-variant">Contenido</p>
<p class="font-headline-sm text-headline-sm text-on-surface">5 Posts IA</p>
</div>
</div>
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-center gap-md">
<div class="w-12 h-12 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center">
<span class="material-symbols-outlined">analytics</span>
</div>
<div>
<p class="font-label-md text-label-md text-on-surface-variant">Uptime IA</p>
<p class="font-headline-sm text-headline-sm text-on-surface">99.9%</p>
</div>
</div>
</section>
<!-- Alerts Section -->
<section class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="p-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
<h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-sm">
<span class="material-symbols-outlined text-primary">warning</span>
                    Alertas Recientes
                </h3>
<button class="text-primary font-label-md text-label-md hover:underline">VER TODO</button>
</div>
<div class="divide-y divide-outline-variant">
<!-- Alert Item -->
<div class="p-md hover:bg-surface-container-low transition-colors flex justify-between items-center">
<div class="flex gap-md items-start">
<div class="mt-1 w-2 h-2 rounded-full bg-error shrink-0"></div>
<div>
<p class="font-body-lg text-body-lg font-semibold text-on-surface">Reclamo de demora en delivery #452</p>
<p class="font-body-md text-body-md text-on-surface-variant">Sucursal Palermo - Hace 5 minutos</p>
</div>
</div>
<button class="bg-primary text-on-primary px-md py-xs rounded-full font-label-md text-label-md transition-all active:scale-90">Gestionar</button>
</div>
<!-- Alert Item -->
<div class="p-md hover:bg-surface-container-low transition-colors flex justify-between items-center">
<div class="flex gap-md items-start">
<div class="mt-1 w-2 h-2 rounded-full bg-primary-container shrink-0"></div>
<div>
<p class="font-body-lg text-body-lg font-semibold text-on-surface">Stock Crítico: Salmón Premium</p>
<p class="font-body-md text-body-md text-on-surface-variant">Central Logística - Hace 12 minutos</p>
</div>
</div>
<button class="border border-primary text-primary px-md py-xs rounded-full font-label-md text-label-md hover:bg-primary-fixed transition-all active:scale-90">Ver Stock</button>
</div>
<!-- Alert Item -->
<div class="p-md hover:bg-surface-container-low transition-colors flex justify-between items-center">
<div class="flex gap-md items-start">
<div class="mt-1 w-2 h-2 rounded-full bg-tertiary shrink-0"></div>
<div>
<p class="font-body-lg text-body-lg font-semibold text-on-surface">Nuevo Review 5 Estrellas ✨</p>
<p class="font-body-md text-body-md text-on-surface-variant">Google Maps - Hace 25 minutos</p>
</div>
</div>
<button class="text-on-surface-variant font-label-md material-symbols-outlined">more_vert</button>
</div>
</div>
</section>
<!-- Visual Content Grid (Content Agent Preview) -->
<section class="mt-lg">
<div class="flex justify-between items-end mb-md">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Próximo Contenido (IA)</h3>
<p class="font-body-md text-body-md text-on-surface-variant">Generado automáticamente por el Agente de Contenido</p>
</div>
</div>
<div class="grid grid-cols-2 md:grid-cols-4 gap-md">
<div class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-outline-variant">
<img alt="Sushi Post" class="w-full h-full object-cover transition-transform group-hover:scale-110" data-alt="A macro close-up photograph of fresh Nigiri sushi featuring vibrant orange salmon over perfectly seasoned white rice. The lighting is bright and clean, mimicking a professional studio setting. The background is a soft, out-of-focus light blue, consistent with the app's light-mode color palette. The overall mood is appetizing and high-end culinary art." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEICkpfCiZgDKkELAWyoBNfqhoQeaGke9Dl_tTqn2FXkVQp9tVXX3QXpApWLBcTuiLF13CLik_BJLQEfFEWtnwp35iXmo-AZnN-x5DDklx6AQ12UBDo5nXqw_SOS6lLb9s8gXY7wxq8dJJiJJbLZ93ma9yBpZJkWaYHS3XhssAFnZETOpVt8YvQ4xWsIO0cT5bfo-MB1pUwexFSNqWfIJ4ozV66e0IG60SucARktrD4rMK7UBBBU2fLJAaaQlQ0Hzt0MVUbdmCtg0"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span class="material-symbols-outlined text-white">schedule_send</span>
</div>
<div class="absolute bottom-2 left-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded">PROGRAMADO</div>
</div>
<div class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-outline-variant">
<img alt="Poke Bowl Post" class="w-full h-full object-cover transition-transform group-hover:scale-110" data-alt="A top-down view of a colorful Poke Bowl filled with diced tuna, avocado slices, edamame, and radish over a bed of rice. The scene is illuminated with crisp, natural daylight, emphasizing the fresh textures of the ingredients. The aesthetic is clean and modern, following the brand's vibrant yet professional visual identity. The background is a white marble surface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwcstghO2l9OdL3Oz5hBZIeHg3trk3kEwFdSjY0Ch5_Tm0u0VfyBXjGRiWQ2YIiryGZR2e4zLEDxkn1OqEtrnTIxohbnP-JB7Pc7-Wc0UNAX-aSglJ8gUY9WPrmQ-Kk-bAKyu0QC9Q3_lOuvae0lrigtAc8UC-eodlcWgQIfh0hAd5mePsQTI2WrRvY4XapCRwvYpthchAn7nxNZE78frEXzf-PEnE1K-PYae0iL9Y0HVb5ORlM3uqZJ9eYNuOgQ35yT-M4R-3gxM"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span class="material-symbols-outlined text-white">edit</span>
</div>
<div class="absolute bottom-2 left-2 bg-surface-variant text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded">BORRADOR</div>
</div>
<div class="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-outline-variant">
<img alt="Interior Post" class="w-full h-full object-cover transition-transform group-hover:scale-110" data-alt="An interior shot of a minimalist, modern sushi bar with light wood furniture and subtle neon coral accents. The space is bright and airy, reflecting a contemporary corporate aesthetic. The image captures the essence of efficiency and cleanliness. High-key lighting creates a welcoming, tech-forward environment suitable for a high-performance agent platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdpukwWI1hsSVzBidS4x32T0KXtBjKGsoy68Pm_W_7IjKSDXIdWy-KHsgu6rGrHiIQcraMba7Smjg0b2EGW4YIMfALjw-jNtN9aB1jIuMIRj3SnGdTT_UpPWz2yk1U-DJsc_jCq6Cp1OGSuoT1GhOm9TeNS-1OUrzICWw_bVpXEwb_Cbc7QZ9MgcAWNFPVEXTssBJkIg7Gf4bKewyaNj4D4k2YleRdhqkD5UzaCVTtarbKAbp5tvFCvGoA3vCZ_z0AL1YvB2hQMXY"/>
<div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
<span class="material-symbols-outlined text-white">visibility</span>
</div>
</div>
<div class="group relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-outline-variant flex flex-col items-center justify-center hover:bg-surface-container-low transition-colors cursor-pointer">
<span class="material-symbols-outlined text-on-surface-variant text-[40px]">add_circle</span>
<p class="font-label-md text-label-md text-on-surface-variant mt-sm">NUEVO ASSET</p>
</div>
</div>
</section>
</main>
<!-- BottomNavBar -->
<nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-sm py-xs bg-surface-container-lowest dark:bg-inverse-surface border-t border-outline-variant dark:border-outline shadow-lg dark:shadow-none rounded-t-xl">
<a class="flex flex-col items-center justify-center bg-primary-container dark:bg-primary text-on-primary-container dark:text-on-primary rounded-full px-md py-xs active:scale-90 transition-all duration-150" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-md text-label-md">Dashboard</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high dark:hover:bg-secondary active:scale-90 transition-all duration-150" href="#">
<span class="material-symbols-outlined">chat_bubble</span>
<span class="font-label-md text-label-md">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high dark:hover:bg-secondary active:scale-90 transition-all duration-150" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
<span class="font-label-md text-label-md">Menu</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-fixed-variant dark:text-secondary-fixed-dim px-md py-xs hover:bg-surface-container-high dark:hover:bg-secondary active:scale-90 transition-all duration-150" href="#">
<span class="material-symbols-outlined">calendar_today</span>
<span class="font-label-md text-label-md">Planner</span>
</a>
</nav>
<script>
        // Simple micro-interaction for active nav states
        document.querySelectorAll('nav a').forEach(link => {
            link.addEventListener('click', function(e) {
                // Logic to swap active classes
                document.querySelectorAll('nav a').forEach(l => {
                    l.classList.remove('bg-primary-container', 'text-on-primary-container', 'dark:bg-primary', 'dark:text-on-primary', 'rounded-full');
                    l.classList.add('text-on-secondary-fixed-variant', 'dark:text-secondary-fixed-dim');
                });
                this.classList.add('bg-primary-container', 'text-on-primary-container', 'dark:bg-primary', 'dark:text-on-primary', 'rounded-full');
                this.classList.remove('text-on-secondary-fixed-variant', 'dark:text-secondary-fixed-dim');
            });
        });
    </script>
</body></html>

<!-- Dashboard de Monitoreo -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Omnichannel Messaging</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container": "#edeeef",
                        "secondary-fixed-dim": "#c1c8ca",
                        "on-error": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "background": "#f8f9fa",
                        "primary-fixed-dim": "#ffb3b0",
                        "tertiary-fixed-dim": "#93ccff",
                        "surface": "#f8f9fa",
                        "on-secondary-fixed": "#161d1f",
                        "secondary-fixed": "#dde4e6",
                        "primary-container": "#ff6b6b",
                        "surface-dim": "#d9dadb",
                        "inverse-surface": "#2e3132",
                        "secondary": "#586062",
                        "outline": "#8c706f",
                        "on-primary-fixed": "#410006",
                        "primary-fixed": "#ffdad8",
                        "tertiary": "#006398",
                        "on-secondary": "#ffffff",
                        "on-surface": "#191c1d",
                        "tertiary-fixed": "#cde5ff",
                        "outline-variant": "#e0bfbd",
                        "secondary-container": "#dae1e3",
                        "on-primary": "#ffffff",
                        "on-tertiary-fixed": "#001d31",
                        "inverse-on-surface": "#f0f1f2",
                        "surface-container-low": "#f3f4f5",
                        "on-surface-variant": "#584140",
                        "on-tertiary": "#ffffff",
                        "tertiary-container": "#3aa2ea",
                        "on-background": "#191c1d",
                        "surface-variant": "#e1e3e4",
                        "on-tertiary-fixed-variant": "#004b74",
                        "primary": "#ae2f34",
                        "surface-container-high": "#e7e8e9",
                        "on-tertiary-container": "#003655",
                        "on-primary-container": "#6d0010",
                        "surface-tint": "#ae2f34",
                        "inverse-primary": "#ffb3b0",
                        "surface-bright": "#f8f9fa",
                        "on-secondary-fixed-variant": "#41484a",
                        "on-error-container": "#93000a",
                        "on-secondary-container": "#5d6466",
                        "surface-container-highest": "#e1e3e4",
                        "on-primary-fixed-variant": "#8c1520",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "nav-width-collapsed": "72px",
                        "stack-gap": "0.5rem",
                        "pane-sidebar-width": "320px",
                        "margin-desktop": "2rem",
                        "gutter": "1rem",
                        "nav-width-expanded": "240px",
                        "margin-mobile": "1rem"
                    },
                    "fontFamily": {
                        "label-sm": ["Inter"],
                        "label-lg": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        /* Custom scrollbar for a cleaner look */
        ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background-color: #d9dadb;
            border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background-color: #c1c8ca;
        }
        
        .whatsapp-icon { color: #25D366; }
        .instagram-icon { color: #E1306C; }
        .facebook-icon { color: #1877F2; }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen overflow-hidden flex flex-col md:flex-row">
<!-- TopNavBar (Mobile) -->
<nav class="md:hidden flex justify-between items-center h-16 px-margin-mobile bg-surface-container-lowest border-b border-outline-variant w-full z-40 fixed top-0">
<div class="font-headline-sm text-headline-sm font-black text-on-surface">Sushi Poke &amp; Roll</div>
<div class="flex gap-4 text-primary">
<span class="material-symbols-outlined hover:text-primary transition-all duration-200">search</span>
<span class="material-symbols-outlined hover:text-primary transition-all duration-200">notifications</span>
<span class="material-symbols-outlined hover:text-primary transition-all duration-200">menu</span>
</div>
</nav>
<!-- SideNavBar (Desktop) -->
<aside class="hidden md:flex bg-surface flex-col h-screen py-6 px-4 fixed left-0 top-0 h-full w-nav-width-expanded border-r border-outline-variant z-50">
<div class="mb-8 px-2 flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-lg">SP</div>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-primary truncate">Sushi Poke &amp; Roll</h1>
<p class="font-label-sm text-label-sm text-secondary">Admin Dashboard</p>
</div>
</div>
<nav class="flex-1 space-y-2">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">dashboard</span>
                Dashboard
            </a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-l-4 border-primary bg-primary-fixed font-body-md text-body-md scale-[0.99] transition-transform duration-150" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">chat</span>
                Inbox
            </a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
                Menu
            </a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">calendar_month</span>
                Content Planner
            </a>
</nav>
<div class="mt-auto space-y-2 pt-4 border-t border-surface-variant">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">settings</span>
                Settings
            </a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md" href="#">
<span class="material-symbols-outlined">logout</span>
                Logout
            </a>
</div>
</aside>
<!-- TopNavBar (Desktop) -->
<header class="hidden md:flex bg-surface-container-lowest justify-between items-center h-16 px-margin-desktop fixed top-0 right-0 w-[calc(100%-240px)] z-40 border-b border-outline-variant">
<div class="flex items-center bg-surface-container-low rounded-full px-4 py-2 w-96 border border-surface-variant focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-all">
<span class="material-symbols-outlined text-on-surface-variant mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 text-body-md w-full text-on-surface placeholder-on-surface-variant/70" placeholder="Search conversations, orders, or customers..." type="text"/>
</div>
<div class="flex items-center gap-4 text-primary font-label-lg text-label-lg">
<button class="p-2 rounded-full hover:bg-surface-container transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="p-2 rounded-full hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">help</span>
</button>
<button class="flex items-center gap-2 hover:bg-surface-container px-3 py-1.5 rounded-full transition-colors border border-surface-variant">
<img alt="User Avatar" class="w-8 h-8 rounded-full" data-alt="A small circular portrait of a professional chef or restaurant manager. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdfgpvdW5MIXo1LaQeWDK9p16jDWSO_b54HmyFTXOiGCwu5MbGMmigW9S2L9mFkIJwuZabG81OvdSki4MULGCd5fF27cB0G4duW62nWrEbxlc9hdZx9vyVUuGlZkR6uvyUoCYF42R_wqSEGdrdIYe4FeqFcju5fwd3AwfbFO5js1myIE7_8KczAEwOlcCXSw3xLhR7ibgSta6AK73XPKJHld3x-3bY5BvALMhTJ4MVhrNCmZbIBVwEmifE1pxjA476X4cdqlQnbh0"/>
<span class="font-label-sm text-on-surface">Admin</span>
<span class="material-symbols-outlined text-sm">expand_more</span>
</button>
</div>
</header>
<!-- Main Workspace Area -->
<main class="flex-1 flex flex-col md:flex-row mt-16 md:ml-[240px] h-[calc(100vh-64px)] overflow-hidden bg-background">
<!-- Left Pane: Conversation List -->
<section class="w-full md:w-pane-sidebar-width flex-shrink-0 bg-surface-container-lowest border-r border-surface-variant flex flex-col h-full z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
<div class="p-4 border-b border-surface-variant sticky top-0 bg-surface-container-lowest z-20">
<div class="flex justify-between items-center mb-4">
<h2 class="font-headline-sm text-headline-sm font-bold text-on-surface">Inbox</h2>
<div class="flex gap-1">
<button class="p-1.5 rounded bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors" title="Filter">
<span class="material-symbols-outlined text-sm">filter_list</span>
</button>
<button class="p-1.5 rounded text-secondary hover:bg-surface-container transition-colors" title="Add Conversation">
<span class="material-symbols-outlined text-sm">add</span>
</button>
</div>
</div>
<!-- Channel Filters -->
<div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
<button class="px-3 py-1.5 rounded-full bg-primary-container text-white font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1 shadow-sm">
                        All
                    </button>
<button class="px-3 py-1.5 rounded-full bg-surface text-on-surface border border-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] whatsapp-icon">chat</span> WhatsApp
                    </button>
<button class="px-3 py-1.5 rounded-full bg-surface text-on-surface border border-surface-variant hover:bg-surface-container transition-colors font-label-sm text-label-sm whitespace-nowrap flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] instagram-icon">photo_camera</span> Insta
                    </button>
</div>
</div>
<div class="flex-1 overflow-y-auto">
<!-- Active Chat Item -->
<div class="flex items-start gap-3 p-4 cursor-pointer bg-primary-fixed/20 relative group hover:bg-primary-fixed/30 transition-colors">
<div class="absolute left-0 top-0 bottom-0 w-[3px] bg-primary-container"></div>
<div class="relative">
<img alt="Customer Avatar" class="w-12 h-12 rounded-full border-2 border-white" data-alt="A small circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmGgRCRMvFYcMdoMUrMltDZUR0x-x330rCTACTnSsc7w2nRCGPZULuEreKFgv5HSA8oqMYsbEFEeOMHCxjj1a8Z3PwEKQJMQqfrZn9x1Q10JxAzCNOmcV9uYRJE6S-bogVr6GicXOQQ-I5_7OHOUH507S82VwcEO_Mzew4Xi3zD1nRYwy3L5deb8UE6HwLcPvsJ7qSkqmUBGs3uDbx4VQLK7-xAm3BJZtJAMSKXZqYBadSadaaF1XLK7GrYz3I3KCBQUpgOs1OTwY"/>
<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[12px] whatsapp-icon">chat</span>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-baseline mb-1">
<h3 class="font-label-lg text-label-lg font-bold text-on-surface truncate">Maria Garcia</h3>
<span class="font-label-sm text-label-sm text-secondary flex-shrink-0">Just now</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface truncate">Yes, I'd like to add extra spicy mayo to that.</p>
<div class="flex gap-2 mt-2">
<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-tertiary-fixed text-on-tertiary-fixed">Order #4829</span>
<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-error-container text-on-error-container">Action Needed</span>
</div>
</div>
</div>
<!-- Unread Chat Item -->
<div class="flex items-start gap-3 p-4 cursor-pointer hover:bg-surface-container transition-colors border-b border-surface-variant/50">
<div class="relative">
<img alt="Customer Avatar" class="w-12 h-12 rounded-full" data-alt="A small circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAto0--BU84dOWOeUSgHYbC-WjTZZ1huzcwqldjdQQD83v4qsG9jGPnpaw_NfyDeDh3Wc5Gy9CAG2gVp0RsIQaK_nEce_DkZORuFrSf7cDoMA6G0R16PN1XYJaBzrH7VnPmHnvq6kO12auXo2dOaoVBbKpbztf2M_lB-pX1O0k1M0FRBonF0g1WyMFCSDTix-wXe-O9oKTBgxJjbx4R9mwsc636YjqfIiYthk3Egb7bgrpMqWkG38_kXy8TXgAfiKcxhfQHz6WygCY"/>
<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[12px] instagram-icon">photo_camera</span>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-baseline mb-1">
<h3 class="font-label-lg text-label-lg font-bold text-on-surface truncate">David Chen</h3>
<span class="font-label-sm text-label-sm text-primary font-bold flex-shrink-0">10:42 AM</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface font-semibold truncate">Are you guys open for dine-in today?</p>
<div class="flex items-center gap-1 mt-1">
<div class="w-2 h-2 rounded-full bg-primary-container"></div>
<span class="font-label-sm text-[10px] text-primary">New Message</span>
</div>
</div>
</div>
<!-- Read Chat Item -->
<div class="flex items-start gap-3 p-4 cursor-pointer hover:bg-surface-container transition-colors border-b border-surface-variant/50 opacity-70 hover:opacity-100">
<div class="relative">
<img alt="Customer Avatar" class="w-12 h-12 rounded-full" data-alt="A small circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwQN9xMYRGmlj0TVdK25eeRdBFKwjpu5otVi8xwYNGnDsPc5cq3AheIhJFwUnPwRqRuUclYUsDBeLFn_gf48TfGEm04pVFD-0jDl4yLtTw1igemfSAemoPTZioJK_vwJEmA39Zn1RCVZm3AQp_0lOH6fvzg0lOq1u1EF2NApY7QGgjIwt8H7hhBDjg7X1FYVBlQm4bJkdIyLYTvDPPNYDCYBjl9gpNPGF3Fsz1BO-YWK0XByO5E9Kxuc9RxW8FOydEypO9TkoMChE"/>
<div class="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
<span class="material-symbols-outlined text-[12px] facebook-icon">social_leaderboard</span>
</div>
</div>
<div class="flex-1 min-w-0">
<div class="flex justify-between items-baseline mb-1">
<h3 class="font-label-lg text-label-lg text-on-surface truncate">Sarah Johnson</h3>
<span class="font-label-sm text-label-sm text-secondary flex-shrink-0">Yesterday</span>
</div>
<p class="font-body-sm text-body-sm text-secondary truncate">Thanks, the sushi was amazing as always!</p>
<div class="flex gap-2 mt-2">
<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container-high text-secondary">Resolved</span>
</div>
</div>
</div>
</div>
</section>
<!-- Middle Pane: Active Conversation -->
<section class="flex-1 flex flex-col bg-surface-container-lowest min-w-[300px]">
<!-- Chat Header -->
<div class="h-16 px-6 border-b border-surface-variant flex items-center justify-between sticky top-0 bg-surface-container-lowest/90 backdrop-blur-sm z-10 shadow-sm">
<div class="flex items-center gap-4">
<div class="relative">
<img alt="Maria Garcia" class="w-10 h-10 rounded-full" data-alt="A small circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDCUXTwkz86c8UruXQG1eBOPGhru8YiphnOMym-4WmeuTJVd902uFTuEps-qAo5yxwl6vRHULHd_YLqVJkrUQXgvxu9KVIry3LxbtOrmdXux0x2lNymC4njQPt00-PRfg8ZQVtsi0bVhjRd8fK7l1aIjSu_SBSrHJXjafkJHxT2CCzmcLjSShKRMzBoDgy5zlIXuEYbnY6_Ge4v-L9PnHfNIhOjyeuTRPHt9WnSJ1NpDSuIrCpi49JtdEtGB3advJjUeZ0W5Mu2YqU"/>
<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
</div>
<div>
<h2 class="font-headline-sm text-headline-sm font-bold text-on-surface flex items-center gap-2">
                            Maria Garcia
                            <span class="material-symbols-outlined text-sm whatsapp-icon">chat</span>
</h2>
<p class="font-label-sm text-label-sm text-secondary">Active now • WhatsApp</p>
</div>
</div>
<div class="flex items-center gap-2">
<button class="px-4 py-2 bg-primary-container text-white rounded-lg font-label-lg text-label-lg hover:bg-primary transition-colors flex items-center gap-2 shadow-[0_2px_4px_rgba(255,107,107,0.2)]">
<span class="material-symbols-outlined text-sm">receipt_long</span>
                        View Order
                    </button>
<button class="p-2 rounded-lg text-secondary hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<!-- Chat Messages -->
<div class="flex-1 overflow-y-auto p-6 space-y-6 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9IiNlMGUwZTAiIGZpbGwtb3BhY2l0eT0iMC40Ii8+PC9zdmc+')] bg-repeat">
<div class="text-center">
<span class="px-3 py-1 rounded-full bg-surface-container-high text-secondary font-label-sm text-[10px] uppercase tracking-wider">Today</span>
</div>
<!-- System Message -->
<div class="flex justify-center">
<div class="bg-tertiary-fixed-dim/30 text-on-surface-variant px-4 py-2 rounded-lg font-body-sm text-sm border border-tertiary-fixed-dim/50 max-w-md text-center flex items-center gap-2">
<span class="material-symbols-outlined text-sm text-tertiary">robot_2</span>
                        AI Agent auto-replied with menu options at 10:30 AM
                    </div>
</div>
<!-- Incoming Message -->
<div class="flex items-end gap-2 max-w-[80%]">
<img alt="Maria" class="w-8 h-8 rounded-full mb-1" data-alt="A small circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBQbT3z2hsH_Kz6VQlmjdXrOh34OVA6OuQGDTL3zTy36HSnUS7SbHDbd4DL1xjabIbfKk2XodUEPRJu86RIYPg4G03HT_XE0VFa5FKdGn7k-pDAUebIAHQieBEHxQ3qHTgDODQTJ-IxnRtgAAEN95Phdec_mNLx1RnxWM6Eb3jjF8VbHchx8x6of667WLFcmBA1ivSsG9jUoO-mlz5jtAScWCuyRNhfHyshSbxshaxqkiAwssyFjTAseJw1AVM5KW6YEj1EtvLnAQ"/>
<div class="flex flex-col gap-1">
<div class="bg-surface-container-low text-on-surface p-3 rounded-2xl rounded-bl-sm border border-surface-variant shadow-sm font-body-md text-body-md">
                            Hi! I'd like to place an order for pickup. Do you have the Spicy Tuna Poke Bowl available?
                        </div>
<span class="font-label-sm text-[10px] text-secondary ml-1">10:35 AM</span>
</div>
</div>
<!-- Outgoing Message -->
<div class="flex items-end gap-2 max-w-[80%] ml-auto justify-end">
<div class="flex flex-col gap-1 items-end">
<div class="bg-primary-container text-white p-3 rounded-2xl rounded-br-sm shadow-[0_2px_4px_rgba(255,107,107,0.2)] font-body-md text-body-md">
                            Hello Maria! Yes, we do. Would you like to make it a combo with a drink and edamame?
                        </div>
<span class="font-label-sm text-[10px] text-secondary mr-1 flex items-center gap-1">
                            10:38 AM <span class="material-symbols-outlined text-[14px] text-primary-container" style="font-variation-settings: 'FILL' 1;">done_all</span>
</span>
</div>
</div>
<!-- Incoming Message (Current) -->
<div class="flex items-end gap-2 max-w-[80%]">
<img alt="Maria" class="w-8 h-8 rounded-full mb-1" data-alt="A small circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8zsvZ6j1Twle-hBeF3qZb-qk2ON5sjaRugpJ1pWMZ643_mkMGh899oX7f_i9ZUl6c0D7oU0ZR15G6ZjOVkFp399dadBQm6QxMs-bfV0amTI-NMB354XTO14Rp4QghxfupqrRdmdNijAYxr0VyJ1F3pDX6ZlNCyN7bF6Jw_Zu_TpMblQDdV5fodUD65KlDurT7KS8G-YCLNQoixyjBrvsoClEEAoArlE2Uw41uWN_39Rp7c945z7p5XreEtAJwARmPQt4s5cDTq5s"/>
<div class="flex flex-col gap-1">
<div class="bg-surface-container-low text-on-surface p-3 rounded-2xl rounded-bl-sm border border-surface-variant shadow-sm font-body-md text-body-md">
                            Yes, make it a combo. And I'd like to add extra spicy mayo to that.
                        </div>
<span class="font-label-sm text-[10px] text-secondary ml-1">10:45 AM</span>
</div>
</div>
</div>
<!-- Message Input Area -->
<div class="p-4 bg-surface-container-lowest border-t border-surface-variant">
<!-- AI Suggestions -->
<div class="flex gap-2 mb-3 overflow-x-auto pb-1 scrollbar-hide">
<button class="px-3 py-1.5 rounded-full border border-tertiary text-tertiary hover:bg-tertiary-fixed transition-colors font-label-sm text-[12px] whitespace-nowrap flex items-center gap-1 bg-surface-container-lowest">
<span class="material-symbols-outlined text-[14px]">robot_2</span> Confirmed. Adding extra mayo. Total is $18.50.
                    </button>
<button class="px-3 py-1.5 rounded-full border border-tertiary text-tertiary hover:bg-tertiary-fixed transition-colors font-label-sm text-[12px] whitespace-nowrap flex items-center gap-1 bg-surface-container-lowest">
<span class="material-symbols-outlined text-[14px]">robot_2</span> Noted. Pick up in 15 mins?
                    </button>
</div>
<div class="flex items-end gap-2 bg-surface-container-low rounded-xl border border-surface-variant p-2 focus-within:border-primary-container focus-within:ring-1 focus-within:ring-primary-container transition-all">
<button class="p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface-container-high">
<span class="material-symbols-outlined">attach_file</span>
</button>
<button class="p-2 text-secondary hover:text-primary transition-colors rounded-full hover:bg-surface-container-high">
<span class="material-symbols-outlined">mood</span>
</button>
<textarea class="flex-1 bg-transparent border-none focus:ring-0 resize-none py-2 px-2 max-h-32 text-body-md text-on-surface placeholder-on-surface-variant" placeholder="Type a message..." rows="1" style="min-height: 40px;"></textarea>
<button class="p-2 bg-primary-container text-white rounded-lg hover:bg-primary transition-colors shadow-sm flex items-center justify-center">
<span class="material-symbols-outlined">send</span>
</button>
</div>
<div class="flex justify-between items-center mt-2 px-2">
<span class="text-[10px] text-secondary flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span> WhatsApp API connected
                    </span>
<span class="text-[10px] text-secondary">Press Enter to send, Shift+Enter for new line</span>
</div>
</div>
</section>
<!-- Right Pane: Contextual Inspector (Hidden on tablet/mobile by default) -->
<section class="hidden lg:flex w-80 bg-surface-container-lowest border-l border-surface-variant flex-col overflow-y-auto z-10 shadow-[-2px_0_4px_rgba(0,0,0,0.02)]">
<!-- Customer Profile Card -->
<div class="p-6 border-b border-surface-variant bg-gradient-to-b from-primary-fixed/30 to-surface-container-lowest">
<div class="flex flex-col items-center text-center">
<div class="relative mb-3">
<img alt="Maria Garcia" class="w-20 h-20 rounded-full border-4 border-white shadow-sm" data-alt="A circular portrait of a smiling customer. Modern light-mode aesthetic. High-key lighting, vibrant coral accents, clean minimalist style. Warm and efficient mood." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAK3Oysz3UzFwomF1xd5ik1CGYugrRwN2Bb8LzMEpGDeQoltqnwDeTo8a__JHiNVbjUYfs2EsLIU6YnPGLk05ouHbxjjSc1hSj_VcH8CWROt5AIJyfSi-H85IGaItRz4BJD8nbnw43992wvTubT5TOfKzUUdhZFQvjXthXSOgQLxvI1mJ51qkyJgiCKe37RpjPDxg7fmnp3xGbYt14ACEE8yPmzoAtlTDkezu9gd9qygwF9eO97nznpQzJH5uqt7k1mPeRhcLyrWS0"/>
<span class="absolute bottom-0 right-1 px-1.5 py-0.5 bg-tertiary-container text-on-tertiary-container rounded-md text-[10px] font-bold border border-white">VIP</span>
</div>
<h3 class="font-headline-sm text-headline-sm font-bold text-on-surface">Maria Garcia</h3>
<p class="font-body-sm text-body-sm text-secondary mb-3">+1 (555) 019-8372</p>
<div class="flex gap-2 w-full">
<button class="flex-1 py-1.5 bg-surface-container text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high transition-colors flex justify-center items-center gap-1">
<span class="material-symbols-outlined text-[16px]">person</span> Profile
                        </button>
<button class="flex-1 py-1.5 bg-surface-container text-on-surface rounded-lg font-label-sm text-label-sm hover:bg-surface-container-high transition-colors flex justify-center items-center gap-1">
<span class="material-symbols-outlined text-[16px]">call</span> Call
                        </button>
</div>
</div>
</div>
<!-- AI Agent Status Bento Box -->
<div class="p-4 border-b border-surface-variant">
<h4 class="font-label-lg text-label-lg font-semibold text-on-surface mb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-tertiary">smart_toy</span> Copilot Status
                </h4>
<div class="bg-surface-container-low rounded-xl p-3 border border-surface-variant shadow-sm">
<div class="flex justify-between items-center mb-2">
<span class="font-body-sm text-body-sm text-secondary">Mode</span>
<span class="px-2 py-0.5 bg-green-100 text-green-800 rounded text-[10px] font-bold">Assisting</span>
</div>
<div class="flex justify-between items-center mb-2">
<span class="font-body-sm text-body-sm text-secondary">Sentiment</span>
<span class="flex items-center gap-1 text-on-surface font-label-sm text-[12px]">
                            Positive <span class="material-symbols-outlined text-[14px] text-green-500">sentiment_satisfied</span>
</span>
</div>
<div class="mt-3 pt-3 border-t border-surface-variant">
<span class="font-label-sm text-[10px] text-secondary block mb-1">Suggested Next Step:</span>
<button class="w-full text-left font-body-sm text-sm text-primary hover:underline truncate">
                            "Send payment link for $18.50"
                        </button>
</div>
</div>
</div>
<!-- Recent Orders -->
<div class="p-4 flex-1">
<div class="flex justify-between items-center mb-3">
<h4 class="font-label-lg text-label-lg font-semibold text-on-surface">Recent Orders</h4>
<button class="text-primary font-label-sm text-label-sm hover:underline">View All</button>
</div>
<div class="space-y-3">
<!-- Order Card 1 -->
<div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer relative overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-tertiary"></div>
<div class="flex justify-between items-start mb-2 pl-1">
<span class="font-label-sm text-label-sm font-bold text-on-surface">#4829 (Current)</span>
<span class="font-label-sm text-[10px] text-secondary">Processing</span>
</div>
<p class="font-body-sm text-sm text-on-surface mb-2 pl-1">Spicy Tuna Bowl Combo + Extra Mayo</p>
<div class="flex justify-between items-center pl-1">
<span class="font-label-lg text-label-lg font-bold text-primary">$18.50</span>
<span class="px-2 py-0.5 bg-surface-container-high rounded text-[10px] text-on-surface">Pickup</span>
</div>
</div>
<!-- Order Card 2 -->
<div class="bg-surface-container-lowest border border-surface-variant rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
<div class="flex justify-between items-start mb-2">
<span class="font-label-sm text-label-sm font-bold text-on-surface">#4710</span>
<span class="font-label-sm text-[10px] text-secondary">Oct 12</span>
</div>
<p class="font-body-sm text-sm text-secondary mb-2 truncate">Salmon Lover Roll, Miso Soup...</p>
<div class="flex justify-between items-center">
<span class="font-label-lg text-label-lg font-bold text-on-surface-variant">$24.00</span>
<span class="px-2 py-0.5 bg-surface-container-high rounded text-[10px] text-secondary">Delivered</span>
</div>
</div>
</div>
</div>
</section>
</main>
<!-- BottomNavBar (Mobile Only - Hidden on Desktop per logic) -->
<nav class="md:hidden fixed bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant pb-safe z-50">
<div class="flex justify-around items-center h-16">
<a class="flex flex-col items-center justify-center w-full h-full text-secondary hover:text-on-surface" href="#">
<span class="material-symbols-outlined mb-1">dashboard</span>
<span class="font-label-sm text-[10px]">Home</span>
</a>
<a class="flex flex-col items-center justify-center w-full h-full text-primary font-bold bg-primary-fixed/20 relative" href="#">
<div class="absolute top-0 w-8 h-1 bg-primary-container rounded-b-full"></div>
<span class="material-symbols-outlined mb-1" style="font-variation-settings: 'FILL' 1;">chat</span>
<span class="font-label-sm text-[10px]">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center w-full h-full text-secondary hover:text-on-surface" href="#">
<span class="material-symbols-outlined mb-1">receipt_long</span>
<span class="font-label-sm text-[10px]">Orders</span>
</a>
<a class="flex flex-col items-center justify-center w-full h-full text-secondary hover:text-on-surface" href="#">
<span class="material-symbols-outlined mb-1">person</span>
<span class="font-label-sm text-[10px]">Profile</span>
</a>
</div>
</nav>
</body></html>

<!-- Design System -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Admin Dashboard</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container": "#edeeef",
                        "secondary-fixed-dim": "#c1c8ca",
                        "on-error": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "background": "#f8f9fa",
                        "primary-fixed-dim": "#ffb3b0",
                        "tertiary-fixed-dim": "#93ccff",
                        "surface": "#f8f9fa",
                        "on-secondary-fixed": "#161d1f",
                        "secondary-fixed": "#dde4e6",
                        "primary-container": "#ff6b6b",
                        "surface-dim": "#d9dadb",
                        "inverse-surface": "#2e3132",
                        "secondary": "#586062",
                        "outline": "#8c706f",
                        "on-primary-fixed": "#410006",
                        "primary-fixed": "#ffdad8",
                        "tertiary": "#006398",
                        "on-secondary": "#ffffff",
                        "on-surface": "#191c1d",
                        "tertiary-fixed": "#cde5ff",
                        "outline-variant": "#e0bfbd",
                        "secondary-container": "#dae1e3",
                        "on-primary": "#ffffff",
                        "on-tertiary-fixed": "#001d31",
                        "inverse-on-surface": "#f0f1f2",
                        "surface-container-low": "#f3f4f5",
                        "on-surface-variant": "#584140",
                        "on-tertiary": "#ffffff",
                        "tertiary-container": "#3aa2ea",
                        "on-background": "#191c1d",
                        "surface-variant": "#e1e3e4",
                        "on-tertiary-fixed-variant": "#004b74",
                        "primary": "#ae2f34",
                        "surface-container-high": "#e7e8e9",
                        "on-tertiary-container": "#003655",
                        "on-primary-container": "#6d0010",
                        "surface-tint": "#ae2f34",
                        "inverse-primary": "#ffb3b0",
                        "surface-bright": "#f8f9fa",
                        "on-secondary-fixed-variant": "#41484a",
                        "on-error-container": "#93000a",
                        "on-secondary-container": "#5d6466",
                        "surface-container-highest": "#e1e3e4",
                        "on-primary-fixed-variant": "#8c1520",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "nav-width-collapsed": "72px",
                        "stack-gap": "0.5rem",
                        "pane-sidebar-width": "320px",
                        "margin-desktop": "2rem",
                        "gutter": "1rem",
                        "nav-width-expanded": "240px",
                        "margin-mobile": "1rem"
                    },
                    "fontFamily": {
                        "label-sm": ["Inter"],
                        "label-lg": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .material-symbols-outlined[data-weight="fill"] {
            font-variation-settings: 'FILL' 1;
        }
    </style>
</head>
<body class="bg-background text-on-surface font-body-md antialiased overflow-hidden">
<!-- TopNavBar (hidden on mobile, visible md+) -->
<header class="hidden md:flex justify-between items-center h-16 px-margin-desktop bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant dark:border-outline fixed top-0 right-0 w-[calc(100%-240px)] z-40 transition-all duration-200">
<div class="flex items-center gap-4">
<div class="relative">
<span aria-hidden="true" class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary">search</span>
<input class="pl-10 pr-4 py-2 bg-surface-container-low border-none rounded-full font-body-sm text-body-sm focus:ring-2 focus:ring-primary-container outline-none w-64 text-on-surface placeholder:text-secondary" placeholder="Search orders, menus, users..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button aria-label="notifications" class="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button aria-label="help" class="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="help">help</span>
</button>
<button aria-label="account_circle" class="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined" data-icon="account_circle" data-weight="fill">account_circle</span>
</button>
</div>
</header>
<!-- SideNavBar (hidden md-, visible md+) -->
<nav class="hidden md:flex flex-col h-screen py-6 px-4 bg-surface border-r border-outline-variant fixed left-0 top-0 h-full w-nav-width-expanded z-50">
<div class="mb-8 px-4 flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary font-bold">
                 SP
             </div>
<div>
<h1 class="font-headline-md text-headline-md font-bold text-primary">Sushi Poke &amp; Roll</h1>
<p class="font-label-sm text-label-sm text-secondary">Admin Dashboard</p>
</div>
</div>
<ul class="flex flex-col gap-2 flex-grow">
<!-- Active Tab: Dashboard -->
<li>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-l-4 border-primary bg-primary-fixed hover:bg-surface-container transition-colors scale-[0.99] duration-150" href="#">
<span class="material-symbols-outlined" data-icon="dashboard" data-weight="fill">dashboard</span>
<span class="font-label-lg text-label-lg">Dashboard</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="chat">chat</span>
<span class="font-label-lg text-label-lg">Inbox</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
<span class="font-label-lg text-label-lg">Menu</span>
</a>
</li>
<li>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
<span class="font-label-lg text-label-lg">Content Planner</span>
</a>
</li>
</ul>
<div class="mt-auto flex flex-col gap-2 border-t border-outline-variant pt-4">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-label-lg text-label-lg">Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-error hover:bg-error-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
<span class="font-label-lg text-label-lg">Logout</span>
</a>
</div>
</nav>
<!-- Main Content Area -->
<main class="md:ml-[240px] pt-16 h-screen overflow-y-auto bg-background p-margin-mobile md:p-margin-desktop">
<div class="mb-8 flex justify-between items-end">
<div>
<h2 class="font-display-lg text-display-lg text-on-surface">Overview</h2>
<p class="font-body-md text-body-md text-secondary mt-1">Today's operational metrics and alerts.</p>
</div>
<button class="bg-primary-container text-on-primary font-label-lg text-label-lg px-6 py-2.5 rounded-full hover:bg-primary transition-colors flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined text-[20px]">add</span>
                New Order
            </button>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
<!-- Key Metrics (Spans 8 cols) -->
<div class="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
<!-- Sales -->
<div class="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary-container">
<span class="material-symbols-outlined">payments</span>
</div>
<span class="bg-surface-container-low text-secondary font-label-sm text-label-sm px-2 py-1 rounded">Today</span>
</div>
<div>
<p class="font-label-sm text-label-sm text-secondary mb-1">Gross Sales</p>
<h3 class="font-headline-lg text-headline-lg text-on-surface">$4,250.00</h3>
<p class="font-label-sm text-label-sm text-tertiary-container mt-2 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">trending_up</span> +12% from yesterday
                        </p>
</div>
</div>
<!-- Active Orders -->
<div class="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-full bg-primary-container/20 flex items-center justify-center text-primary-container">
<span class="material-symbols-outlined">receipt_long</span>
</div>
</div>
<div>
<p class="font-label-sm text-label-sm text-secondary mb-1">Active Orders</p>
<h3 class="font-headline-lg text-headline-lg text-on-surface">34</h3>
<p class="font-label-sm text-label-sm text-secondary mt-2">12 pending prep</p>
</div>
</div>
<!-- Fulfillment -->
<div class="bg-surface-container-lowest p-6 rounded-xl border border-surface-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] flex flex-col justify-between">
<div class="flex justify-between items-start mb-4">
<div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
<span class="material-symbols-outlined">moped</span>
</div>
</div>
<div>
<p class="font-label-sm text-label-sm text-secondary mb-1">Avg. Prep Time</p>
<h3 class="font-headline-lg text-headline-lg text-on-surface">18m</h3>
<p class="font-label-sm text-label-sm text-secondary mt-2 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px]">check_circle</span> On target
                         </p>
</div>
</div>
</div>
<!-- Urgent Alerts (Spans 4 cols) -->
<div class="md:col-span-4 bg-error-container/20 border border-error/20 p-6 rounded-xl flex flex-col">
<div class="flex items-center gap-2 mb-4 text-error">
<span class="material-symbols-outlined">error</span>
<h3 class="font-headline-sm text-headline-sm font-semibold">Action Required</h3>
</div>
<div class="space-y-4 flex-grow">
<div class="bg-surface-container-lowest p-4 rounded-lg border border-error/10 shadow-sm flex items-start gap-3">
<div class="w-2 h-2 rounded-full bg-error mt-2"></div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Low Inventory: Salmon</p>
<p class="font-body-sm text-body-sm text-secondary mt-1">Only 2 portions remaining.</p>
<button class="mt-2 text-primary font-label-sm text-label-sm hover:underline">Restock Now</button>
</div>
</div>
<div class="bg-surface-container-lowest p-4 rounded-lg border border-surface-variant shadow-sm flex items-start gap-3">
<div class="w-2 h-2 rounded-full bg-tertiary-container mt-2"></div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Delayed Order #402</p>
<p class="font-body-sm text-body-sm text-secondary mt-1">Pending for 25+ minutes.</p>
</div>
</div>
</div>
</div>
<!-- Active Orders List (Spans 8 cols) -->
<div class="md:col-span-8 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
<div class="p-6 border-b border-surface-variant flex justify-between items-center bg-surface-container-low/50">
<h3 class="font-headline-md text-headline-md text-on-surface">Recent Orders</h3>
<button class="text-secondary hover:text-primary font-label-sm text-label-sm flex items-center gap-1">
                        View All <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
</button>
</div>
<div class="divide-y divide-surface-variant">
<!-- Order Item -->
<div class="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center font-bold text-secondary">
                                #405
                            </div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Spicy Tuna Roll (x2), Edamame</p>
<p class="font-body-sm text-body-sm text-secondary flex items-center gap-2 mt-1">
<span class="material-symbols-outlined text-[14px]">person</span> Alex M.
                                    <span class="w-1 h-1 rounded-full bg-secondary-fixed-dim"></span>
                                    10:42 AM
                                </p>
</div>
</div>
<div class="flex items-center gap-4">
<span class="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm rounded-full border border-tertiary-container/30">Preparing</span>
<span class="font-label-lg text-label-lg text-on-surface">$32.50</span>
<button class="opacity-0 group-hover:opacity-100 p-2 text-secondary hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<!-- Order Item -->
<div class="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between group">
<div class="flex items-center gap-4">
<div class="w-12 h-12 bg-surface-container rounded-lg flex items-center justify-center font-bold text-secondary">
                                #404
                            </div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Salmon Poke Bowl (Large)</p>
<p class="font-body-sm text-body-sm text-secondary flex items-center gap-2 mt-1">
<span class="material-symbols-outlined text-[14px]">person</span> Sarah J.
                                    <span class="w-1 h-1 rounded-full bg-secondary-fixed-dim"></span>
                                    10:35 AM
                                </p>
</div>
</div>
<div class="flex items-center gap-4">
<span class="px-3 py-1 bg-surface-container text-secondary font-label-sm text-label-sm rounded-full border border-surface-variant">Ready</span>
<span class="font-label-lg text-label-lg text-on-surface">$18.00</span>
<button class="opacity-0 group-hover:opacity-100 p-2 text-secondary hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
</div>
</div>
<!-- AI Content Preview (Spans 4 cols) -->
<div class="md:col-span-4 bg-gradient-to-br from-surface-container-lowest to-surface-container-low p-6 rounded-xl border border-surface-variant shadow-[0_2px_4px_rgba(0,0,0,0.05)] relative overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-10">
<span class="material-symbols-outlined text-6xl">smart_toy</span>
</div>
<div class="relative z-10">
<div class="flex items-center gap-2 mb-4 text-tertiary-container">
<span class="material-symbols-outlined">auto_awesome</span>
<h3 class="font-headline-sm text-headline-sm font-semibold text-on-surface">AI Social Post</h3>
</div>
<p class="font-body-sm text-body-sm text-secondary mb-4">Generated draft for today's special.</p>
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-4 mb-4">
<div class="h-32 bg-surface-container rounded-md mb-3 bg-cover bg-center" data-alt="A vibrant top-down close-up of a fresh salmon poke bowl arranged neatly in a dark ceramic bowl. The lighting is bright and studio-quality, emphasizing the glossy texture of the raw salmon and the vivid greens of the edamame. The setting is modern and clean, fitting a high-end casual dining aesthetic. The mood is appetizing and fresh." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuDFElO-54IfaPMC-MnaHBZsfcQm0uLvIOt3xKgoT0g62Noi-GEx_D6TqmPZmUeFxbN-vBPKuYKSkzjLGKVum3R4nyoLlVMoQbhVtj51brqcHEM9XlYF8pNVWp1zYhYwZsebd7xtxCFPIVH6FnOMhPAh2cAnjU9ktybxNLMG15UyhdlgrgpAKMRAZT6_4SGBOyKmUGrLSvHzNpeGp0aL-UZbJu00ZTcmDOYVzjYnkakZ9q_n1l7jHTfIq1bJEL0IGMnJ6UYvxKTUDXk');"></div>
<p class="font-body-sm text-body-sm text-on-surface-variant">Beat the midday slump with our fresh Salmon Poke Bowl! 🍣 Fresh cuts, vibrant veggies, and our signature house sauce. Order now for pickup! #SushiPokeRoll #LunchSpecial</p>
</div>
<div class="flex gap-2">
<button class="flex-1 border border-outline text-on-surface font-label-sm text-label-sm py-2 rounded-full hover:bg-surface-container-high transition-colors">Edit Draft</button>
<button class="flex-1 bg-tertiary-container text-on-tertiary py-2 rounded-full font-label-sm text-label-sm hover:bg-tertiary transition-colors">Publish Now</button>
</div>
</div>
</div>
</div>
</main>
</body></html>

<!-- Centro de Mensajería Omnicanal - Escritorio -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Content Planner</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container": "#edeeef",
                        "secondary-fixed-dim": "#c1c8ca",
                        "on-error": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "background": "#f8f9fa",
                        "primary-fixed-dim": "#ffb3b0",
                        "tertiary-fixed-dim": "#93ccff",
                        "surface": "#f8f9fa",
                        "on-secondary-fixed": "#161d1f",
                        "secondary-fixed": "#dde4e6",
                        "primary-container": "#ff6b6b",
                        "surface-dim": "#d9dadb",
                        "inverse-surface": "#2e3132",
                        "secondary": "#586062",
                        "outline": "#8c706f",
                        "on-primary-fixed": "#410006",
                        "primary-fixed": "#ffdad8",
                        "tertiary": "#006398",
                        "on-secondary": "#ffffff",
                        "on-surface": "#191c1d",
                        "tertiary-fixed": "#cde5ff",
                        "outline-variant": "#e0bfbd",
                        "secondary-container": "#dae1e3",
                        "on-primary": "#ffffff",
                        "on-tertiary-fixed": "#001d31",
                        "inverse-on-surface": "#f0f1f2",
                        "surface-container-low": "#f3f4f5",
                        "on-surface-variant": "#584140",
                        "on-tertiary": "#ffffff",
                        "tertiary-container": "#3aa2ea",
                        "on-background": "#191c1d",
                        "surface-variant": "#e1e3e4",
                        "on-tertiary-fixed-variant": "#004b74",
                        "primary": "#ae2f34",
                        "surface-container-high": "#e7e8e9",
                        "on-tertiary-container": "#003655",
                        "on-primary-container": "#6d0010",
                        "surface-tint": "#ae2f34",
                        "inverse-primary": "#ffb3b0",
                        "surface-bright": "#f8f9fa",
                        "on-secondary-fixed-variant": "#41484a",
                        "on-error-container": "#93000a",
                        "on-secondary-container": "#5d6466",
                        "surface-container-highest": "#e1e3e4",
                        "on-primary-fixed-variant": "#8c1520",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "nav-width-collapsed": "72px",
                        "stack-gap": "0.5rem",
                        "pane-sidebar-width": "320px",
                        "margin-desktop": "2rem",
                        "gutter": "1rem",
                        "nav-width-expanded": "240px",
                        "margin-mobile": "1rem"
                    },
                    "fontFamily": {
                        "label-sm": ["Inter"],
                        "label-lg": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-background text-on-background flex min-h-screen overflow-hidden">
<!-- SideNavBar -->
<nav class="hidden md:flex flex-col h-screen py-6 px-4 fixed left-0 top-0 w-nav-width-expanded bg-surface dark:bg-inverse-surface border-r border-outline-variant dark:border-outline z-50">
<div class="mb-8 px-2 flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-headline-md">S</div>
<div>
<h1 class="font-headline-sm text-headline-sm font-black text-on-surface">Sushi Poke &amp; Roll</h1>
<p class="font-label-sm text-label-sm text-on-surface-variant">Admin Dashboard</p>
</div>
</div>
<div class="flex-1 space-y-2">
<a class="flex items-center gap-4 px-4 py-3 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container transition-colors group" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-lg text-label-lg">Dashboard</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container transition-colors group" href="#">
<span class="material-symbols-outlined">chat</span>
<span class="font-label-lg text-label-lg">Inbox</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container transition-colors group" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
<span class="font-label-lg text-label-lg">Menu</span>
</a>
<!-- Active State -->
<a class="flex items-center gap-4 px-4 py-3 rounded-lg text-primary dark:text-inverse-primary font-bold border-l-4 border-primary dark:border-inverse-primary bg-primary-fixed dark:bg-on-primary-fixed-variant scale-[0.99] transition-transform duration-150" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
<span class="font-label-lg text-label-lg">Content Planner</span>
</a>
</div>
<div class="mt-auto space-y-2 pt-6 border-t border-outline-variant dark:border-outline">
<a class="flex items-center gap-4 px-4 py-3 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container transition-colors group" href="#">
<span class="material-symbols-outlined">settings</span>
<span class="font-label-lg text-label-lg">Settings</span>
</a>
<a class="flex items-center gap-4 px-4 py-3 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:bg-surface-container transition-colors group" href="#">
<span class="material-symbols-outlined">logout</span>
<span class="font-label-lg text-label-lg">Logout</span>
</a>
</div>
</nav>
<!-- TopNavBar -->
<header class="hidden md:flex justify-between items-center h-16 px-margin-desktop fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-surface-container-lowest dark:bg-surface-container-low border-b border-outline-variant dark:border-outline transition-all duration-200">
<div class="flex items-center gap-4 flex-1">
<div class="relative w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="w-full pl-9 pr-4 py-2 bg-surface-container rounded-full border-none font-body-sm text-body-sm focus:ring-2 focus:ring-primary focus:bg-surface-container-lowest transition-colors" placeholder="Search..." type="text"/>
</div>
</div>
<div class="flex items-center gap-4">
<button class="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
</button>
<button class="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">help</span>
</button>
<button class="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">account_circle</span>
</button>
</div>
</header>
<!-- Main Content Area -->
<main class="flex-1 ml-0 md:ml-nav-width-expanded mt-0 md:mt-16 flex h-[calc(100vh-64px)] overflow-hidden bg-background">
<!-- Calendar View (Workspace) -->
<section class="flex-1 flex flex-col min-w-0 border-r border-outline-variant">
<!-- Toolbar -->
<div class="flex items-center justify-between px-6 py-4 border-b border-outline-variant bg-surface-container-lowest">
<div class="flex items-center gap-4">
<h2 class="font-headline-md text-headline-md text-on-surface">October 2023</h2>
<div class="flex items-center bg-surface-container rounded-lg p-1">
<button class="p-1.5 rounded-md hover:bg-surface-container-highest text-on-surface-variant"><span class="material-symbols-outlined">chevron_left</span></button>
<button class="p-1.5 rounded-md hover:bg-surface-container-highest text-on-surface-variant"><span class="material-symbols-outlined">chevron_right</span></button>
</div>
</div>
<div class="flex items-center gap-3">
<button class="px-4 py-2 border border-outline rounded-lg font-label-lg text-label-lg text-secondary hover:bg-surface-container transition-colors">Filter</button>
<button class="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-label-lg text-label-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
<span class="material-symbols-outlined">add</span> New Post
                    </button>
</div>
</div>
<!-- Calendar Grid -->
<div class="flex-1 overflow-y-auto p-6 bg-surface">
<div class="grid grid-cols-7 gap-4 h-full min-h-[600px]">
<!-- Day Headers -->
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">MON</div>
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">TUE</div>
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">WED</div>
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">THU</div>
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">FRI</div>
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">SAT</div>
<div class="font-label-sm text-label-sm text-on-surface-variant text-center pb-2">SUN</div>
<!-- Empty slots for previous month -->
<div class="bg-surface-container-low rounded-xl border border-outline-variant/30 min-h-[120px] p-2 opacity-50"></div>
<!-- Days -->
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-h-[120px] p-2 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer">
<span class="font-body-sm text-body-sm text-on-surface ml-1">1</span>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-h-[120px] p-2 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer">
<span class="font-body-sm text-body-sm text-on-surface ml-1">2</span>
<div class="bg-[#F8F9FA] rounded border border-[#E9ECEF] p-2 text-xs relative group">
<span class="w-2 h-2 rounded-full bg-blue-500 absolute top-2 right-2"></span>
<div class="font-label-sm font-bold truncate text-on-surface">New Roll Promo</div>
<div class="text-[10px] text-on-surface-variant mt-1">12:00 PM • IG</div>
</div>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-h-[120px] p-2 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer">
<span class="font-body-sm text-body-sm text-on-surface ml-1">3</span>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-primary ring-2 ring-primary/20 shadow-sm min-h-[120px] p-2 flex flex-col gap-2 cursor-pointer bg-primary-fixed/10">
<span class="font-body-sm text-body-sm font-bold text-primary ml-1">4</span>
<div class="bg-surface-container-lowest rounded border border-outline-variant p-2 text-xs shadow-sm">
<span class="w-2 h-2 rounded-full bg-green-500 absolute top-2 right-2"></span>
<div class="font-label-sm font-bold truncate text-on-surface">Weekend Special</div>
<div class="text-[10px] text-on-surface-variant mt-1">5:00 PM • FB, IG</div>
</div>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-h-[120px] p-2 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer">
<span class="font-body-sm text-body-sm text-on-surface ml-1">5</span>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm min-h-[120px] p-2 flex flex-col gap-2 hover:border-primary transition-colors cursor-pointer">
<span class="font-body-sm text-body-sm text-on-surface ml-1">6</span>
</div>
</div>
</div>
</section>
<!-- Right Inspector (Post Details & AI) -->
<aside class="w-pane-sidebar-width bg-surface-container-lowest flex flex-col h-full border-l border-outline-variant shrink-0 z-10">
<div class="p-4 border-b border-outline-variant flex items-center justify-between sticky top-0 bg-surface-container-lowest">
<h3 class="font-body-md text-body-md font-bold text-on-surface">Post Inspector</h3>
<button class="text-on-surface-variant hover:text-on-surface"><span class="material-symbols-outlined">close</span></button>
</div>
<div class="flex-1 overflow-y-auto p-4 space-y-6">
<!-- Preview -->
<div>
<h4 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Preview</h4>
<div class="bg-surface rounded-xl border border-outline-variant overflow-hidden shadow-sm">
<div class="p-3 flex items-center gap-2 border-b border-outline-variant">
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-xs font-bold text-white">SP</div>
<div class="font-label-sm text-label-sm font-bold text-on-surface">sushipoke</div>
</div>
<div class="aspect-square bg-surface-container-high relative">
<img alt="A vibrant, high-quality photograph of a beautifully arranged sushi platter on a minimalist dark slate board. The lighting is bright and modern, creating a fresh, appetizing aesthetic suitable for a modern culinary brand. The color palette features intense coral tones of fresh salmon contrasting with clean whites and deep charcoal grays. The mood is energetic and premium." class="object-cover w-full h-full" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl0mB7-Dm7diJRltVytxcTCXV_kO9L1IG6a0TaQ9Y74CeaP6IU-zkEg5zNBFoa2v2rCMLbTA8FLkOyILug0ZlCRbQsT3VfO13dS4aJnUpuMDk8BpSgwOQ-W6IoY_62btNRxbjehuYuZMlo5vfDkdCc2go8ktO-ApIWlLT3Sa1UPi5G7BkjvQaBAjYeN04BfKVihwBlMGAMyl4BS3Vxcr_5XkK6I6HEv2JJefPzrK9WHBiZFUgD5DMEY4ATgDS-xUKquww0IJz4Zyk"/>
</div>
<div class="p-3">
<p class="font-body-sm text-body-sm text-on-surface line-clamp-3">Get ready for the weekend with our new Volcano Roll! 🌋 Packed with spicy tuna and topped with our signature coral sauce. Tag your sushi buddy below! 👇🍣 #SushiTime #WeekendVibes</p>
</div>
</div>
</div>
<!-- AI Suggestions -->
<div>
<h4 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2 flex items-center gap-1">
<span class="material-symbols-outlined text-[16px] text-tertiary">auto_awesome</span> AI Caption Ideas
                    </h4>
<div class="space-y-2">
<div class="p-3 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm hover:border-primary cursor-pointer transition-colors relative group">
                            "Spice up your Friday with the Volcano Roll! Who are you sharing this with? 🔥🍣"
                            <button class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-primary transition-opacity"><span class="material-symbols-outlined text-sm">content_copy</span></button>
</div>
<div class="p-3 rounded-lg border border-outline-variant bg-surface text-body-sm font-body-sm hover:border-primary cursor-pointer transition-colors relative group">
                            "Weekend cravings? We got you. Meet the new Volcano Roll. Order now via link in bio! 🏃‍♂️💨"
                            <button class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-primary transition-opacity"><span class="material-symbols-outlined text-sm">content_copy</span></button>
</div>
</div>
</div>
<!-- Metrics Placeholder -->
<div>
<h4 class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-2">Estimated Reach</h4>
<div class="grid grid-cols-2 gap-2">
<div class="bg-surface rounded-lg p-3 border border-outline-variant flex flex-col items-center justify-center">
<span class="font-headline-md text-headline-md text-on-surface font-bold">1.2k</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Views</span>
</div>
<div class="bg-surface rounded-lg p-3 border border-outline-variant flex flex-col items-center justify-center">
<span class="font-headline-md text-headline-md text-on-surface font-bold">85</span>
<span class="font-label-sm text-label-sm text-on-surface-variant">Engagements</span>
</div>
</div>
</div>
</div>
<div class="p-4 border-t border-outline-variant bg-surface-container-lowest">
<button class="w-full py-2 bg-primary-container text-on-primary-container rounded-lg font-label-lg text-label-lg font-bold hover:opacity-90 transition-opacity">Schedule Post</button>
</div>
</aside>
</main>
</body></html>

<!-- Panel de Control - Escritorio -->
<!DOCTYPE html>

<html class="light" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Product Catalog Management</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container": "#edeeef",
                        "secondary-fixed-dim": "#c1c8ca",
                        "on-error": "#ffffff",
                        "surface-container-lowest": "#ffffff",
                        "background": "#f8f9fa",
                        "primary-fixed-dim": "#ffb3b0",
                        "tertiary-fixed-dim": "#93ccff",
                        "surface": "#f8f9fa",
                        "on-secondary-fixed": "#161d1f",
                        "secondary-fixed": "#dde4e6",
                        "primary-container": "#ff6b6b",
                        "surface-dim": "#d9dadb",
                        "inverse-surface": "#2e3132",
                        "secondary": "#586062",
                        "outline": "#8c706f",
                        "on-primary-fixed": "#410006",
                        "primary-fixed": "#ffdad8",
                        "tertiary": "#006398",
                        "on-secondary": "#ffffff",
                        "on-surface": "#191c1d",
                        "tertiary-fixed": "#cde5ff",
                        "outline-variant": "#e0bfbd",
                        "secondary-container": "#dae1e3",
                        "on-primary": "#ffffff",
                        "on-tertiary-fixed": "#001d31",
                        "inverse-on-surface": "#f0f1f2",
                        "surface-container-low": "#f3f4f5",
                        "on-surface-variant": "#584140",
                        "on-tertiary": "#ffffff",
                        "tertiary-container": "#3aa2ea",
                        "on-background": "#191c1d",
                        "surface-variant": "#e1e3e4",
                        "on-tertiary-fixed-variant": "#004b74",
                        "primary": "#ae2f34",
                        "surface-container-high": "#e7e8e9",
                        "on-tertiary-container": "#003655",
                        "on-primary-container": "#6d0010",
                        "surface-tint": "#ae2f34",
                        "inverse-primary": "#ffb3b0",
                        "surface-bright": "#f8f9fa",
                        "on-secondary-fixed-variant": "#41484a",
                        "on-error-container": "#93000a",
                        "on-secondary-container": "#5d6466",
                        "surface-container-highest": "#e1e3e4",
                        "on-primary-fixed-variant": "#8c1520",
                        "error-container": "#ffdad6",
                        "error": "#ba1a1a"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "nav-width-collapsed": "72px",
                        "stack-gap": "0.5rem",
                        "pane-sidebar-width": "320px",
                        "margin-desktop": "2rem",
                        "gutter": "1rem",
                        "nav-width-expanded": "240px",
                        "margin-mobile": "1rem"
                    },
                    "fontFamily": {
                        "label-sm": ["Inter"],
                        "label-lg": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-lg": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .toggle-checkbox:checked {
            right: 0;
            border-color: #FF6B6B;
        }
        .toggle-checkbox:checked + .toggle-label {
            background-color: #FF6B6B;
        }
        .toggle-checkbox:checked + .toggle-label:after {
            transform: translateX(100%);
            border-color: white;
        }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen overflow-hidden">
<!-- Top Navigation Bar -->
<header class="bg-surface-container-lowest dark:bg-surface-container-low fixed top-0 right-0 w-[calc(100%-240px)] z-40 border-b border-outline-variant dark:border-outline flex justify-between items-center h-16 px-margin-desktop transition-all duration-200">
<div class="flex items-center gap-4">
<!-- Search bar on_left -->
<div class="relative w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]">search</span>
<input class="w-full bg-surface-container-low border border-surface-variant rounded-full pl-10 pr-4 py-2 text-label-sm font-label-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors" placeholder="Search menu items..." type="text"/>
</div>
</div>
<div class="flex items-center gap-6">
<h1 class="font-headline-sm text-headline-sm font-black text-on-surface dark:text-inverse-on-surface tracking-tight hidden lg:block">Sushi Poke &amp; Roll</h1>
<div class="flex items-center gap-2">
<button class="p-2 rounded-full text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined" data-weight="fill" style="font-variation-settings: 'FILL' 0;">notifications</span>
</button>
<button class="p-2 rounded-full text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined" data-weight="fill" style="font-variation-settings: 'FILL' 0;">help</span>
</button>
<button class="p-2 rounded-full text-on-surface-variant dark:text-surface-variant hover:text-primary dark:hover:text-inverse-primary hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined" data-weight="fill" style="font-variation-settings: 'FILL' 0;">account_circle</span>
</button>
</div>
</div>
</header>
<!-- Side Navigation Bar -->
<nav class="bg-surface dark:bg-inverse-surface fixed left-0 top-0 h-full w-nav-width-expanded border-r border-outline-variant dark:border-outline flex flex-col py-6 px-4 z-50">
<!-- Brand Header -->
<div class="mb-8 px-2 flex items-center gap-3">
<div class="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
<span class="material-symbols-outlined text-on-primary-container" style="font-variation-settings: 'FILL' 1;">restaurant</span>
</div>
<div class="overflow-hidden">
<div class="font-headline-md text-[18px] font-bold text-primary dark:text-inverse-primary truncate">Sushi Poke &amp; Roll</div>
<div class="font-label-sm text-label-sm text-secondary truncate">Admin Dashboard</div>
</div>
</div>
<!-- Main Tabs -->
<div class="flex-1 space-y-2">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">dashboard</span>
<span>Dashboard</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">chat</span>
<span>Inbox</span>
</a>
<!-- ACTIVE TAB -->
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-primary dark:text-inverse-primary font-bold border-l-4 border-primary dark:border-inverse-primary bg-primary-fixed dark:bg-on-primary-fixed-variant font-label-lg text-label-lg Active: scale-[0.99] transition-transform duration-150" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">restaurant_menu</span>
<span>Menu</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">calendar_month</span>
<span>Content Planner</span>
</a>
</div>
<!-- Footer Tabs -->
<div class="mt-auto space-y-2 pt-4 border-t border-surface-variant">
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">settings</span>
<span>Settings</span>
</a>
<a class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-secondary dark:text-secondary-fixed-dim hover:text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 0;">logout</span>
<span>Logout</span>
</a>
</div>
</nav>
<!-- Main Content Area -->
<main class="ml-nav-width-expanded pt-16 h-screen flex flex-col overflow-hidden bg-background">
<!-- Page Header & Controls -->
<div class="bg-surface-container-lowest px-margin-desktop py-6 border-b border-surface-variant flex-shrink-0 z-10 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
<div class="flex justify-between items-end">
<div>
<h2 class="font-headline-lg text-headline-lg text-on-surface mb-2">Catalog Management</h2>
<p class="font-body-md text-body-md text-secondary">Manage availability, pricing, and promotions for all items.</p>
</div>
<div class="flex items-center gap-4">
<!-- View Toggle -->
<div class="flex bg-surface-container rounded-lg p-1">
<button class="px-3 py-1.5 rounded-md bg-surface-container-lowest shadow-sm text-primary font-label-sm text-label-sm flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">grid_view</span>
                            Grid
                        </button>
<button class="px-3 py-1.5 rounded-md text-secondary hover:text-on-surface font-label-sm text-label-sm flex items-center gap-2 transition-colors">
<span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 0;">view_list</span>
                            List
                        </button>
</div>
<button class="bg-primary-container text-on-primary-container font-label-lg text-label-lg px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary-fixed transition-colors shadow-[0_2px_4px_rgba(0,0,0,0.05)] font-semibold">
<span class="material-symbols-outlined text-[20px]" style="font-variation-settings: 'FILL' 1;">campaign</span>
                        Create Promo
                    </button>
</div>
</div>
<!-- Filters -->
<div class="flex gap-3 mt-6">
<button class="px-4 py-1.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm border border-primary-fixed-dim transition-colors">All Items (142)</button>
<button class="px-4 py-1.5 rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-container font-label-sm text-label-sm border border-surface-variant transition-colors">Sushi Rolls</button>
<button class="px-4 py-1.5 rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-container font-label-sm text-label-sm border border-surface-variant transition-colors">Poke Bowls</button>
<button class="px-4 py-1.5 rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-container font-label-sm text-label-sm border border-surface-variant transition-colors">Combos</button>
<button class="px-4 py-1.5 rounded-full bg-surface-container-lowest text-secondary hover:bg-surface-container font-label-sm text-label-sm border border-surface-variant transition-colors">Beverages</button>
</div>
</div>
<!-- Scrollable Grid Canvas -->
<div class="flex-1 overflow-y-auto p-margin-desktop bg-background">
<!-- Category Section -->
<div class="mb-8">
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-4 flex items-center gap-2">
                    Signature Poke Bowls
                    <span class="bg-surface-container px-2 py-0.5 rounded-full text-secondary font-label-sm text-[11px]">8 Items</span>
</h3>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<!-- Product Card 1 -->
<div class="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col relative">
<div class="h-40 w-full bg-surface-container relative overflow-hidden">
<img alt="Hawaiian Classic Poke" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A top-down view of a vibrant, freshly prepared Hawaiian poke bowl in a modern ceramic dish resting on a clean, light surface. The bowl is packed with bright pink diced tuna, vibrant green edamame, sliced avocado, and sprinkled with black sesame seeds. The lighting is bright, high-key, and natural, creating a fresh, appetizing, and organized modern culinary aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCv6btH24KSNzScyecG3wDJC2B4Q7tubkbyHWNWsKLRwBrW_3pUjJOXRrCkdw6DGZv1VUYRlAQ0sDzPWoIMi4o8UR5fnKFiEtr5rolp-tZ2oxklUr66dnMfFPdbtCuzE_aThpq5RBgT-8Cn1lNrI_ESczQi3JfQ2_S4Vzh5PUAC4KJF7RUcNdIY0PDU1df-cnsVCVCXOM8Xrwivd1Hgk3QE2jMvC2oZQZXmkutoPdBkklq7GdKv_7rJuDGLjlMvR55krjR3f49HKdA"/>
<div class="absolute top-3 left-3 flex gap-1">
<span class="bg-primary text-on-primary px-2 py-0.5 rounded-md font-label-sm text-[10px] uppercase font-bold tracking-wider shadow-sm">Popular</span>
</div>
</div>
<div class="p-4 flex flex-col flex-1">
<div class="flex justify-between items-start mb-1">
<h4 class="font-label-lg text-label-lg text-on-surface line-clamp-1 pr-2">Hawaiian Classic Poke</h4>
<span class="font-headline-sm text-[16px] text-primary font-bold whitespace-nowrap">$14.99</span>
</div>
<p class="font-body-sm text-body-sm text-secondary line-clamp-2 mb-4">Ahi tuna, sweet onion, scallions, sesame seeds, classic shoyu sauce over sushi rice.</p>
<div class="mt-auto pt-4 border-t border-surface-variant flex justify-between items-center">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-emerald-500"></span>
<span class="font-label-sm text-[11px] text-secondary">In Stock</span>
</div>
<!-- Toggle Switch -->
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input checked="" class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-surface-variant appearance-none cursor-pointer z-10 transition-transform duration-200" id="toggle1" name="toggle" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-5 rounded-full bg-surface-variant cursor-pointer transition-colors duration-200" for="toggle1"></label>
</div>
</div>
</div>
<!-- Hover Actions (Hidden by default, appear on hover) -->
<div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
<button class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-secondary hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[18px]">edit</span>
</button>
</div>
</div>
<!-- Product Card 2 -->
<div class="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden group hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-300 flex flex-col relative">
<div class="h-40 w-full bg-surface-container relative overflow-hidden">
<div class="absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]">
<span class="bg-surface-container-lowest text-on-surface px-3 py-1 rounded-md font-label-sm font-bold shadow-sm">Sold Out</span>
</div>
<img alt="Spicy Salmon Crunch" class="w-full h-full object-cover grayscale-[40%] group-hover:scale-105 transition-transform duration-500" data-alt="A stylized, overhead shot of a spicy salmon poke bowl featuring diced salmon, jalapeno slices, and crispy tempura flakes. The image has a slightly muted, desaturated tone to indicate it is currently unavailable, though the inherent high-quality food photography style remains. The setting is clean and modern, lit evenly to maintain a corporate yet appetizing visual standard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBFyMEkpeI6QHIbBAWHRrUXO2G4RMgrtM4eDfkQ5Deo-fX5H6apoFWQfWqQtNsbquK3S3QkrjTGb8zpLjLlAPS2ELiWi5eDDvN6nS2PvV0k9PRmLHtzd6LtBpZWvhd6Ajc9TmdJfwiSOow_FkYR_PzDMoztwSRvbgBITbEFM99kDulNzTIg_er1ZqI3f3xMODJTxD0Xo7P9piASbbrA9nmMee9tJLSVpFhdPeyDUpnKk9f0hG1cFW2-Wdkkc5vOvQdC48Ygcs-07eY"/>
</div>
<div class="p-4 flex flex-col flex-1 opacity-70">
<div class="flex justify-between items-start mb-1">
<h4 class="font-label-lg text-label-lg text-on-surface line-clamp-1 pr-2">Spicy Salmon Crunch</h4>
<span class="font-headline-sm text-[16px] text-on-surface font-bold whitespace-nowrap">$15.50</span>
</div>
<p class="font-body-sm text-body-sm text-secondary line-clamp-2 mb-4">Fresh salmon, spicy mayo, jalapeño, edamame, topped with crispy tempura flakes.</p>
<div class="mt-auto pt-4 border-t border-surface-variant flex justify-between items-center">
<div class="flex items-center gap-2">
<span class="w-2 h-2 rounded-full bg-error"></span>
<span class="font-label-sm text-[11px] text-error font-medium">Out of Stock</span>
</div>
<!-- Toggle Switch -->
<div class="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
<input class="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 border-surface-variant appearance-none cursor-pointer z-10 transition-transform duration-200" id="toggle2" name="toggle" type="checkbox"/>
<label class="toggle-label block overflow-hidden h-5 rounded-full bg-surface-variant cursor-pointer transition-colors duration-200" for="toggle2"></label>
</div>
</div>
</div>
<div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2 z-20">
<button class="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-secondary hover:text-primary transition-colors">
<span class="material-symbols-outlined text-[18px]">edit</span>
</button>
</div>
</div>
</div>
</div>
</div>
</main>
<script>
        // Simple toggle visual logic for the custom CSS checkboxes
        document.querySelectorAll('.toggle-checkbox').forEach(toggle => {
            toggle.addEventListener('change', function() {
                const card = this.closest('.bg-surface-container-lowest');
                const statusDot = card.querySelector('.rounded-full.w-2.h-2');
                const statusText = statusDot.nextElementSibling;
                const imgContainer = card.querySelector('.h-40');
                const contentArea = card.querySelector('.p-4');

                if(this.checked) {
                    statusDot.className = 'w-2 h-2 rounded-full bg-emerald-500';
                    statusText.textContent = 'In Stock';
                    statusText.className = 'font-label-sm text-[11px] text-secondary';
                    contentArea.classList.remove('opacity-70');
                    
                    const overlay = imgContainer.querySelector('.bg-black\\/40');
                    if(overlay) overlay.remove();
                    
                    const img = imgContainer.querySelector('img');
                    img.classList.remove('grayscale-[40%]');
                } else {
                    statusDot.className = 'w-2 h-2 rounded-full bg-error';
                    statusText.textContent = 'Out of Stock';
                    statusText.className = 'font-label-sm text-[11px] text-error font-medium';
                    contentArea.classList.add('opacity-70');
                    
                    const img = imgContainer.querySelector('img');
                    img.classList.add('grayscale-[40%]');
                    
                    if(!imgContainer.querySelector('.bg-black\\/40')) {
                        const overlay = document.createElement('div');
                        overlay.className = 'absolute inset-0 bg-black/40 z-10 flex items-center justify-center backdrop-blur-[2px]';
                        overlay.innerHTML = '<span class="bg-surface-container-lowest text-on-surface px-3 py-1 rounded-md font-label-sm font-bold shadow-sm">Sold Out</span>';
                        imgContainer.insertBefore(overlay, imgContainer.firstChild);
                    }
                }
            });
        });
    </script>
</body></html>

<!-- Planificador de Contenido - Escritorio -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Planificador</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-background": "#f8f9fa",
                        "primary-fixed": "#ffdad8",
                        "on-tertiary-container": "#b9dcff",
                        "on-secondary-fixed-variant": "#40484a",
                        "secondary-container": "#dce4e6",
                        "background": "#fff8f7",
                        "outline-variant": "#e0bfbd",
                        "on-background": "#251818",
                        "on-surface": "#251818",
                        "secondary-fixed-dim": "#c0c8ca",
                        "surface-container-low": "#fff0ef",
                        "on-primary-container": "#ffcdca",
                        "primary": "#8d151f",
                        "sidebar-charcoal": "#2e3132",
                        "on-surface-variant": "#584140",
                        "secondary": "#586062",
                        "coral-accent": "#ff6b6b",
                        "surface-bright": "#fff8f7",
                        "surface-container-high": "#fbe3e1",
                        "primary-container": "#ae2f34",
                        "tertiary-container": "#006398",
                        "error": "#ba1a1a",
                        "on-secondary-container": "#5e6668",
                        "surface-dim": "#edd5d3",
                        "primary-fixed-dim": "#ffb3b0",
                        "surface-container": "#ffe9e7",
                        "tertiary": "#004a74",
                        "on-primary-fixed": "#410006",
                        "border-subtle": "#e0bfbd",
                        "error-container": "#ffdad6",
                        "surface-variant": "#f5dddb",
                        "surface": "#fff8f7",
                        "surface-container-lowest": "#ffffff",
                        "on-tertiary-fixed-variant": "#004b74",
                        "on-primary-fixed-variant": "#8c151f",
                        "on-error": "#ffffff",
                        "inverse-on-surface": "#ffedeb",
                        "outline": "#8c706f",
                        "surface-container-highest": "#f5dddb",
                        "on-error-container": "#93000a",
                        "on-tertiary-fixed": "#001d32",
                        "inverse-surface": "#3b2d2c",
                        "on-primary": "#ffffff",
                        "tertiary-fixed-dim": "#94ccff",
                        "surface-tint": "#ae2f34",
                        "secondary-fixed": "#dce4e6",
                        "on-secondary-fixed": "#151d1f",
                        "on-tertiary": "#ffffff",
                        "tertiary-fixed": "#cde5ff",
                        "inverse-primary": "#ffb3b0",
                        "on-secondary": "#ffffff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "gutter": "1rem",
                        "stack-gap": "0.5rem",
                        "pane-sidebar-width": "320px",
                        "margin-desktop": "2rem",
                        "nav-width-expanded": "240px",
                        "calendar-cell-min-height": "120px"
                    },
                    "fontFamily": {
                        "headline-lg": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-sm": ["Inter"],
                        "label-lg": ["Inter"]
                    },
                    "fontSize": {
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-surface-background text-on-surface antialiased pb-24 md:pb-0">
<!-- TopAppBar Mobile -->
<header class="md:hidden flex justify-between items-center px-gutter w-full h-16 bg-surface border-b border-outline-variant fixed top-0 z-50">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full overflow-hidden bg-surface-container border border-outline-variant">
<img alt="User Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDulECo9G4qM7cpwH0qeOMCeySJX6JgRhCr7SKrKdqbI-BycQoBIXwJvQMfrbfjzOuM2HbjWh2TXS5gT_mktEN_IHRJ_3z64qb7H4jFiw7_JiMtZrYFzIL_m7o4QQ_NVgZQRF8v5u9H0taB9wUM1Y2bnJk1LmynuWkIG0pD7AMV0ahAU3oS69YIHg-QESLMN21dKnGo2ex54pkAIOfNLtVG_xN5sqlU056JJMZSR1eB61M90u3JW4VcWq7mponELOaxmv-YhkFh2C4"/>
</div>
<h1 class="font-headline-sm text-headline-sm text-primary font-bold">Sushi Poke &amp; Roll</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-primary">
<span class="material-symbols-outlined">notifications</span>
</button>
</header>
<!-- TopAppBar Desktop -->
<header class="hidden md:flex justify-between items-center px-gutter w-full h-16 bg-surface border-b border-outline-variant sticky top-0 z-50">
<div class="flex items-center gap-4">
<div class="w-10 h-10 rounded-full overflow-hidden bg-surface-container border border-outline-variant">
<img alt="Brand Logo" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDulECo9G4qM7cpwH0qeOMCeySJX6JgRhCr7SKrKdqbI-BycQoBIXwJvQMfrbfjzOuM2HbjWh2TXS5gT_mktEN_IHRJ_3z64qb7H4jFiw7_JiMtZrYFzIL_m7o4QQ_NVgZQRF8v5u9H0taB9wUM1Y2bnJk1LmynuWkIG0pD7AMV0ahAU3oS69YIHg-QESLMN21dKnGo2ex54pkAIOfNLtVG_xN5sqlU056JJMZSR1eB61M90u3JW4VcWq7mponELOaxmv-YhkFh2C4"/>
</div>
<h1 class="font-headline-md text-headline-md text-primary font-extrabold tracking-tight">Sushi Poke &amp; Roll</h1>
</div>
<nav class="flex gap-6">
<a class="font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors px-4 py-2 rounded-lg" href="#">Dashboard</a>
<a class="font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors px-4 py-2 rounded-lg" href="#">Inbox</a>
<a class="font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container transition-colors px-4 py-2 rounded-lg" href="#">Menú</a>
<a class="font-label-lg text-label-lg text-primary font-bold border-l-4 border-primary bg-surface-container px-4 py-2 rounded-lg transform scale-95 duration-100" href="#">Planificador</a>
</nav>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-primary">
<span class="material-symbols-outlined">notifications</span>
</button>
</header>
<!-- Main Content -->
<main class="pt-20 px-gutter md:px-margin-desktop max-w-7xl mx-auto space-y-8">
<!-- Header Section -->
<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h2 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Planificador de Contenido</h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Organiza y crea tus próximas publicaciones.</p>
</div>
<button class="w-full md:w-auto bg-primary text-on-primary font-label-lg text-label-lg px-6 py-3 rounded-full flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-opacity">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">add</span>
                Nueva Publicación
            </button>
</div>
<!-- AI Creation Banner -->
<section class="bg-gradient-to-r from-primary-container to-surface-tint rounded-xl p-6 text-on-primary-container shadow-sm border border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
<!-- Decorative background pattern -->
<div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 24px 24px;"></div>
<div class="z-10 flex-1">
<div class="flex items-center gap-2 mb-2">
<span class="material-symbols-outlined text-tertiary-fixed" style="font-variation-settings: 'FILL' 1;">magic_button</span>
<span class="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed">Herramienta IA</span>
</div>
<h3 class="font-headline-sm text-headline-sm text-white mb-2">Generador de Ideas Gastronómicas</h3>
<p class="font-body-sm text-body-sm text-primary-fixed-dim opacity-90 max-w-md">Deja que nuestra IA redacte copys apetitosos y sugiera los mejores horarios de publicación basados en tu audiencia.</p>
</div>
<button class="z-10 bg-white text-primary font-label-lg text-label-lg px-6 py-3 rounded-full whitespace-nowrap shadow-sm hover:bg-surface-container-lowest transition-colors flex items-center gap-2">
<span class="material-symbols-outlined">auto_awesome</span>
                 Crear con IA
             </button>
</section>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
<!-- Left Column: Calendar & Upcoming -->
<div class="lg:col-span-2 space-y-8">
<!-- Monthly Calendar -->
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
<div class="p-4 flex justify-between items-center border-b border-outline-variant">
<h3 class="font-headline-sm text-headline-sm">Octubre 2023</h3>
<div class="flex gap-2">
<button class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">chevron_left</span>
</button>
<button class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">chevron_right</span>
</button>
</div>
</div>
<div class="grid grid-cols-7 border-b border-outline-variant bg-surface-background">
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Lun</div>
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Mar</div>
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Mié</div>
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Jue</div>
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Vie</div>
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Sáb</div>
<div class="py-2 text-center font-label-sm text-label-sm text-on-surface-variant">Dom</div>
</div>
<div class="grid grid-cols-7 grid-rows-5 bg-outline-variant gap-[1px]">
<!-- Sample Calendar Cells -->
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant opacity-50">25</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant opacity-50">26</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant opacity-50">27</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant opacity-50">28</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant opacity-50">29</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface-variant opacity-50">30</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">1</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between border-l-4 border-primary">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">2</span>
<div class="flex gap-1 mt-auto">
<div class="w-2 h-2 rounded-full bg-blue-500" title="Facebook"></div>
<div class="w-2 h-2 rounded-full bg-pink-500" title="Instagram"></div>
</div>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">3</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">4</span>
<div class="flex gap-1 mt-auto">
<div class="w-2 h-2 rounded-full bg-green-500" title="WhatsApp"></div>
</div>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between bg-surface-container-low">
<span class="font-body-sm text-body-sm text-primary font-bold">5</span>
<div class="flex gap-1 mt-auto">
<div class="w-2 h-2 rounded-full bg-pink-500" title="Instagram"></div>
</div>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">6</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">7</span>
</div>
<div class="bg-surface-container-lowest h-20 md:h-24 p-1 md:p-2 flex flex-col justify-between">
<span class="font-body-sm text-body-sm text-on-surface font-semibold">8</span>
</div>
<!-- ... more rows would go here ... -->
</div>
</div>
</div>
<!-- Right Column: Inspector / Details -->
<div class="space-y-6">
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-6 sticky top-24">
<div class="flex items-center justify-between mb-4">
<h3 class="font-headline-sm text-headline-sm">Detalle de Publicación</h3>
<span class="bg-surface-container text-primary font-label-sm text-label-sm px-2 py-1 rounded-md">Borrador</span>
</div>
<div class="w-full aspect-video bg-surface-variant rounded-lg mb-4 overflow-hidden relative">
<div class="absolute inset-0 bg-gradient-to-tr from-primary-container to-tertiary-container opacity-20"></div>
<div class="w-full h-full flex items-center justify-center text-on-surface-variant opacity-50">
<span class="material-symbols-outlined text-4xl">image</span>
</div>
</div>
<div class="space-y-4">
<div>
<div class="flex items-center gap-2 mb-1">
<span class="material-symbols-outlined text-tertiary text-sm" style="font-variation-settings: 'FILL' 1;">magic_button</span>
<span class="font-label-sm text-label-sm text-tertiary">Copy generado por IA</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant bg-surface-background p-3 rounded-lg border border-outline-variant">
                                🍣 ¿Antojo de algo fresco? Nuestro nuevo Roll Volcán acaba de aterrizar. Disfruta de la explosión de sabores con atún spicy y un toque de nuestra salsa secreta. ¡Pídelo hoy y obtén envío gratis! 🔥 #SushiLovers #PokeRoll
                            </p>
</div>
<div class="flex gap-4 border-t border-outline-variant pt-4 mt-4">
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Alcance Est.</span>
<span class="font-headline-sm text-headline-sm text-primary">2.4k</span>
</div>
<div class="flex flex-col">
<span class="font-label-sm text-label-sm text-on-surface-variant">Plataformas</span>
<div class="flex gap-1 mt-1">
<div class="w-3 h-3 rounded-full bg-pink-500"></div>
<div class="w-3 h-3 rounded-full bg-blue-500"></div>
</div>
</div>
</div>
<button class="w-full bg-surface-container border border-primary text-primary font-label-lg text-label-lg px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-colors mt-2">
                            Editar y Programar
                        </button>
</div>
</div>
</div>
</div>
</main>
<!-- BottomNavBar Mobile -->
<nav class="md:hidden fixed bottom-0 w-full flex justify-around items-center py-2 px-gutter bg-surface border-t border-outline-variant z-50">
<button class="flex flex-col items-center justify-center text-on-secondary-container p-2">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-sm text-label-sm mt-1">Dashboard</span>
</button>
<button class="flex flex-col items-center justify-center text-on-secondary-container p-2">
<span class="material-symbols-outlined">inbox</span>
<span class="font-label-sm text-label-sm mt-1">Inbox</span>
</button>
<button class="flex flex-col items-center justify-center text-on-secondary-container p-2">
<span class="material-symbols-outlined">restaurant_menu</span>
<span class="font-label-sm text-label-sm mt-1">Menú</span>
</button>
<button class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transform scale-90 duration-200">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">calendar_month</span>
<span class="font-label-sm text-label-sm mt-1">Planificador</span>
</button>
</nav>
</body></html>

<!-- Catálogo de Productos - Escritorio -->
<!DOCTYPE html>

<html class="light" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Content Planner</title>
<!-- Google Fonts & Material Symbols -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Theme Configuration -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-background": "#f8f9fa",
                        "primary-fixed": "#ffdad8",
                        "on-tertiary-container": "#b9dcff",
                        "on-secondary-fixed-variant": "#40484a",
                        "secondary-container": "#dce4e6",
                        "background": "#fff8f7",
                        "outline-variant": "#e0bfbd",
                        "on-background": "#251818",
                        "on-surface": "#251818",
                        "secondary-fixed-dim": "#c0c8ca",
                        "surface-container-low": "#fff0ef",
                        "on-primary-container": "#ffcdca",
                        "primary": "#8d151f",
                        "sidebar-charcoal": "#2e3132",
                        "on-surface-variant": "#584140",
                        "secondary": "#586062",
                        "coral-accent": "#ff6b6b",
                        "surface-bright": "#fff8f7",
                        "surface-container-high": "#fbe3e1",
                        "primary-container": "#ae2f34",
                        "tertiary-container": "#006398",
                        "error": "#ba1a1a",
                        "on-secondary-container": "#5e6668",
                        "surface-dim": "#edd5d3",
                        "primary-fixed-dim": "#ffb3b0",
                        "surface-container": "#ffe9e7",
                        "tertiary": "#004a74",
                        "on-primary-fixed": "#410006",
                        "border-subtle": "#e0bfbd",
                        "error-container": "#ffdad6",
                        "surface-variant": "#f5dddb",
                        "surface": "#fff8f7",
                        "surface-container-lowest": "#ffffff",
                        "on-tertiary-fixed-variant": "#004b74",
                        "on-primary-fixed-variant": "#8c151f",
                        "on-error": "#ffffff",
                        "inverse-on-surface": "#ffedeb",
                        "outline": "#8c706f",
                        "surface-container-highest": "#f5dddb",
                        "on-error-container": "#93000a",
                        "on-tertiary-fixed": "#001d32",
                        "inverse-surface": "#3b2d2c",
                        "on-primary": "#ffffff",
                        "tertiary-fixed-dim": "#94ccff",
                        "surface-tint": "#ae2f34",
                        "secondary-fixed": "#dce4e6",
                        "on-secondary-fixed": "#151d1f",
                        "on-tertiary": "#ffffff",
                        "tertiary-fixed": "#cde5ff",
                        "inverse-primary": "#ffb3b0",
                        "on-secondary": "#ffffff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "gutter": "1rem",
                        "stack-gap": "0.5rem",
                        "pane-sidebar-width": "320px",
                        "margin-desktop": "2rem",
                        "nav-width-expanded": "240px",
                        "calendar-cell-min-height": "120px"
                    },
                    "fontFamily": {
                        "headline-lg": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "label-sm": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "body-sm": ["Inter"],
                        "label-lg": ["Inter"]
                    },
                    "fontSize": {
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-filled {
            font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-surface-background text-on-surface font-body-md min-h-screen flex">
<!-- SideNavBar -->
<nav class="hidden md:flex flex-col fixed left-0 top-0 h-full w-nav-width-expanded border-r border-outline-variant bg-surface z-50">
<div class="p-6 flex items-center gap-3">
<img alt="Sushi Poke &amp; Roll Logo" class="w-10 h-10 object-contain rounded-full shadow-sm bg-white" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDulECo9G4qM7cpwH0qeOMCeySJX6JgRhCr7SKrKdqbI-BycQoBIXwJvQMfrbfjzOuM2HbjWh2TXS5gT_mktEN_IHRJ_3z64qb7H4jFiw7_JiMtZrYFzIL_m7o4QQ_NVgZQRF8v5u9H0taB9wUM1Y2bnJk1LmynuWkIG0pD7AMV0ahAU3oS69YIHg-QESLMN21dKnGo2ex54pkAIOfNLtVG_xN5sqlU056JJMZSR1eB61M90u3JW4VcWq7mponELOaxmv-YhkFh2C4"/>
<div>
<h1 class="font-headline-sm text-headline-sm font-bold text-primary">Sushi Poke &amp; Roll</h1>
<p class="font-label-sm text-label-sm text-on-surface-variant">Admin Dashboard</p>
</div>
</div>
<div class="flex-1 px-4 py-2 space-y-1">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span class="font-label-lg text-label-lg">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="chat">chat</span>
<span class="font-label-lg text-label-lg">Inbox</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="restaurant_menu">restaurant_menu</span>
<span class="font-label-lg text-label-lg">Menu</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-primary font-bold border-l-4 border-primary bg-primary-fixed scale-[0.99] transition-transform duration-150" href="#">
<span class="material-symbols-outlined icon-filled" data-icon="calendar_month">calendar_month</span>
<span class="font-label-lg text-label-lg">Content Planner</span>
</a>
</div>
<div class="p-4 border-t border-outline-variant space-y-1">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="settings">settings</span>
<span class="font-label-lg text-label-lg">Settings</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined" data-icon="logout">logout</span>
<span class="font-label-lg text-label-lg">Logout</span>
</a>
</div>
</nav>
<!-- TopNavBar -->
<header class="fixed top-0 right-0 w-[calc(100%-240px)] z-40 bg-surface-container-lowest border-b border-outline-variant h-16 px-margin-desktop flex justify-between items-center transition-all duration-200">
<div class="flex items-center bg-surface-container rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-primary focus-within:bg-surface-container-lowest transition-colors">
<span class="material-symbols-outlined text-on-surface-variant mr-2" data-icon="search">search</span>
<input class="bg-transparent border-none focus:ring-0 w-full font-body-sm text-body-sm text-on-surface placeholder:text-on-surface-variant outline-none" placeholder="Search content, campaigns..." type="text"/>
</div>
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="help">help</span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="account_circle">account_circle</span>
</button>
</div>
</header>
<!-- Main Workspace Area -->
<main class="ml-[240px] mt-16 flex-1 flex h-[calc(100vh-64px)] overflow-hidden">
<!-- Left Column: Calendar (Wider) -->
<section class="flex-[3] border-r border-outline-variant bg-surface p-6 flex flex-col overflow-y-auto">
<div class="flex justify-between items-center mb-6">
<h2 class="font-headline-md text-headline-md text-on-surface">October 2023</h2>
<div class="flex gap-2">
<button class="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
</button>
<button class="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
<div class="grid grid-cols-7 gap-4 mb-4">
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Sun</div>
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Mon</div>
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Tue</div>
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Wed</div>
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Thu</div>
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Fri</div>
<div class="text-center font-label-sm text-label-sm text-on-surface-variant uppercase">Sat</div>
</div>
<div class="grid grid-cols-7 gap-4 flex-1">
<!-- Sample Calendar Cells (simplified for brevity) -->
<!-- Empty -->
<div class="min-h-calendar-cell-min-height p-2 border border-outline-variant rounded-lg bg-surface-container-lowest opacity-50"></div>
<!-- Day 1 -->
<div class="min-h-calendar-cell-min-height p-2 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary transition-colors cursor-pointer flex flex-col">
<span class="font-label-lg text-label-lg mb-2">1</span>
<div class="bg-surface-container p-1 rounded mb-1 flex items-center gap-1 text-[10px] text-on-surface">
<div class="w-2 h-2 rounded-full bg-blue-500"></div> IG Reel
                    </div>
</div>
<!-- Day 2 (Active) -->
<div class="min-h-calendar-cell-min-height p-2 border-l-4 border-primary rounded-lg bg-surface-container-lowest shadow-sm scale-[0.99] flex flex-col relative">
<span class="font-label-lg text-label-lg font-bold text-primary mb-2">2</span>
<div class="bg-primary-container text-on-primary-container p-1 rounded mb-1 flex items-center gap-1 text-[10px]">
<div class="w-2 h-2 rounded-full bg-blue-500"></div> IG Post
                    </div>
<div class="bg-surface-container p-1 rounded mb-1 flex items-center gap-1 text-[10px] text-on-surface">
<div class="w-2 h-2 rounded-full bg-blue-800"></div> FB Post
                    </div>
</div>
<!-- Fill remaining grid roughly -->
<div class="min-h-calendar-cell-min-height p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
<span class="font-label-lg text-label-lg">3</span>
</div>
<div class="min-h-calendar-cell-min-height p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
<span class="font-label-lg text-label-lg">4</span>
</div>
<div class="min-h-calendar-cell-min-height p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
<span class="font-label-lg text-label-lg">5</span>
</div>
<div class="min-h-calendar-cell-min-height p-2 border border-outline-variant rounded-lg bg-surface-container-lowest">
<span class="font-label-lg text-label-lg">6</span>
</div>
</div>
</section>
<!-- Center Column: Scheduled List -->
<section class="flex-[2] bg-surface-background p-6 overflow-y-auto">
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-6">Upcoming for Oct 2nd</h3>
<div class="space-y-4">
<!-- List Item 1 -->
<div class="flex gap-4 p-4 rounded-xl bg-surface-container-lowest border border-primary shadow-sm relative overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
<div class="w-24 h-24 rounded-lg bg-surface-container flex-shrink-0 bg-cover bg-center" data-alt="A stylized, high-quality photograph of a sushi roll composition, vibrant colors, premium dining aesthetic, modern corporate styling." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuArqCW3Xpyjqa-T59D_WqxhObxm3RaMVgZmo7v3PkhrdQk-wutuBYX4zOrib8WgslCiai8sH7e8wtUA-fFsBWv4ZDv3SZTW1jsju-_bIOkKkqCo3D2eALYR2oH6MjlpsfLfpUOfzRstXfO8CZtOfaHskgUntOK_Pvp9rLDdkE5tEXjjinYN7cWJdDh-hFQnM9T3wH0YQcrLpWsyT5avIH7-btPk5XZ2h5VR7t_WJwCaeO3b8OTvgZTH3j6W4hDDnD-NZTaebkMl1Dw');"></div>
<div class="flex-1 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start">
<span class="font-label-sm text-label-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center gap-1 w-max">
<span class="material-symbols-outlined text-[14px]" data-icon="photo_camera">photo_camera</span> Instagram
                                </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">12:00 PM</span>
</div>
<h4 class="font-label-lg text-label-lg mt-2 line-clamp-1">New Spicy Tuna Roll Launch</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-1">Get ready for the heat! Our new...</p>
</div>
<div class="flex gap-2 mt-2">
<span class="font-label-sm text-label-sm text-primary flex items-center gap-1 bg-primary-fixed px-2 py-1 rounded">
<span class="material-symbols-outlined text-[14px]" data-icon="auto_awesome">auto_awesome</span> AI Edited
                             </span>
</div>
</div>
</div>
<!-- List Item 2 -->
<div class="flex gap-4 p-4 rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-outline transition-colors cursor-pointer">
<div class="w-24 h-24 rounded-lg bg-surface-container flex-shrink-0 bg-cover bg-center" data-alt="A beautiful modern interior of a sushi restaurant, clean lines, warm lighting, inviting atmosphere." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCA7YAYas7CXKnBzg2Q7HCQ9SXzkxqQGQbyQe2ZSlLoidUeqcV1WtwD8CiDKb04GNUUO8ZtzuU4a8jKbU1JlRQg0rp9jpDnrNYdcDo7h2kFSdpNOJokTO0zBHqilrFIpUmwtfLXLnaXnlsSGVwplk2hZDPJ9GjZ3S1DZyA-rIgDK_lApPbgOIYiV105BLMWJ9ejzz4EIVhADqDo159limWvpqPEza8SnG20sRKtBtL_cp0ytl0y57o49xXiLzGwsUdU0xOD0vXJ7CI');"></div>
<div class="flex-1 flex flex-col justify-between">
<div>
<div class="flex justify-between items-start">
<span class="font-label-sm text-label-sm bg-blue-800 text-white px-2 py-1 rounded-full flex items-center gap-1 w-max">
<span class="material-symbols-outlined text-[14px]" data-icon="groups">groups</span> Facebook
                                </span>
<span class="font-label-sm text-label-sm text-on-surface-variant">5:30 PM</span>
</div>
<h4 class="font-label-lg text-label-lg mt-2 line-clamp-1">Weekend Reservation Promo</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 mt-1">Book your table for this weekend...</p>
</div>
</div>
</div>
</div>
<button class="mt-6 w-full py-3 rounded-lg bg-primary-container text-on-primary-container font-label-lg text-label-lg flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-colors">
<span class="material-symbols-outlined" data-icon="add">add</span> Create New Post
            </button>
</section>
<!-- Right Column: Inspector Pane -->
<aside class="w-pane-sidebar-width bg-surface-container-lowest border-l border-outline-variant flex flex-col overflow-y-auto">
<div class="p-6 border-b border-outline-variant sticky top-0 bg-surface-container-lowest z-10 flex justify-between items-center">
<h3 class="font-headline-sm text-headline-sm">Post Details</h3>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined" data-icon="more_vert">more_vert</span>
</button>
</div>
<div class="p-6 flex-1 space-y-6">
<!-- Preview -->
<div>
<h4 class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">Instagram Preview</h4>
<div class="border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="p-3 flex items-center gap-2 bg-surface">
<img alt="Profile" class="w-8 h-8 rounded-full border border-outline-variant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDulECo9G4qM7cpwH0qeOMCeySJX6JgRhCr7SKrKdqbI-BycQoBIXwJvQMfrbfjzOuM2HbjWh2TXS5gT_mktEN_IHRJ_3z64qb7H4jFiw7_JiMtZrYFzIL_m7o4QQ_NVgZQRF8v5u9H0taB9wUM1Y2bnJk1LmynuWkIG0pD7AMV0ahAU3oS69YIHg-QESLMN21dKnGo2ex54pkAIOfNLtVG_xN5sqlU056JJMZSR1eB61M90u3JW4VcWq7mponELOaxmv-YhkFh2C4"/>
<span class="font-label-lg text-label-lg text-sm">sushipokeandroll</span>
</div>
<div class="aspect-square bg-surface-container bg-cover bg-center" data-alt="A stylized, high-quality photograph of a spicy tuna sushi roll composition, vibrant colors, premium dining aesthetic, modern corporate styling." style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuAnjBTmOQJA1zR8E-uIBaoGJi8fT8nzAmuBjgwVBtCJm6wh9QDAYd-ys51MScv4_e3tWLYvouUR7WpqVgUppvIoxFgFW5gAHG-W3SCpJXaj84XdUOlc2LBzxfJPqH_3qGcrZSfNKv8aFgmcOcGkmqBlFZu5baBM8JFSu3aGyzZ1MbrD5gZyy9xwTV_KJLj731c_2kpQ0nqwdsiszyBlrLtuWASxS5VCoxtG8hgqe5L9-vrQCVnakiC_FeorC9wGo27irIKyD_IXvtg');"></div>
<div class="p-3 bg-surface">
<div class="flex gap-3 mb-2">
<span class="material-symbols-outlined text-on-surface" data-icon="favorite">favorite</span>
<span class="material-symbols-outlined text-on-surface" data-icon="chat_bubble">chat_bubble</span>
<span class="material-symbols-outlined text-on-surface" data-icon="send">send</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface"><span class="font-bold mr-1">sushipokeandroll</span>Get ready for the heat! Our new Spicy Tuna Roll is here to spice up your lunch. 🔥🍣 #SushiLovers #SpicyTuna #NewMenu</p>
</div>
</div>
</div>
<!-- AI Copy Editor -->
<div class="border border-outline-variant rounded-xl p-4 bg-surface-container-low">
<div class="flex items-center gap-2 mb-3 text-tertiary-container">
<span class="material-symbols-outlined" data-icon="auto_awesome">auto_awesome</span>
<h4 class="font-label-lg text-label-lg">AI Copy Assistant</h4>
</div>
<textarea class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-sm text-body-sm text-on-surface resize-none mb-3" rows="3">Get ready for the heat! Our new Spicy Tuna Roll is here to spice up your lunch. 🔥🍣 #SushiLovers #SpicyTuna #NewMenu</textarea>
<div class="flex gap-2">
<button class="px-3 py-1.5 rounded-lg border border-outline-variant text-label-sm font-label-sm hover:bg-surface-container transition-colors">Make it shorter</button>
<button class="px-3 py-1.5 rounded-lg border border-outline-variant text-label-sm font-label-sm hover:bg-surface-container transition-colors">More engaging</button>
</div>
</div>
<!-- Metrics (Placeholder since it's scheduled) -->
<div>
<h4 class="font-label-sm text-label-sm text-on-surface-variant uppercase mb-3">Expected Engagement</h4>
<div class="grid grid-cols-2 gap-3">
<div class="p-3 rounded-lg bg-surface border border-outline-variant">
<span class="font-label-sm text-label-sm text-on-surface-variant">Est. Reach</span>
<div class="font-headline-sm text-headline-sm mt-1">4.2k</div>
</div>
<div class="p-3 rounded-lg bg-surface border border-outline-variant">
<span class="font-label-sm text-label-sm text-on-surface-variant">Best Time</span>
<div class="font-headline-sm text-headline-sm mt-1 text-green-600 flex items-center"><span class="material-symbols-outlined text-[16px] mr-1" data-icon="check_circle">check_circle</span> Yes</div>
</div>
</div>
</div>
</div>
<div class="p-4 border-t border-outline-variant bg-surface sticky bottom-0">
<button class="w-full py-3 rounded-lg bg-primary text-on-primary font-label-lg text-label-lg hover:bg-on-primary-fixed transition-colors">
                    Save Changes
                </button>
</div>
</aside>
</main>
</body></html>

<!-- logoPoke.png -->
<!DOCTYPE html>

<html class="light" lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Dashboard de Monitoreo - Sushi Poke &amp; Roll</title>
<!-- Fonts & Icons -->
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Config -->
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#e0bfbd",
                        "tertiary-fixed-dim": "#94ccff",
                        "surface-container-lowest": "#ffffff",
                        "tertiary-fixed": "#cde5ff",
                        "background": "#fff8f7",
                        "surface-container-high": "#fbe3e1",
                        "surface": "#fff8f7",
                        "surface-dim": "#edd5d3",
                        "secondary-container": "#dce4e6",
                        "coral-accent": "#ff6b6b",
                        "on-error-container": "#93000a",
                        "on-tertiary": "#ffffff",
                        "tertiary": "#004a74",
                        "surface-background": "#f8f9fa",
                        "on-tertiary-container": "#b9dcff",
                        "on-error": "#ffffff",
                        "on-primary-fixed-variant": "#8c151f",
                        "on-surface": "#251818",
                        "inverse-surface": "#3b2d2c",
                        "secondary": "#586062",
                        "primary-fixed-dim": "#ffb3b0",
                        "on-tertiary-fixed": "#001d32",
                        "surface-variant": "#f5dddb",
                        "inverse-primary": "#ffb3b0",
                        "surface-tint": "#ae2f34",
                        "on-primary-container": "#ffcdca",
                        "error-container": "#ffdad6",
                        "on-primary-fixed": "#410006",
                        "secondary-fixed-dim": "#c0c8ca",
                        "on-primary": "#ffffff",
                        "error": "#ba1a1a",
                        "primary-fixed": "#ffdad8",
                        "on-secondary-container": "#5e6668",
                        "tertiary-container": "#006398",
                        "primary": "#8d151f",
                        "surface-bright": "#fff8f7",
                        "outline": "#8c706f",
                        "border-subtle": "#e0bfbd",
                        "surface-container-highest": "#f5dddb",
                        "on-surface-variant": "#584140",
                        "surface-container-low": "#fff0ef",
                        "on-secondary-fixed": "#151d1f",
                        "surface-container": "#ffe9e7",
                        "primary-container": "#ae2f34",
                        "on-secondary-fixed-variant": "#40484a",
                        "secondary-fixed": "#dce4e6",
                        "on-background": "#251818",
                        "on-secondary": "#ffffff",
                        "inverse-on-surface": "#ffedeb",
                        "on-tertiary-fixed-variant": "#004b74",
                        "sidebar-charcoal": "#2e3132"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "pane-sidebar-width": "320px",
                        "stack-gap": "0.5rem",
                        "nav-width-expanded": "240px",
                        "margin-desktop": "2rem",
                        "gutter": "1rem",
                        "calendar-cell-min-height": "120px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "label-lg": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-sm": ["Inter"],
                        "headline-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-sm": ["Inter"]
                    },
                    "fontSize": {
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }]
                    }
                }
            }
        }
    </script>
<style>
        body { background-color: theme('colors.surface'); color: theme('colors.on-surface'); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
        .icon-fill { font-variation-settings: 'FILL' 1; }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="antialiased min-h-screen flex flex-col md:flex-row">
<!-- Mobile Top App Bar (Only visible on md:hidden) -->
<header class="md:hidden flex justify-between items-center px-gutter w-full h-16 bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline flat no shadows sticky top-0 z-40">
<div class="flex items-center gap-4">
<div class="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-outline-variant">
<img alt="User Profile" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCNrCWAuJAuLIFdyCQdzu0qsSD19VygDDaT_P7tgmKVgxV0F05UXy1YC9nPg5_6O8OG8veERV0AmVcaWcXSvUo6a5ekWmEwK7ce0oU4spvHEGD1ciKlvaN_npRUp1j-KAIhLsUhUXegE3-p-cQn7rCt7zyHxq63MUIkwQLE5c4SNP_EupGOa5B_CKKy59CuDif4qXWmepxvn6R0sBDWZ7JoHcRgrn9w4xZG1t8lISz7dn5Fday-hgIFS_995FobUEsHXZhTIyrFITQ"/>
</div>
<h1 class="font-headline-sm text-headline-sm text-primary font-bold dark:text-primary-fixed">Sushi Poke &amp; Roll</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors text-primary dark:text-primary-fixed-dim">
<span class="material-symbols-outlined">notifications</span>
</button>
</header>
<!-- Desktop Sidebar (Hidden on mobile) -->
<aside class="hidden md:flex flex-col w-nav-width-expanded h-screen sticky top-0 border-r border-outline-variant bg-surface-container-lowest z-30 shrink-0">
<div class="h-16 flex items-center px-6 border-b border-outline-variant">
<h1 class="font-headline-md text-headline-md text-primary font-extrabold tracking-tight">Sushi Poke &amp; Roll</h1>
</div>
<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
<!-- Active Navigation Item -->
<a class="flex items-center gap-3 px-4 py-3 bg-primary-container text-on-primary-container rounded-lg border-l-4 border-primary transition-all duration-200 transform hover:scale-[0.99] font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined icon-fill">dashboard</span>
                Dashboard
            </a>
<!-- Inactive Navigation Items -->
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">inbox</span>
                Inbox
            </a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
                Menú
            </a>
<a class="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors font-label-lg text-label-lg" href="#">
<span class="material-symbols-outlined">calendar_month</span>
                Planificador
            </a>
</nav>
<div class="p-4 border-t border-outline-variant">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shrink-0">
<img alt="User" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdupxnv9XguXwmGD07EkpMQuwKTY8DHek7TxEqhHgi2pUsl0mX4IyKbnYoXb9_9_e5SRvn5gyzUEG0-djfHF8g5DjjfGMLBL80FE6vssj0xGseuiWailkzKktMfF5DFYmHx-szeDjG-aHIkJp-hA0VjIf0u_XlctFc-iIZ4K1kit1DifUIaiiYvTcTYDDRUEqkAU0DIsCM3OGwzizlUQS2MhXjLbkStdb2EcViQy1NRSlgbhoSGrZLUgkNY4MQ_cpHKYW2reSikoY"/>
</div>
<div>
<p class="font-label-sm text-label-sm text-on-surface font-semibold">Admin Usuario</p>
<p class="font-body-sm text-body-sm text-on-surface-variant text-[10px]">admin@sushipoke.com</p>
</div>
</div>
</div>
</aside>
<!-- Main Workspace -->
<main class="flex-1 flex flex-col min-w-0 pb-20 md:pb-0">
<!-- Desktop Header Area (Optional, for context) -->
<header class="hidden md:flex h-16 items-center justify-between px-8 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-20">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Visión General del Sistema</h2>
<div class="flex items-center gap-4">
<div class="flex items-center bg-surface-container rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-primary transition-all">
<span class="material-symbols-outlined text-on-surface-variant text-sm mr-2">search</span>
<input class="bg-transparent border-none focus:ring-0 text-sm font-body-sm w-48 text-on-surface placeholder-on-surface-variant" placeholder="Buscar métricas..." type="text"/>
</div>
<button class="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-2 right-2 w-2 h-2 bg-coral-accent rounded-full border border-surface-container-lowest"></span>
</button>
</div>
</header>
<div class="flex-1 p-4 md:p-8 space-y-6 lg:space-y-8 overflow-x-hidden">
<!-- Welcome Section -->
<div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h1 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Dashboard de Monitoreo</h1>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Resumen operativo y estado de agentes de IA al día de hoy.</p>
</div>
<button class="flex items-center gap-2 bg-primary-container text-on-primary-container px-4 py-2 rounded-lg font-label-lg text-label-lg hover:bg-primary hover:text-on-primary transition-colors self-start md:self-auto shadow-sm">
<span class="material-symbols-outlined text-sm">download</span>
                    Exportar Reporte
                </button>
</div>
<!-- Bento Grid Layout -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
<!-- Sales Metrics Chart Card -->
<div class="col-span-1 md:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col shadow-sm">
<div class="flex justify-between items-center mb-6">
<h3 class="font-headline-sm text-headline-sm text-on-surface">Ventas Diarias</h3>
<select class="bg-surface-container border-none text-on-surface rounded-lg font-body-sm text-body-sm py-1.5 pl-3 pr-8 focus:ring-primary cursor-pointer">
<option>Esta Semana</option>
<option>Este Mes</option>
</select>
</div>
<div class="flex gap-8 mb-6">
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Ingresos Totales</p>
<div class="flex items-baseline gap-2">
<span class="font-headline-lg text-headline-lg text-on-surface">$12,450</span>
<span class="flex items-center text-coral-accent font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[16px]">trending_up</span> 14%
                                </span>
</div>
</div>
<div>
<p class="font-label-sm text-label-sm text-on-surface-variant mb-1">Órdenes Completadas</p>
<div class="flex items-baseline gap-2">
<span class="font-headline-lg text-headline-lg text-on-surface">342</span>
</div>
</div>
</div>
<!-- Faux Chart Area (Using Tailwind gradients/shapes to simulate a modern chart) -->
<div class="flex-1 min-h-[200px] relative mt-4 flex items-end gap-2 justify-between w-full border-b border-dashed border-outline-variant pb-2">
<!-- Chart Bars -->
<div class="w-full bg-surface-container-high rounded-t-sm h-[40%] hover:bg-primary-container transition-colors relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$1,200</div>
</div>
<div class="w-full bg-surface-container-high rounded-t-sm h-[60%] hover:bg-primary-container transition-colors relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$1,800</div>
</div>
<div class="w-full bg-surface-container-high rounded-t-sm h-[30%] hover:bg-primary-container transition-colors relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$900</div>
</div>
<div class="w-full bg-surface-container-high rounded-t-sm h-[80%] hover:bg-primary-container transition-colors relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$2,400</div>
</div>
<div class="w-full bg-surface-container-high rounded-t-sm h-[50%] hover:bg-primary-container transition-colors relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$1,500</div>
</div>
<div class="w-full bg-primary-container rounded-t-sm h-[90%] relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$2,700</div>
</div>
<div class="w-full bg-surface-container-high rounded-t-sm h-[70%] hover:bg-primary-container transition-colors relative group">
<div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">$2,100</div>
</div>
</div>
<div class="flex justify-between w-full mt-2 font-label-sm text-label-sm text-on-surface-variant">
<span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span>Dom</span>
</div>
</div>
<!-- AI Agents Status Panel -->
<div class="col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col">
<h3 class="font-headline-sm text-headline-sm text-on-surface mb-6">Estado de Agentes IA</h3>
<div class="space-y-4 flex-1">
<!-- Agent 1: Ventas -->
<div class="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface hover:border-primary transition-colors cursor-default">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
<span class="material-symbols-outlined">smart_toy</span>
</div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Bot de Ventas</p>
<p class="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Procesando 12 chats</p>
</div>
</div>
<div class="flex flex-col items-end">
<span class="flex items-center gap-1 text-[10px] font-bold text-[#10b981]">
<span class="w-2 h-2 rounded-full bg-[#10b981]"></span> En línea
                                </span>
<span class="font-label-sm text-label-sm text-on-surface mt-1">98% Eficacia</span>
</div>
</div>
<!-- Agent 2: Atención -->
<div class="flex items-center justify-between p-3 rounded-lg border border-border-subtle bg-surface hover:border-primary transition-colors cursor-default">
<div class="flex items-center gap-3">
<div class="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined">support_agent</span>
</div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Atención al Cliente</p>
<p class="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Respondiendo FAQs</p>
</div>
</div>
<div class="flex flex-col items-end">
<span class="flex items-center gap-1 text-[10px] font-bold text-[#10b981]">
<span class="w-2 h-2 rounded-full bg-[#10b981]"></span> En línea
                                </span>
<span class="font-label-sm text-label-sm text-on-surface mt-1">95% Eficacia</span>
</div>
</div>
<!-- Agent 3: Reclamos (Alert) -->
<div class="flex items-center justify-between p-3 rounded-lg border border-error-container bg-error-container/20 hover:border-error transition-colors cursor-default relative overflow-hidden">
<div class="absolute left-0 top-0 bottom-0 w-1 bg-error"></div>
<div class="flex items-center gap-3 pl-2">
<div class="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center">
<span class="material-symbols-outlined">warning</span>
</div>
<div>
<p class="font-label-lg text-label-lg text-on-surface">Manejo de Reclamos</p>
<p class="font-body-sm text-body-sm text-on-surface-variant text-[11px]">Requiere atención manual</p>
</div>
</div>
<div class="flex flex-col items-end">
<span class="flex items-center gap-1 text-[10px] font-bold text-error">
<span class="w-2 h-2 rounded-full bg-error animate-pulse"></span> Alerta
                                </span>
<span class="font-label-sm text-label-sm text-on-surface mt-1">2 Casos</span>
</div>
</div>
</div>
</div>
<!-- Critical Alerts & Upcoming Content (Spanning full width on md, splitting on xl) -->
<!-- Alerts Panel -->
<div class="col-span-1 md:col-span-1 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
<div class="flex items-center justify-between mb-6">
<h3 class="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
<span class="material-symbols-outlined text-error">notifications_active</span>
                            Alertas Recientes
                        </h3>
<button class="text-primary font-label-sm text-label-sm hover:underline">Ver todo</button>
</div>
<div class="space-y-3">
<div class="p-3 bg-surface rounded-lg border-l-4 border-error shadow-sm flex items-start gap-3">
<span class="material-symbols-outlined text-error mt-0.5 text-sm">local_shipping</span>
<div>
<p class="font-label-sm text-label-sm text-on-surface">Retraso en entrega - Pedido #4092</p>
<p class="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">El cliente lleva esperando +45 mins. Intervención manual requerida.</p>
<p class="text-[10px] text-on-surface-variant mt-2 font-medium">Hace 10 mins</p>
</div>
</div>
<div class="p-3 bg-surface rounded-lg border-l-4 border-[#f59e0b] shadow-sm flex items-start gap-3">
<span class="material-symbols-outlined text-[#f59e0b] mt-0.5 text-sm">inventory_2</span>
<div>
<p class="font-label-sm text-label-sm text-on-surface">Stock bajo: Salmón Fresco</p>
<p class="font-body-sm text-body-sm text-on-surface-variant text-xs mt-1">Quedan menos de 2kg en inventario principal.</p>
<p class="text-[10px] text-on-surface-variant mt-2 font-medium">Hace 1 hora</p>
</div>
</div>
</div>
</div>
<!-- Upcoming Content Gallery (Image heavy) -->
<div class="col-span-1 md:col-span-1 xl:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
<div class="flex items-center justify-between mb-6">
<div>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Próximo Contenido Programado</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Material visual para redes sociales de esta semana.</p>
</div>
<button class="w-8 h-8 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-container-high transition-colors">
<span class="material-symbols-outlined text-on-surface-variant">add</span>
</button>
</div>
<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
<!-- Image Thumb 1 -->
<div class="group relative rounded-lg overflow-hidden aspect-square border border-outline-variant cursor-pointer">
<img alt="Sushi roll platter" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="A professional close-up photograph of an elaborate sushi roll platter arranged symmetrically on a dark slate board. The lighting is high-end studio style, casting soft highlights on the fresh salmon and tuna. The overall aesthetic matches the modern corporate culinary vibe of Sushi Poke &amp; Roll, utilizing deep charcoal backgrounds to make the vibrant coral colors of the raw fish pop off the screen." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJlYmX-crsXFn6DZtpB0CVCyOwNiFeHMAy2cQVww57fBRzyt8i5yqjH0iY3GlO4q2lNcBbMrVkC_s1Prp3ticT9RF3MSSmwiUds39FLU_gPtJZQoVyE_DhFvTu4UZqzl8uI9EwCTKnh6By3RikPzIC81PFyvfKSfw3bUKS7x3UdG-1za954q8KI6fYzPsi6opW1wh-6dWGpK3ljz1-B5Pzk1I8cqG4fZSgLupw3TZDGtQSJwa9SxTFdICMn4fkMhY-4JxlgJVCDQE"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
<span class="text-white font-label-sm text-[10px] truncate">Promo_Jueves.jpg</span>
</div>
</div>
<!-- Image Thumb 2 -->
<div class="group relative rounded-lg overflow-hidden aspect-square border border-outline-variant cursor-pointer">
<img alt="Fresh Poke Bowl" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="A bright, top-down shot of a colorful Hawaiian poke bowl sitting on a pristine white surface. The bowl is filled with vibrant ingredients like diced pink tuna, bright green edamame, and yellow mango. The lighting is bright and clean, reflecting a high-fidelity light mode interface style. The mood is fresh, appetizing, and highly organized, perfect for a modern culinary dashboard." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFsLvBWstV-4f-thsbeMBbUi6bRVvTrBVR5rwajqdVWZS5pQ0PGQLhoCYiiGLb3fWoxkoqdPrghX9WKffSo9B63gxBZ6-fbXi0wU8y6sY2hqNQZiLHbGrMslPnlx0HejsRoFB2yBxaX6lIvNidt_7QO4NhUOForxIuKnQvgPMQL7s6_46uRcJXpcZLE8iZ4BIYnI_9UCkxZKANhH4QUk2tz5TJQLHMQKIYFGtK4xiR0yoWJPGPkjSI7biz0dJlNFsFMLyrpqNjgPY"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
<span class="text-white font-label-sm text-[10px] truncate">Poke_Nuevo_Menu.jpg</span>
</div>
</div>
<!-- Image Thumb 3 -->
<div class="group relative rounded-lg overflow-hidden aspect-square border border-outline-variant cursor-pointer">
<img alt="Sushi preparation" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" data-alt="A dynamic action shot showing a chef's hands delicately rolling sushi using a bamboo mat. The focus is tight on the hands and the vibrant ingredients, with a shallow depth of field blurring the clean, stainless steel kitchen background. The lighting is crisp and professional, emphasizing administrative efficiency mixed with culinary artistry. Warm coral accents highlight the fresh ingredients against neutral surroundings." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3ZkNWvF39HDcrpV4uKnywUTOSnUyqg7WA3myFE6Yw8WetkpRzc3cFLZNi_3HHLPK1rHDUaZxC7F8CuaayrC4SPGCCFxaAkaf2q8l309lUn9N6q_t5Z8lm9VQxmKeVEBCha7ajPZQjjcxMuPiqzs5Emm35owXTT54mFzxbVtjGAuFwgMFR5kpKrPn3QoDdqCe4nugGTM2nPsBbhT9NmGjXc7aJbVMuRjH59q_7QnUNSNHhp1DrZurRgYTZYAy2b7mgVyv3x7rP4Oo"/>
<div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
<span class="text-white font-label-sm text-[10px] truncate">Behind_Scenes.jpg</span>
</div>
</div>
<!-- Add New Placeholder -->
<div class="rounded-lg aspect-square border-2 border-dashed border-outline-variant bg-surface-container flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high hover:border-primary transition-all text-on-surface-variant hover:text-primary">
<span class="material-symbols-outlined text-3xl mb-1">cloud_upload</span>
<span class="font-label-sm text-[10px]">Subir Arte</span>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- BottomNavBar (Visible only on md:hidden) -->
<nav class="md:hidden fixed bottom-0 w-full flex justify-around items-center py-2 px-gutter bg-surface dark:bg-surface border-t border-outline-variant dark:border-outline z-50">
<!-- Active -->
<a class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-transform scale-90 duration-200" href="#">
<span class="material-symbols-outlined icon-fill">dashboard</span>
<span class="font-label-sm text-label-sm mt-1">Dashboard</span>
</a>
<!-- Inactive -->
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all px-2 py-1 rounded-lg" href="#">
<span class="material-symbols-outlined">inbox</span>
<span class="font-label-sm text-label-sm mt-1">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all px-2 py-1 rounded-lg" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
<span class="font-label-sm text-label-sm mt-1">Menú</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all px-2 py-1 rounded-lg" href="#">
<span class="material-symbols-outlined">calendar_month</span>
<span class="font-label-sm text-label-sm mt-1">Planificador</span>
</a>
</nav>
</body></html>

<!-- Planificador de Contenido Pro -->
<!DOCTYPE html>

<html lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Centro de Mensajería - Sushi Poke &amp; Roll</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "outline-variant": "#e0bfbd",
                        "tertiary-fixed-dim": "#94ccff",
                        "surface-container-lowest": "#ffffff",
                        "tertiary-fixed": "#cde5ff",
                        "background": "#fff8f7",
                        "surface-container-high": "#fbe3e1",
                        "surface": "#fff8f7",
                        "surface-dim": "#edd5d3",
                        "secondary-container": "#dce4e6",
                        "coral-accent": "#ff6b6b",
                        "on-error-container": "#93000a",
                        "on-tertiary": "#ffffff",
                        "tertiary": "#004a74",
                        "surface-background": "#f8f9fa",
                        "on-tertiary-container": "#b9dcff",
                        "on-error": "#ffffff",
                        "on-primary-fixed-variant": "#8c151f",
                        "on-surface": "#251818",
                        "inverse-surface": "#3b2d2c",
                        "secondary": "#586062",
                        "primary-fixed-dim": "#ffb3b0",
                        "on-tertiary-fixed": "#001d32",
                        "surface-variant": "#f5dddb",
                        "inverse-primary": "#ffb3b0",
                        "surface-tint": "#ae2f34",
                        "on-primary-container": "#ffcdca",
                        "error-container": "#ffdad6",
                        "on-primary-fixed": "#410006",
                        "secondary-fixed-dim": "#c0c8ca",
                        "on-primary": "#ffffff",
                        "error": "#ba1a1a",
                        "primary-fixed": "#ffdad8",
                        "on-secondary-container": "#5e6668",
                        "tertiary-container": "#006398",
                        "primary": "#8d151f",
                        "surface-bright": "#fff8f7",
                        "outline": "#8c706f",
                        "border-subtle": "#e0bfbd",
                        "surface-container-highest": "#f5dddb",
                        "on-surface-variant": "#584140",
                        "surface-container-low": "#fff0ef",
                        "on-secondary-fixed": "#151d1f",
                        "surface-container": "#ffe9e7",
                        "primary-container": "#ae2f34",
                        "on-secondary-fixed-variant": "#40484a",
                        "secondary-fixed": "#dce4e6",
                        "on-background": "#251818",
                        "on-secondary": "#ffffff",
                        "inverse-on-surface": "#ffedeb",
                        "on-tertiary-fixed-variant": "#004b74",
                        "sidebar-charcoal": "#2e3132"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "pane-sidebar-width": "320px",
                        "stack-gap": "0.5rem",
                        "nav-width-expanded": "240px",
                        "margin-desktop": "2rem",
                        "gutter": "1rem",
                        "calendar-cell-min-height": "120px"
                    },
                    "fontFamily": {
                        "body-md": ["Inter"],
                        "display-lg": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "label-lg": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-sm": ["Inter"],
                        "headline-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "label-sm": ["Inter"]
                    },
                    "fontSize": {
                        "body-md": ["16px", { "lineHeight": "24px", "fontWeight": "400" }],
                        "display-lg": ["48px", { "lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "body-lg": ["18px", { "lineHeight": "28px", "fontWeight": "400" }],
                        "headline-lg-mobile": ["28px", { "lineHeight": "36px", "fontWeight": "600" }],
                        "label-lg": ["14px", { "lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600" }],
                        "headline-md": ["24px", { "lineHeight": "32px", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "20px", "fontWeight": "400" }],
                        "headline-sm": ["20px", { "lineHeight": "28px", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "40px", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500" }]
                    }
                },
            },
        }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
        .icon-fill {
            font-variation-settings: 'FILL' 1;
        }
        /* Custom scrollbar for message list */
        ::-webkit-scrollbar {
            width: 6px;
        }
        ::-webkit-scrollbar-track {
            background: transparent;
        }
        ::-webkit-scrollbar-thumb {
            background: #e0bfbd;
            border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
            background: #8c706f;
        }
    </style>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface font-body-md h-screen flex flex-col overflow-hidden">
<!-- TopAppBar -->
<header class="bg-surface dark:bg-surface border-b border-outline-variant dark:border-outline flex justify-between items-center px-gutter w-full h-16 shrink-0 z-10">
<div class="flex items-center gap-4">
<button class="md:hidden text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full">
<span class="material-symbols-outlined">menu</span>
</button>
<h1 class="font-headline-md text-headline-md text-primary dark:text-primary-fixed">Sushi Poke &amp; Roll</h1>
</div>
<!-- Desktop Nav -->
<nav class="hidden md:flex gap-6">
<a class="text-on-surface-variant font-body-md hover:text-primary transition-colors py-2 flex items-center gap-2" href="#">
<span class="material-symbols-outlined">dashboard</span>
                Dashboard
            </a>
<a class="text-primary font-bold font-body-md py-2 border-b-2 border-primary flex items-center gap-2" href="#">
<span class="material-symbols-outlined icon-fill">inbox</span>
                Inbox
            </a>
<a class="text-on-surface-variant font-body-md hover:text-primary transition-colors py-2 flex items-center gap-2" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
                Menú
            </a>
<a class="text-on-surface-variant font-body-md hover:text-primary transition-colors py-2 flex items-center gap-2" href="#">
<span class="material-symbols-outlined">calendar_month</span>
                Planificador
            </a>
</nav>
<div class="flex items-center gap-4">
<button class="text-on-surface-variant hover:bg-surface-container transition-colors p-2 rounded-full relative">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-1 right-1 w-2.5 h-2.5 bg-coral-accent rounded-full border-2 border-surface"></span>
</button>
<img alt="User Avatar" class="w-8 h-8 rounded-full border border-border-subtle" data-alt="Close up portrait of a professional manager with a friendly smile, well-lit in a modern office environment, wearing smart casual attire. The lighting is soft and natural, casting subtle highlights on the face. High resolution, corporate aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCdb24dWjHSRpyK6GzXj4-WMeuhr75s6f-V4krQM9b98qNXF5KmpGxRt3kGoNVYYLi7WP82bqRKAOEK3tfsgMWn7ysc_Qos6QNZ4Kcms2oRMBtNm_wScWO_-LZGKDFBsXA9VK3GOZMcn73sEm44NMV_Hd0UGvFvcsgRRjGHPcpCNeRw-gAlq5deij3xH6ZZuRSVWAmQHePLRCC5s_nqP5uZsfnX6hEl-7EbhmhwRFYojM8WKS_am_O7ZLSFQ2Ayz8Mf-x3crwreOIs"/>
</div>
</header>
<!-- Main Workspace -->
<main class="flex-1 flex overflow-hidden">
<!-- Sidebar Navigation (Desktop) - Kept minimal as TopAppBar is handling primary nav, using this for secondary tools -->
<aside class="hidden lg:flex w-16 xl:w-[80px] flex-col items-center py-6 bg-surface-container-lowest border-r border-outline-variant shrink-0">
<div class="flex flex-col gap-6 w-full px-2">
<button class="w-full flex justify-center p-3 rounded-lg text-primary bg-primary-container/20">
<span class="material-symbols-outlined icon-fill">chat</span>
</button>
<button class="w-full flex justify-center p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
<span class="material-symbols-outlined">group</span>
</button>
<button class="w-full flex justify-center p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
<span class="material-symbols-outlined">bar_chart</span>
</button>
<button class="w-full flex justify-center p-3 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors">
<span class="material-symbols-outlined">settings</span>
</button>
</div>
</aside>
<!-- Message List Area (Inbox) -->
<section class="w-full md:w-[380px] lg:w-[420px] bg-surface flex flex-col border-r border-outline-variant shrink-0">
<!-- Header & Search -->
<div class="p-4 border-b border-outline-variant shrink-0 bg-surface-container-lowest">
<div class="flex justify-between items-center mb-4">
<h2 class="font-headline-sm text-headline-sm text-on-surface">Centro de Mensajería</h2>
<button class="text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">filter_list</span>
</button>
</div>
<div class="relative w-full mb-4">
<span class="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant text-sm">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary text-body-sm font-body-sm text-on-surface placeholder-on-surface-variant" placeholder="Buscar clientes, mensajes..." type="text"/>
</div>
<!-- Filters -->
<div class="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
<button class="px-3 py-1 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm whitespace-nowrap shrink-0">Todos (12)</button>
<button class="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-highest font-label-sm text-label-sm whitespace-nowrap shrink-0 flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-[#25D366]"></span> WhatsApp
                    </button>
<button class="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-highest font-label-sm text-label-sm whitespace-nowrap shrink-0 flex items-center gap-1">
<span class="w-2 h-2 rounded-full bg-[#E1306C]"></span> Instagram
                    </button>
</div>
</div>
<!-- List -->
<div class="flex-1 overflow-y-auto bg-surface-container-lowest">
<!-- Active Chat Item -->
<div class="p-4 border-b border-outline-variant bg-surface cursor-pointer relative border-l-4 border-l-primary hover:bg-surface-container-low transition-colors">
<div class="flex justify-between items-start mb-1">
<div class="flex items-center gap-3">
<div class="relative">
<img alt="Client Avatar" class="w-10 h-10 rounded-full object-cover" data-alt="Portrait of a young woman with a relaxed expression, natural lighting, casual setting, soft focus background. She is wearing a light colored top. High quality profile picture style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_nmRLiMfv5v30vu7pFzF9g1cVa74l_Lnf1ulQaKUDjWhW0IYX8SG4Ot_PT6QOtQFNsV-8B_-CQ7aQ7LFyXou4hnfAOQLSryAw56DNIdi-4AxOm76rl4GYArnmwWIyu_ZTGwKvkHYaokSou43oMXUHSdv2Hj9XmMgeVB7m-ulOUMtoQi2uYwFErAUuRhbp2F1jWzAokIJ4D32MCVzg181d4-SzjlyLzJzsqCiSNb9AIVOkW5AWCQn2BW9K0Ftcgx269GtktfhCRLw"/>
<span class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#25D366] rounded-full border-2 border-surface flex items-center justify-center">
<span class="material-symbols-outlined text-white text-[10px]">chat</span>
</span>
</div>
<div>
<h3 class="font-label-lg text-label-lg text-on-surface font-semibold">Mariana Ríos</h3>
<div class="flex items-center gap-2">
<span class="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary-container/10 text-tertiary font-medium">Escalado a Humano</span>
</div>
</div>
</div>
<span class="font-label-sm text-[11px] text-on-surface-variant">10:42 AM</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 ml-13 pl-[52px]">Quiero hacer un pedido grande para una reunión de 10 personas este viernes, ¿tienen opciones de bandejas?</p>
</div>
<!-- Inactive Chat Item 1 -->
<div class="p-4 border-b border-outline-variant bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors">
<div class="flex justify-between items-start mb-1">
<div class="flex items-center gap-3">
<div class="relative">
<img alt="Client Avatar" class="w-10 h-10 rounded-full object-cover" data-alt="Portrait of a smiling young man in a casual shirt, outdoor setting with blurred green background. Soft daylight illumination. Professional profile photo look." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8SiQ0-EfExMGXurIzzavcb0LL_SmXHuorGvfHZrfc_GGE6ApDUIvkXH6hR-w_hTFJ95cMNzXYy6biUvwKHPsyxukwyQPGb1iSfetWC3LoLkFczmFm5kEvQIQ2psjUX9VL93HjuliiDeAUmF57Hw6sftwTIUdkOnmuRZDwnn83p8muvhv00o8Vip25KIKZ3r4odmTBOIvvQ7TmYnlJE7NFg9O4QvaTIniGGaxzZFW4kWKMDGiCJQ1QGd07V02DqBt-g-wKS2JigK0"/>
<span class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#E1306C] rounded-full border-2 border-surface flex items-center justify-center">
<span class="material-symbols-outlined text-white text-[10px]">photo_camera</span>
</span>
</div>
<div>
<h3 class="font-label-lg text-label-lg text-on-surface">Carlos Mendoza</h3>
<div class="flex items-center gap-2">
<span class="font-label-sm text-[10px] px-2 py-0.5 rounded bg-surface-variant text-on-surface-variant font-medium">Resuelto</span>
</div>
</div>
</div>
<span class="font-label-sm text-[11px] text-on-surface-variant">Ayer</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 ml-13 pl-[52px]">¡Estaba delicioso el poke bowl! Muchas gracias.</p>
</div>
<!-- Inactive Chat Item 2 -->
<div class="p-4 border-b border-outline-variant bg-surface-container-lowest cursor-pointer hover:bg-surface-container-low transition-colors">
<div class="flex justify-between items-start mb-1">
<div class="flex items-center gap-3">
<div class="relative">
<div class="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-headline-sm">L</div>
<span class="absolute -bottom-1 -right-1 w-4 h-4 bg-[#25D366] rounded-full border-2 border-surface flex items-center justify-center">
<span class="material-symbols-outlined text-white text-[10px]">chat</span>
</span>
</div>
<div>
<h3 class="font-label-lg text-label-lg text-on-surface font-semibold">Laura Gómez</h3>
<div class="flex items-center gap-2">
<span class="font-label-sm text-[10px] px-2 py-0.5 rounded bg-tertiary-fixed-dim/30 text-tertiary-fixed-dim border border-tertiary-fixed-dim/50 font-medium">IA Respondiendo</span>
</div>
</div>
</div>
<span class="font-label-sm text-[11px] text-primary font-bold">09:15 AM</span>
<div class="absolute right-4 top-10 w-2 h-2 bg-primary rounded-full"></div>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-1 ml-13 pl-[52px]">¿A qué hora abren hoy?</p>
</div>
</div>
</section>
<!-- Active Chat / Detail View (Hidden on mobile unless active) -->
<section class="hidden md:flex flex-1 bg-surface-container-lowest flex-col">
<!-- Chat Header -->
<div class="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest shrink-0">
<div class="flex items-center gap-4">
<img alt="Client Avatar" class="w-12 h-12 rounded-full object-cover" data-alt="Portrait of a young woman with a relaxed expression, natural lighting, casual setting, soft focus background. She is wearing a light colored top. High quality profile picture style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQKnDWZkiXJGTkNzDvJEitEXEXBnk6e_R-sDlw1NUE2pJoc1-o1a-M3EmFQ-19Ifx7ZOIu1B6QGTimscrFvO1qbQku7Cz-x1IdFTMcCVIg_DYMP4Aozzhb_TPReVUAa0jX_Td-lAxYSob5hCK7kzayXXU5ho5a88eyd2z1lYYeZ9mO39WQAMzhJO2kLnE3_dHyE28gBViAQhh5RJVOSyTvra8fZ8qPBCdYfDjJfsY8G0JWR0CeMyXhEzx3r0rFkZVeAnR0EUU2hSE"/>
<div>
<h2 class="font-headline-sm text-headline-sm text-on-surface">Mariana Ríos</h2>
<div class="flex items-center gap-2 text-on-surface-variant font-body-sm text-sm">
<span class="material-symbols-outlined text-sm text-[#25D366]">chat</span>
                            WhatsApp • Cliente Frecuente
                        </div>
</div>
</div>
<div class="flex items-center gap-3">
<button class="px-4 py-2 rounded-lg border border-outline-variant text-on-surface font-label-lg hover:bg-surface-container transition-colors">
                        Resolver
                    </button>
<button class="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</div>
</div>
<!-- Chat History -->
<div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-background">
<!-- System Message -->
<div class="flex justify-center my-2">
<span class="px-3 py-1 bg-surface-variant text-on-surface-variant font-label-sm text-xs rounded-full">Hoy</span>
</div>
<!-- AI Interaction Block -->
<div class="flex flex-col gap-2 max-w-[85%] self-start">
<div class="flex items-end gap-2">
<img alt="Client Avatar" class="w-8 h-8 rounded-full mb-1" data-alt="Portrait of a young woman with a relaxed expression, natural lighting, casual setting, soft focus background. She is wearing a light colored top. High quality profile picture style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPXrblkY2Fe4agAcKFR7onZWix7XHE9AHVuxcnHmXWshKVB9wvSxyhCCs7p0EFTe9-uv6XLhEBRfJT9xv3egEF_ZcrWnfTty1UCgT02xgkhBLWAnCFAD4IFhp6ferMcGXS3PiFr45M0vno_fcHW9BS_lwTZNeiwuQhQPt7WklNEJfAxOY5SYIaRtudAzqbWgEB6JFhogtdmoy2WCv2hJ1twtP6B3VwUB4XKFC4PpB4r7tJaNpiPCupfIafMAv0NqcGlEHQs-Qu_k4"/>
<div class="bg-surface-container-lowest p-3 rounded-2xl rounded-bl-sm border border-outline-variant text-on-surface font-body-md shadow-sm">
                            ¡Hola! Quiero hacer un pedido grande para una reunión de 10 personas este viernes, ¿tienen opciones de bandejas?
                        </div>
</div>
<span class="text-[10px] text-on-surface-variant ml-10">10:40 AM</span>
</div>
<div class="flex flex-col gap-2 max-w-[85%] self-start ml-10 relative">
<!-- AI Badge indicator -->
<div class="absolute -left-6 top-2 text-tertiary-fixed-dim">
<span class="material-symbols-outlined text-[16px]">smart_toy</span>
</div>
<div class="bg-surface-container p-3 rounded-2xl rounded-tl-sm border border-tertiary-fixed-dim/30 text-on-surface font-body-md shadow-sm">
                        ¡Hola Mariana! Qué gusto saludarte. Sí, contamos con **Bandejas Party** ideales para reuniones. Tenemos la *Bandeja Clásica* (60 piezas) y la *Bandeja Premium* (80 piezas). ¿Te gustaría ver el menú de bandejas o prefieres que un agente te asesore personalmente?
                    </div>
<span class="text-[10px] text-on-surface-variant">10:40 AM • IA Asistente</span>
</div>
<div class="flex flex-col gap-2 max-w-[85%] self-start">
<div class="flex items-end gap-2">
<img alt="Client Avatar" class="w-8 h-8 rounded-full mb-1" data-alt="Portrait of a young woman with a relaxed expression, natural lighting, casual setting, soft focus background. She is wearing a light colored top. High quality profile picture style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuANq-hfGAW6oSBBIYDcLjIWxsgLcXJ4Y9xoqxLewhzbN3BiewDThwSB6eXiAgYX6t7qlV_Yf-AzQasjhDg5R1iBnUt47YjOhDwzad2HkEhfqo4tfNGiWyPFGXDFjRj3WaOYmkKbEMJfkoXLhkaEf09I-BQFf2ZFPaqw8fMHMe7UAL6Ac-1-ZysXiWkfQnRfFrmoQ88Htb5PD4UOhkv8d6mhj_RpY-1bvhyHkYjoS_7qeW5fVy5n8zkUMkHqDp6eS5epv_b2NmzQ5Fo"/>
<div class="bg-surface-container-lowest p-3 rounded-2xl rounded-bl-sm border border-outline-variant text-on-surface font-body-md shadow-sm">
                            Me gustaría hablar con alguien para armar una bandeja personalizada si es posible.
                        </div>
</div>
<span class="text-[10px] text-on-surface-variant ml-10">10:42 AM</span>
</div>
<!-- Escalation Notice -->
<div class="flex justify-center my-4">
<div class="flex items-center gap-2 px-4 py-2 bg-primary-container/10 border border-primary-container/20 text-primary font-label-sm rounded-lg">
<span class="material-symbols-outlined text-[16px]">person</span>
                        Chat escalado a Humano (Admin)
                    </div>
</div>
<!-- Human Response (Drafting) -->
<div class="flex flex-col gap-2 max-w-[85%] self-end">
<div class="bg-primary-container text-on-primary-container p-3 rounded-2xl rounded-br-sm shadow-sm font-body-md">
                        ¡Claro Mariana! Con gusto te ayudo a personalizar tu bandeja. Para 10 personas sugerimos calcular unas 8-10 piezas por persona si habrá más comida, o 15 si será plato principal. ¿Qué tipo de rolls prefieren? ¿Tienen alguna alergia?
                    </div>
<span class="text-[10px] text-on-surface-variant text-right mr-1 flex items-center justify-end gap-1">
                        10:45 AM
                        <span class="material-symbols-outlined text-[12px] text-primary">done_all</span>
</span>
</div>
</div>
<!-- Input Area -->
<div class="p-4 border-t border-outline-variant bg-surface-container-lowest shrink-0">
<!-- AI Suggestions Toolbar -->
<div class="flex gap-2 mb-3 overflow-x-auto hide-scrollbar">
<button class="px-3 py-1.5 rounded-full border border-tertiary-fixed-dim/50 bg-tertiary-fixed-dim/10 text-tertiary font-label-sm flex items-center gap-1 hover:bg-tertiary-fixed-dim/20 transition-colors shrink-0">
<span class="material-symbols-outlined text-[14px]">smart_toy</span>
                        Sugerir Menú Premium
                    </button>
<button class="px-3 py-1.5 rounded-full border border-tertiary-fixed-dim/50 bg-tertiary-fixed-dim/10 text-tertiary font-label-sm flex items-center gap-1 hover:bg-tertiary-fixed-dim/20 transition-colors shrink-0">
<span class="material-symbols-outlined text-[14px]">smart_toy</span>
                        Ofrecer Descuento Volumen
                    </button>
</div>
<div class="flex items-end gap-2 bg-surface-container rounded-2xl p-2 focus-within:ring-2 focus-within:ring-primary transition-all">
<button class="p-2 text-on-surface-variant hover:text-primary transition-colors">
<span class="material-symbols-outlined">attach_file</span>
</button>
<textarea class="flex-1 bg-transparent border-none resize-none focus:ring-0 text-body-md font-body-md py-2 max-h-32 min-h-[40px]" placeholder="Escribe un mensaje..." rows="1"></textarea>
<button class="p-2 bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center w-10 h-10 shadow-sm">
<span class="material-symbols-outlined">send</span>
</button>
</div>
</div>
</section>
<!-- Right Inspector Pane (Customer Detail) -->
<aside class="hidden xl:flex w-pane-sidebar-width flex-col bg-surface-container-lowest border-l border-outline-variant shrink-0">
<div class="p-6 border-b border-outline-variant flex flex-col items-center">
<img alt="Client Avatar Large" class="w-20 h-20 rounded-full object-cover mb-4 shadow-sm" data-alt="Portrait of a young woman with a relaxed expression, natural lighting, casual setting, soft focus background. She is wearing a light colored top. High quality profile picture style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAilDqKr9eT-JBukXWhQ84enV6fiLeuMRR9b35rK8fSg4BvmsnR-Tdiy8-TAgYq8rQIqQuCQIbTVCLzpbwjOEW4Va98Hqk7spWU5BSWC3IVruSzafVux1IcO-hQMGaaxuVdN_SznU6JLlI-BMsDCz5ojt5FfLC1Mmk-A4zu1D-3gVBpfyCyeABwsJd0F6Ax8uxBuu_5k0gvEGCwlsMR-RzuF6Tpw9Gx-P6yoTgYLuV7DkeENaR9dTrB2xA6TO0XfZyiC2nl-lZeyWg"/>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Mariana Ríos</h3>
<p class="font-body-sm text-on-surface-variant">+54 9 11 4567-8901</p>
<div class="mt-4 flex gap-2">
<span class="px-2 py-1 bg-surface-variant text-on-surface-variant rounded font-label-sm text-xs">VIP</span>
<span class="px-2 py-1 bg-surface-variant text-on-surface-variant rounded font-label-sm text-xs">Empresa</span>
</div>
</div>
<div class="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
<!-- Data Block -->
<div>
<h4 class="font-label-lg text-label-lg text-on-surface mb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">receipt_long</span>
                        Historial de Pedidos
                    </h4>
<div class="flex flex-col gap-3">
<div class="p-3 rounded-lg border border-outline-variant bg-surface">
<div class="flex justify-between items-start mb-1">
<span class="font-label-sm font-semibold">Pedido #4582</span>
<span class="font-label-sm text-on-surface-variant text-xs">Hace 2 sem</span>
</div>
<p class="font-body-sm text-sm text-on-surface-variant">2x Poke Salmon Premium, 1x Gyozas</p>
<div class="mt-2 text-primary font-label-sm">$4,500.00</div>
</div>
<div class="p-3 rounded-lg border border-outline-variant bg-surface">
<div class="flex justify-between items-start mb-1">
<span class="font-label-sm font-semibold">Pedido #4120</span>
<span class="font-label-sm text-on-surface-variant text-xs">Hace 1 mes</span>
</div>
<p class="font-body-sm text-sm text-on-surface-variant">Bandeja Party (40 pz)</p>
<div class="mt-2 text-primary font-label-sm">$12,000.00</div>
</div>
</div>
</div>
<!-- Notes Block -->
<div>
<h4 class="font-label-lg text-label-lg text-on-surface mb-3 flex items-center gap-2">
<span class="material-symbols-outlined text-[18px]">edit_note</span>
                        Notas Internas
                    </h4>
<div class="bg-surface-container-high p-3 rounded-lg font-body-sm text-sm text-on-surface border border-outline-variant border-dashed">
                        Cliente prefiere poca salsa de soja. Suele pedir para almuerzos de oficina los viernes.
                    </div>
</div>
</div>
</aside>
</main>
<!-- BottomNavBar (Mobile Only) -->
<nav class="md:hidden bg-surface dark:bg-surface border-t border-outline-variant dark:border-outline fixed bottom-0 w-full flex justify-around items-center py-2 px-gutter z-50">
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all py-1 px-4 rounded-lg" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-sm text-label-sm mt-1">Dashboard</span>
</a>
<a class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 hover:bg-surface-container-high transition-all scale-95 duration-100" href="#">
<span class="material-symbols-outlined icon-fill">inbox</span>
<span class="font-label-sm text-label-sm mt-1">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all py-1 px-4 rounded-lg" href="#">
<span class="material-symbols-outlined">restaurant_menu</span>
<span class="font-label-sm text-label-sm mt-1">Menú</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all py-1 px-4 rounded-lg" href="#">
<span class="material-symbols-outlined">calendar_month</span>
<span class="font-label-sm text-label-sm mt-1">Planificador</span>
</a>
</nav>
</body></html>

<!-- Planificador de Contenido Pro - Escritorio -->
<!DOCTYPE html>

<html lang="es"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Sushi Poke &amp; Roll - Catálogo</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
          darkMode: "class",
          theme: {
            extend: {
              "colors": {
                      "outline-variant": "#e0bfbd",
                      "tertiary-fixed-dim": "#94ccff",
                      "surface-container-lowest": "#ffffff",
                      "tertiary-fixed": "#cde5ff",
                      "background": "#fff8f7",
                      "surface-container-high": "#fbe3e1",
                      "surface": "#fff8f7",
                      "surface-dim": "#edd5d3",
                      "secondary-container": "#dce4e6",
                      "coral-accent": "#ff6b6b",
                      "on-error-container": "#93000a",
                      "on-tertiary": "#ffffff",
                      "tertiary": "#004a74",
                      "surface-background": "#f8f9fa",
                      "on-tertiary-container": "#b9dcff",
                      "on-error": "#ffffff",
                      "on-primary-fixed-variant": "#8c151f",
                      "on-surface": "#251818",
                      "inverse-surface": "#3b2d2c",
                      "secondary": "#586062",
                      "primary-fixed-dim": "#ffb3b0",
                      "on-tertiary-fixed": "#001d32",
                      "surface-variant": "#f5dddb",
                      "inverse-primary": "#ffb3b0",
                      "surface-tint": "#ae2f34",
                      "on-primary-container": "#ffcdca",
                      "error-container": "#ffdad6",
                      "on-primary-fixed": "#410006",
                      "secondary-fixed-dim": "#c0c8ca",
                      "on-primary": "#ffffff",
                      "error": "#ba1a1a",
                      "primary-fixed": "#ffdad8",
                      "on-secondary-container": "#5e6668",
                      "tertiary-container": "#006398",
                      "primary": "#8d151f",
                      "surface-bright": "#fff8f7",
                      "outline": "#8c706f",
                      "border-subtle": "#e0bfbd",
                      "surface-container-highest": "#f5dddb",
                      "on-surface-variant": "#584140",
                      "surface-container-low": "#fff0ef",
                      "on-secondary-fixed": "#151d1f",
                      "surface-container": "#ffe9e7",
                      "primary-container": "#ae2f34",
                      "on-secondary-fixed-variant": "#40484a",
                      "secondary-fixed": "#dce4e6",
                      "on-background": "#251818",
                      "on-secondary": "#ffffff",
                      "inverse-on-surface": "#ffedeb",
                      "on-tertiary-fixed-variant": "#004b74",
                      "sidebar-charcoal": "#2e3132"
              },
              "borderRadius": {
                      "DEFAULT": "0.125rem",
                      "lg": "0.25rem",
                      "xl": "0.5rem",
                      "full": "0.75rem"
              },
              "spacing": {
                      "pane-sidebar-width": "320px",
                      "stack-gap": "0.5rem",
                      "nav-width-expanded": "240px",
                      "margin-desktop": "2rem",
                      "gutter": "1rem",
                      "calendar-cell-min-height": "120px"
              },
              "fontFamily": {
                      "body-md": ["Inter"],
                      "display-lg": ["Inter"],
                      "body-lg": ["Inter"],
                      "headline-lg-mobile": ["Inter"],
                      "label-lg": ["Inter"],
                      "headline-md": ["Inter"],
                      "body-sm": ["Inter"],
                      "headline-sm": ["Inter"],
                      "headline-lg": ["Inter"],
                      "label-sm": ["Inter"]
              },
              "fontSize": {
                      "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
                      "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
                      "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
                      "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "600"}],
                      "label-lg": ["14px", {"lineHeight": "20px", "letterSpacing": "0.01em", "fontWeight": "600"}],
                      "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
                      "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
                      "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
                      "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "600"}],
                      "label-sm": ["12px", {"lineHeight": "16px", "letterSpacing": "0.04em", "fontWeight": "500"}]
              }
            }
          }
        }
      </script>
<style>
    body {
      min-height: max(884px, 100dvh);
    }
  </style>
  </head>
<body class="bg-surface text-on-surface font-body-md h-screen flex flex-col md:flex-row overflow-hidden">
<!-- Top App Bar (Mobile) -->
<header class="md:hidden flex justify-between items-center px-gutter w-full h-16 bg-surface dark:bg-surface text-primary dark:text-primary-fixed-dim font-headline-sm text-headline-sm dark:text-on-surface font-headline-md text-headline-md text-primary dark:text-primary-fixed docked full-width top-0 border-b border-outline-variant dark:border-outline flat no shadows z-40">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined text-primary">person</span>
</div>
<h1 class="font-bold">Sushi Poke &amp; Roll</h1>
</div>
<button class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined">notifications</span>
</button>
</header>
<!-- Sidebar Navigation (Desktop) -->
<nav class="hidden md:flex flex-col w-[240px] bg-surface border-r border-outline-variant h-full z-40 shrink-0">
<div class="p-6 border-b border-outline-variant flex items-center gap-3">
<div class="w-10 h-10 rounded-full overflow-hidden bg-surface-variant flex items-center justify-center">
<span class="material-symbols-outlined text-primary">person</span>
</div>
<h1 class="font-headline-sm text-headline-sm text-primary font-bold tracking-tight">Sushi Poke &amp; Roll</h1>
</div>
<div class="flex flex-col gap-2 p-4 mt-4">
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="font-label-lg text-label-lg">Dashboard</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined">inbox</span>
<span class="font-label-lg text-label-lg">Inbox</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface-container-high text-primary font-bold border-l-4 border-primary transition-colors" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">restaurant_menu</span>
<span class="font-label-lg text-label-lg">Menú</span>
</a>
<a class="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors" href="#">
<span class="material-symbols-outlined">calendar_month</span>
<span class="font-label-lg text-label-lg">Planificador</span>
</a>
</div>
</nav>
<!-- Main Content Canvas -->
<main class="flex-1 overflow-y-auto bg-surface-background p-4 md:p-8 pb-24 md:pb-8 relative">
<div class="max-w-6xl mx-auto space-y-8">
<!-- Page Header & Actions -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Catálogo de Productos</h2>
<p class="font-body-md text-body-md text-on-surface-variant mt-1">Gestiona tu menú, precios y disponibilidad en tiempo real.</p>
</div>
<div class="flex items-center gap-3">
<button class="flex items-center gap-2 px-4 py-2 rounded-full border border-outline text-on-surface hover:bg-surface-container transition-colors font-label-lg text-label-lg">
<span class="material-symbols-outlined text-sm">filter_list</span>
                        Filtros
                    </button>
<button class="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary transition-all shadow-sm font-label-lg text-label-lg">
<span class="material-symbols-outlined text-sm">campaign</span>
                        Crear Promo
                    </button>
</div>
</div>
<!-- Bento Grid Dashboard Area -->
<div class="grid grid-cols-1 md:grid-cols-12 gap-6">
<!-- Inventory Health Card -->
<div class="col-span-1 md:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between">
<div class="flex items-start justify-between mb-4">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-tertiary p-2 bg-tertiary-fixed rounded-lg">inventory_2</span>
<h3 class="font-headline-sm text-headline-sm text-on-surface">Salud del Inventario</h3>
</div>
<span class="material-symbols-outlined text-on-surface-variant cursor-pointer">more_vert</span>
</div>
<div class="space-y-4">
<div>
<div class="flex justify-between font-label-sm text-label-sm mb-1">
<span class="text-on-surface-variant">Ingredientes Principales</span>
<span class="text-tertiary font-bold">85%</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-1.5">
<div class="bg-tertiary h-1.5 rounded-full" style="width: 85%"></div>
</div>
</div>
<div>
<div class="flex justify-between font-label-sm text-label-sm mb-1">
<span class="text-on-surface-variant">Empaques</span>
<span class="text-error font-bold">12%</span>
</div>
<div class="w-full bg-surface-variant rounded-full h-1.5">
<div class="bg-error h-1.5 rounded-full" style="width: 12%"></div>
</div>
<p class="font-body-sm text-body-sm text-error mt-1 flex items-center gap-1">
<span class="material-symbols-outlined text-[14px]">warning</span> Bowls M agotándose
                            </p>
</div>
</div>
</div>
<!-- Category Quick Stats -->
<div class="col-span-1 md:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary mb-2 text-3xl">set_meal</span>
<h4 class="font-label-lg text-label-lg text-on-surface">Sushi Rolls</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">24 Items</span>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary mb-2 text-3xl">rice_bowl</span>
<h4 class="font-label-lg text-label-lg text-on-surface">Poke Bowls</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">12 Items</span>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary mb-2 text-3xl">tapas</span>
<h4 class="font-label-lg text-label-lg text-on-surface">Entradas</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">8 Items</span>
</div>
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 flex flex-col items-center justify-center text-center shadow-sm hover:border-primary transition-colors cursor-pointer">
<span class="material-symbols-outlined text-primary mb-2 text-3xl">local_bar</span>
<h4 class="font-label-lg text-label-lg text-on-surface">Bebidas</h4>
<span class="font-body-sm text-body-sm text-on-surface-variant">15 Items</span>
</div>
</div>
</div>
<!-- Product Catalog Grid -->
<div>
<div class="flex items-center justify-between mb-4">
<h3 class="font-headline-md text-headline-md text-on-surface">Todos los Platos</h3>
<div class="relative w-64">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
<input class="w-full pl-10 pr-4 py-2 bg-surface-container rounded-full border-none focus:ring-2 focus:ring-primary text-body-sm font-body-sm placeholder-on-surface-variant text-on-surface outline-none" placeholder="Buscar plato..." type="text"/>
</div>
</div>
<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
<!-- Product Card 1 -->
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
<div class="h-48 w-full relative bg-surface-variant overflow-hidden">
<img alt="Sushi Roll" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A high-quality, appetizing close-up photograph of a fresh sushi roll platter. The sushi features vibrant orange salmon, bright green avocado, and perfectly cooked white rice. It is presented on a clean, modern white ceramic plate in a light, high-key setting. The lighting is soft and professional, highlighting the fresh textures of the seafood and creating a sophisticated, high-end culinary mood that aligns with a corporate modern light-mode interface." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAe_0ToUAua-eqF1jDelsD8lJGxIZIkuTcwnRhq0Iln3dAIRBHhUzg29HzzvsnQRRThVkHoOBxEkjKPddYwmUD5pWgHO20GgBKanvQgN_AcYo8DN951NmQvvn83Qq3gRRsSlnxXxb_lajSvLYsZ5zkFdJyExqQBxPtkA_9xCTtPWI-vRV9aCWslJK9pfgMeqFY-ZJQNyD2FWKNyk4Y4iI65fCEIUZGHWt7hUTkpl0sWET_E2S6QhYSXXkxtSD3uUq80LqbydlNTYQQ"/>
<div class="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded-lg text-primary font-label-sm text-label-sm border border-outline-variant/50">
                                Sushi
                            </div>
</div>
<div class="p-4 flex-1 flex flex-col">
<div class="flex justify-between items-start mb-2">
<h4 class="font-headline-sm text-headline-sm text-on-surface line-clamp-1">Spicy Tuna Roll</h4>
<span class="font-bold text-tertiary-container">$12.50</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">Atún picante, pepino, aguacate, cubierto con tempura crujiente y salsa anguila.</p>
<div class="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
<div class="flex items-center gap-2">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
<span class="font-label-sm text-label-sm text-on-surface-variant">Disponible</span>
</div>
<button class="text-primary hover:bg-surface-container p-1 rounded transition-colors">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
</div>
</div>
</div>
<!-- Product Card 2 -->
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
<div class="h-48 w-full relative bg-surface-variant overflow-hidden">
<img alt="Poke Bowl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" data-alt="A vibrant, overhead shot of a fresh poke bowl in a modern ceramic bowl. The dish is packed with colorful ingredients including deep pink cubed tuna, bright green edamame, yellow mango, and white rice. The bowl sits on a clean, light-colored surface with subtle soft shadows. The lighting is bright and inviting, emphasizing a fresh, healthy, and appetizing aesthetic suitable for a high-end culinary dashboard in light mode." src="https://lh3.googleusercontent.com/aida-public/AB6AXuALcmtfVZjrB91Zhi-zUiEEKU3QY1z3SGrn95CvrxF4ZJjMozZOJWs-po9mdqIGDFGYvrfQNKhYp0dD2ZCOssWni8irj7-TWuo5lEaGnGOxBuur1KClo_FcegtgTaYHbj12x6AfvHKHfDCOIPuEXrsOJYLWXWkipVcznp7_PsKXLH7SCAOAyax5B09G9UEynUepMloEFlMXtlZzbLMr6dGSH1o9wQxiB5vJbY8ciyH9CPai62HAtDxyJOQaBg89C7AagSbFFC8aBNw"/>
<div class="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded-lg text-primary font-label-sm text-label-sm border border-outline-variant/50">
                                Poke
                            </div>
</div>
<div class="p-4 flex-1 flex flex-col">
<div class="flex justify-between items-start mb-2">
<h4 class="font-headline-sm text-headline-sm text-on-surface line-clamp-1">Classic Hawaiian Bowl</h4>
<span class="font-bold text-tertiary-container">$15.00</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">Atún marinado, edamame, mango, aguacate, cebolla morada sobre base de arroz sushi.</p>
<div class="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
<div class="flex items-center gap-2">
<label class="relative inline-flex items-center cursor-pointer">
<input checked="" class="sr-only peer" type="checkbox" value=""/>
<div class="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
<span class="font-label-sm text-label-sm text-on-surface-variant">Disponible</span>
</div>
<button class="text-primary hover:bg-surface-container p-1 rounded transition-colors">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
</div>
</div>
</div>
<!-- Product Card 3 -->
<div class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
<div class="h-48 w-full relative bg-surface-variant overflow-hidden flex items-center justify-center bg-surface-container">
<span class="material-symbols-outlined text-4xl text-outline-variant">image</span>
<div class="absolute top-2 right-2 bg-surface-container-lowest/90 backdrop-blur-sm px-2 py-1 rounded-lg text-primary font-label-sm text-label-sm border border-outline-variant/50">
                                Entrada
                            </div>
</div>
<div class="p-4 flex-1 flex flex-col">
<div class="flex justify-between items-start mb-2">
<h4 class="font-headline-sm text-headline-sm text-on-surface line-clamp-1">Edamame Trufado</h4>
<span class="font-bold text-tertiary-container">$6.50</span>
</div>
<p class="font-body-sm text-body-sm text-on-surface-variant mb-4 line-clamp-2">Vainas de soya al vapor con sal marina y un toque de aceite de trufa blanca.</p>
<div class="mt-auto pt-4 border-t border-outline-variant flex items-center justify-between">
<div class="flex items-center gap-2">
<label class="relative inline-flex items-center cursor-pointer">
<input class="sr-only peer" type="checkbox" value=""/>
<div class="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
</label>
<span class="font-label-sm text-label-sm text-error">Agotado</span>
</div>
<button class="text-primary hover:bg-surface-container p-1 rounded transition-colors">
<span class="material-symbols-outlined text-[20px]">edit</span>
</button>
</div>
</div>
</div>
</div>
</div>
</div>
</main>
<!-- Bottom Nav Bar (Mobile) -->
<nav class="md:hidden fixed bottom-0 w-full flex justify-around items-center py-2 px-gutter bg-surface dark:bg-surface text-primary dark:text-primary-fixed-dim font-label-sm text-label-sm font-headline-sm text-primary docked full-width bottom-0 z-50 border-t border-outline-variant dark:border-outline flat no shadows bg-surface-background">
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all p-2 rounded-lg" href="#">
<span class="material-symbols-outlined">dashboard</span>
<span class="mt-1">Dashboard</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all p-2 rounded-lg" href="#">
<span class="material-symbols-outlined">inbox</span>
<span class="mt-1">Inbox</span>
</a>
<a class="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 hover:bg-surface-container-high transition-all scale-90 duration-200" href="#">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">restaurant_menu</span>
<span class="mt-1 font-bold">Menú</span>
</a>
<a class="flex flex-col items-center justify-center text-on-secondary-container hover:bg-surface-container-high transition-all p-2 rounded-lg" href="#">
<span class="material-symbols-outlined">calendar_month</span>
<span class="mt-1">Planificador</span>
</a>
</nav>
</body></html>