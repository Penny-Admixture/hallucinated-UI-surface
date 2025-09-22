/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useState, useEffect, useRef} from 'react';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isAppOpen: boolean;
  appId?: string | null;
  onToggleParameters: () => void;
  onExitToDesktop: () => void;
  isParametersPanelOpen?: boolean;
  isAboutModalOpen: boolean;
  onOpenAbout: () => void;
  onCloseAbout: () => void;
  version: string;
}

const MenuBarItem: React.FC<{
  label: string;
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({label, children, isOpen, setIsOpen}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="menu-item px-2 py-1 rounded-sm hover:bg-white/20 focus:outline-none focus:bg-white/20"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {label}
      </button>
      {isOpen && (
        <div
          className="absolute left-0 mt-2 w-48 bg-menu-bar border border-window-border rounded-md shadow-lg z-50 py-1"
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}> = ({children, onClick, className}) => (
  <a
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick?.();
    }}
    className={`block px-4 py-2 text-sm text-menu-bar-text hover:bg-menu-item-hover hover:text-white ${className}`}
    role="menuitem"
  >
    {children}
  </a>
);

export const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  isAppOpen,
  onToggleParameters,
  onExitToDesktop,
  isParametersPanelOpen,
  isAboutModalOpen,
  onOpenAbout,
  onCloseAbout,
  version,
}) => {
  const [isFileMenuOpen, setFileMenuOpen] = useState(false);
  const [isHelpMenuOpen, setHelpMenuOpen] = useState(false);

  const closeAllMenus = () => {
    setFileMenuOpen(false);
    setHelpMenuOpen(false);
  };

  return (
    <div className="w-[800px] h-[600px] bg-window border border-window-border rounded-xl shadow-2xl flex flex-col relative overflow-hidden font-sans backdrop-blur-sm">
      {/* Title Bar */}
      <div className="bg-title-bar text-title-bar-text py-2 px-4 font-semibold text-base flex justify-between items-center select-none cursor-default rounded-t-xl flex-shrink-0">
        <span className="title-bar-text">{title}</span>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 flex items-center justify-center text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-title-bar-bg-color focus:ring-white"
          aria-label="Close Window"
        >
          ✕
        </button>
      </div>

      {/* Menu Bar */}
      <div className="bg-menu-bar py-1 px-3 border-b border-window-border select-none flex gap-1 flex-shrink-0 text-sm text-menu-bar-text items-center">
        <MenuBarItem
          label="File"
          isOpen={isFileMenuOpen}
          setIsOpen={setFileMenuOpen}
        >
          {!isParametersPanelOpen && (
            <DropdownMenuItem
              onClick={() => {
                onToggleParameters();
                closeAllMenus();
              }}
            >
              Parameters
            </DropdownMenuItem>
          )}
          {isAppOpen && (
            <DropdownMenuItem
              onClick={() => {
                onExitToDesktop();
                closeAllMenus();
              }}
            >
              Exit to Desktop
            </DropdownMenuItem>
          )}
        </MenuBarItem>
        <MenuBarItem
          label="Help"
          isOpen={isHelpMenuOpen}
          setIsOpen={setHelpMenuOpen}
        >
          <DropdownMenuItem
            onClick={() => {
              onOpenAbout();
              closeAllMenus();
            }}
          >
            About Roseglass
          </DropdownMenuItem>
        </MenuBarItem>
      </div>

      {/* Content */}
      <div className="flex-grow overflow-y-auto">{children}</div>

      {/* About Modal */}
      {isAboutModalOpen && (
        <div
          className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onCloseAbout}
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-title"
        >
          <div
            className="bg-window border border-window-border rounded-lg shadow-xl p-6 w-80 text-center flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="about-title"
              className="text-2xl font-bold text-title-bar-text"
              style={{
                color: 'var(--text-color)',
                backgroundColor: 'transparent',
              }}
            >
              Roseglass
            </h2>
            <p className="text-text">Version {version}</p>
            <p className="text-text text-sm">
              A dynamic desktop simulation powered by the Gemini API.
            </p>
            <button
              onClick={onCloseAbout}
              className="llm-button mt-4"
              aria-label="Close About dialog"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
