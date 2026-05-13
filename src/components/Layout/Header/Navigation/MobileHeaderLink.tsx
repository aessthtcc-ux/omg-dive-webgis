import { useState } from 'react';
import Link from 'next/link';
import { HeaderItem } from '../../../../types/menu';
import { usePathname, useRouter } from 'next/navigation';

const MobileHeaderLink: React.FC<{ item: HeaderItem }> = ({ item }) => {
  const [submenuOpen, setSubmenuOpen] = useState(false);

  const handleToggle = () => {
    setSubmenuOpen(!submenuOpen);
  };

  const router = useRouter();

  const handleNavigate = () => {
    router.push(item.href);
  };

  const path = usePathname();

  const isActive =
    path === item.href ||
    path.startsWith(`/${item.label.toLowerCase()}`);

  return (
    <div className="relative w-full mb-1">
      <button
        onClick={item.submenu ? handleToggle : handleNavigate}
        className={`group flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-in-out focus:outline-none
          ${
            isActive
              ? 'bg-primary/10 text-primary dark:bg-primary/20'
              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary'
          }
        `}
      >
        <span className="flex items-center gap-2">
          {isActive && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          )}
          {item.label}
        </span>

        {item.submenu && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1.25em"
            height="1.25em"
            viewBox="0 0 24 24"
            className={`transition-transform duration-300 ease-in-out ${
              submenuOpen ? 'rotate-180' : 'rotate-0'
            }`}
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m7 10l5 5l5-5"
            />
          </svg>
        )}
      </button>

      {/* Submenu with smooth height transition */}
      {item.submenu && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            submenuOpen
              ? 'max-h-96 opacity-100 mt-1'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="ml-4 pl-3 border-l-2 border-gray-200 dark:border-gray-700 flex flex-col space-y-1 py-1">
            {item.submenu.map((subItem, index) => {
              const isSubActive = path === subItem.href;
              return (
                <Link
                  key={index}
                  href={subItem.href}
                  className={`block px-3 py-2 rounded-lg text-sm transition-all duration-200 ease-in-out
                    ${
                      isSubActive
                        ? 'bg-primary/10 text-primary dark:bg-primary/20 font-medium'
                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary dark:hover:text-primary hover:translate-x-1'
                    }
                  `}
                >
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileHeaderLink;