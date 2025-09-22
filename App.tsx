/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {GeneratedContent} from './components/GeneratedContent';
import {Icon} from './components/Icon';
import {ParametersPanel} from './components/ParametersPanel';
import {Window} from './components/Window';
import {APP_DEFINITIONS_CONFIG, INITIAL_MAX_HISTORY_LENGTH} from './constants';
import {interpretVoiceCommand, streamAppContent} from './services/geminiService';
import {AppDefinition, InteractionData, Theme, ThemeSet} from './types';

const VERSION = '20250812.2';

const hackerThemeImage =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABAAAAAMACAYAAACuAmP8AAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAEAKADAAQAAAABAAADAAAAAAAAAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGI8VERMoFRwWGBseGBwaHiQfHiAlJyAnJiw+JjI+JP/2wBDAQYGBgcGBw8HEQgKDBoVERoRERkcHBweHRoSERoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGv/AABEIBAAAZAMBEQACEQEDEQH/xAGiAAABBQEBAQEBAQAAAAAAAAAAAQIDBAUGBwgJCgsQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1VWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1VWV1hZWmNkZWZnaGlqc3R1dnd4eXqCg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2dri4+Tl5ufo6ery8/T19vf4+fr/2gAMAwEAAhEDEQA/APxOooooAmii4qxHHioIuKsRrQA8LUgWo1p4FAEgFSKKjUVIBQA4ClApBSigB1LSUtIAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACii-h/';

// Theme definitions
const initialThemes: ThemeSet = {
  hacker: {
    '--desktop-bg-color': '#000000',
    '--desktop-bg-image': `url("${hackerThemeImage}")`,
    '--window-bg-color': 'rgba(10, 20, 10, 0.75)',
    '--window-border-color': '#00FF00',
    '--title-bar-bg-color': 'rgba(10, 10, 10, 0.9)',
    '--title-bar-text-color': '#00FF00',
    '--menu-bar-bg-color': 'rgba(15, 15, 15, 0.8)',
    '--menu-bar-text-color': '#00FF00',
    '--menu-item-hover-color': '#005500',
    '--content-bg-color': '#050505',
    '--text-color': '#00FF00',
    '--button-bg-color': '#003300',
    '--button-text-color': '#00FF00',
    '--button-hover-bg-color': '#005500',
    '--input-bg-color': '#111111',
    '--input-border-color': '#00FF00',
    '--input-text-color': '#00FF00',
    '--icon-hover-bg-color': 'rgba(0, 255, 0, 0.1)',
    '--font-family': "'Courier New', Courier, monospace",
  },
  default: {
    '--desktop-bg-color': '#ffffff',
    '--desktop-bg-image': 'none',
    '--window-bg-color': 'rgba(240, 240, 240, 0.85)',
    '--window-border-color': '#cccccc',
    '--title-bar-bg-color': 'rgba(220, 220, 220, 0.9)',
    '--title-bar-text-color': '#333333',
    '--menu-bar-bg-color': 'rgba(230, 230, 230, 0.8)',
    '--menu-bar-text-color': '#333333',
    '--menu-item-hover-color': '#0078d7',
    '--content-bg-color': '#ffffff',
    '--text-color': '#222222',
    '--button-bg-color': '#0078d7',
    '--button-text-color': '#ffffff',
    '--button-hover-bg-color': '#005a9e',
    '--input-bg-color': '#ffffff',
    '--input-border-color': '#767676',
    '--input-text-color': '#222222',
    '--icon-hover-bg-color': 'rgba(0, 0, 0, 0.05)',
    '--font-family': 'sans-serif',
  },
};

export const App = () => {
  // Application State
  const [activeApp, setActiveApp] = useState<AppDefinition | null>(null);
  const [isAppViewVisible, setIsAppViewVisible] = useState<boolean>(false);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Interaction History State
  const [interactionHistory, setInteractionHistory] = useState<
    InteractionData[]
  >([]);
  const [isStatefulnessEnabled, setIsStatefulnessEnabled] =
    useState<boolean>(true);
  const [maxHistoryLength, setMaxHistoryLength] = useState<number>(
    INITIAL_MAX_HISTORY_LENGTH,
  );

  // Panel/Modal State
  const [isParametersOpen, setIsParametersOpen] = useState<boolean>(false);

  // Theming and About Modal state
  const [themes, setThemes] = useState<ThemeSet>(initialThemes);
  const [theme, setTheme] = useState<string>('hacker');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);

  // Voice control state
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isProcessingVoiceCommand, setIsProcessingVoiceCommand] =
    useState<boolean>(false);
  const [isVoiceSupported, setIsVoiceSupported] = useState<boolean>(false);
  const recognitionRef = useRef<any | null>(null);

  // New appearance state
  const [desktopBgImage, setDesktopBgImage] = useState<string>('none');
  const [glassEffectIntensity, setGlassEffectIntensity] = useState<number>(10);

  // Apply theme and background styles to the root element
  useEffect(() => {
    const root = document.documentElement;
    const currentTheme = themes[theme] || themes.default;

    Object.entries(currentTheme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.setProperty('--desktop-bg-image', `url("${desktopBgImage}")`);
  }, [theme, themes, desktopBgImage]);

  const handleInteraction = useCallback(
    async (interaction: InteractionData) => {
      setIsLoading(true);
      setHtmlContent('');

      // Create a new history array with the latest interaction at the front
      const newHistory = [interaction, ...interactionHistory];

      // Trim history based on current settings
      const trimmedHistory = isStatefulnessEnabled
        ? newHistory.slice(0, maxHistoryLength)
        : [interaction];

      setInteractionHistory(trimmedHistory);

      try {
        let accumulatedContent = '';
        for await (const chunk of streamAppContent(
          trimmedHistory,
          maxHistoryLength,
          theme,
        )) {
          accumulatedContent += chunk;
          setHtmlContent(accumulatedContent);
        }
      } catch (error) {
        console.error('Error streaming data:', error);
        setHtmlContent(
          '<p class="llm-text">Sorry, something went wrong. Please check the console for details.</p>',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [interactionHistory, isStatefulnessEnabled, maxHistoryLength, theme],
  );

  const handleAppOpen = useCallback(
    (app: AppDefinition) => {
      setActiveApp(app);
      setIsAppViewVisible(true);
      handleInteraction({
        id: app.id,
        type: 'app_open',
        elementType: 'icon',
        elementText: app.name,
        appContext: app.id,
      });
    },
    [handleInteraction],
  );

  const handleCloseAppView = useCallback(() => {
    setIsAppViewVisible(false);
    setActiveApp(null);
    setHtmlContent('');
    // Optionally clear history when returning to desktop
    // setInteractionHistory([]);
  }, []);

  const handleToggleParametersPanel = useCallback(() => {
    setIsParametersOpen((prev) => !prev);
    // If we're opening it, clear the main content area
    if (!isParametersOpen) {
      setHtmlContent('');
      setActiveApp({
        id: 'parameters',
        name: 'Parameters',
        icon: '',
        color: '',
      });
    } else {
      // If closing, go back to desktop
      handleCloseAppView();
    }
  }, [isParametersOpen, handleCloseAppView]);

  // A master close function that handles all "close" scenarios
  const handleMasterClose = useCallback(() => {
    if (isParametersOpen) {
      handleToggleParametersPanel();
    } else {
      handleCloseAppView();
    }
  }, [isParametersOpen, handleToggleParametersPanel, handleCloseAppView]);

  const handleVoiceCommand = useCallback(
    async (transcript: string) => {
      if (!transcript) {
        setIsProcessingVoiceCommand(false);
        return;
      }
      setIsProcessingVoiceCommand(true);
      try {
        const command = await interpretVoiceCommand(transcript);
        switch (command.action) {
          case 'open_app':
            const appToOpen = APP_DEFINITIONS_CONFIG.find(
              (app) => app.id === command.appId,
            );
            if (appToOpen) {
              handleAppOpen(appToOpen);
            } else {
              alert(`Could not find an app for the command: "${transcript}"`);
            }
            break;
          case 'close_app':
            handleMasterClose(); // This handles closing whatever is open
            break;
          case 'go_to_desktop':
            handleCloseAppView();
            break;
          case 'open_parameters':
            // Don't open if already open
            if (!isParametersOpen) {
              handleToggleParametersPanel();
            }
            break;
          case 'unknown_command':
            alert(`Sorry, I didn't understand the command: "${transcript}"`);
            break;
          default:
            alert(`Received an unknown action: ${command.action}`);
            break;
        }
      } catch (e) {
        console.error('Failed to handle voice command:', e);
        alert('There was an error processing your voice command.');
      } finally {
        setIsProcessingVoiceCommand(false);
      }
    },
    [
      handleAppOpen,
      handleMasterClose,
      handleCloseAppView,
      isParametersOpen,
      handleToggleParametersPanel,
    ],
  );

  // Ref to hold the latest handleVoiceCommand function to avoid stale closures
  const handleVoiceCommandRef = useRef(handleVoiceCommand);
  useEffect(() => {
    handleVoiceCommandRef.current = handleVoiceCommand;
  }, [handleVoiceCommand]);

  // Effect for setting up Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setIsVoiceSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // Use the ref to ensure the latest handler is called
        handleVoiceCommandRef.current(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        setIsProcessingVoiceCommand(false); // Ensure processing state is reset on error
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsVoiceSupported(false);
      console.warn('Speech Recognition not supported by this browser.');
    }
  }, []); // Run this effect only once on mount

  const getWindowTitle = () => {
    const brandName = 'Roseglass';
    if (isAboutModalOpen) return `About ${brandName}`;
    if (isParametersOpen) return `Parameters - ${brandName}`;
    if (activeApp) return `${activeApp.name} - ${brandName}`;
    return `${brandName} ${VERSION}`;
  };

  const toggleListening = () => {
    if (!isVoiceSupported) return;

    if (isListening) {
      recognitionRef.current?.stop();
    } else if (!isProcessingVoiceCommand) {
      recognitionRef.current?.start();
    }
  };

  const handleSetDesktopBg = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setDesktopBgImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleImportTheme = (file: File) => {
    if (!file.name.endsWith('manifest.json')) {
      alert('Please select a valid Chrome theme manifest.json file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (typeof e.target?.result !== 'string') throw new Error();
        const manifest = JSON.parse(e.target.result);
        if (manifest.theme && manifest.name) {
          const themeData = manifest.theme;
          const newTheme: Theme = {
            '--desktop-bg-color': themeData.colors?.frame
              ? `rgb(${themeData.colors.frame.join(',')})`
              : themes.default['--desktop-bg-color'],
            '--window-bg-color': themeData.colors?.toolbar
              ? `rgba(${themeData.colors.toolbar.join(',')}, 0.85)`
              : themes.default['--window-bg-color'],
            '--title-bar-text-color': themeData.colors?.bookmark_text
              ? `rgb(${themeData.colors.bookmark_text.join(',')})`
              : themes.default['--title-bar-text-color'],
            '--text-color': themeData.colors?.tab_text
              ? `rgb(${themeData.colors.tab_text.join(',')})`
              : themes.default['--text-color'],
            '--button-bg-color': themeData.colors?.button_background
              ? `rgb(${themeData.colors.button_background.join(',')})`
              : themes.default['--button-bg-color'],
            '--font-family': 'sans-serif',
            '--desktop-bg-image': 'none',
            '--window-border-color': '#cccccc',
            '--title-bar-bg-color': 'rgba(220, 220, 220, 0.9)',
            '--menu-bar-bg-color': 'rgba(230, 230, 230, 0.8)',
            '--menu-bar-text-color': '#333333',
            '--menu-item-hover-color': '#0078d7',
            '--content-bg-color': '#ffffff',
            '--button-text-color': '#ffffff',
            '--button-hover-bg-color': '#005a9e',
            '--input-bg-color': '#ffffff',
            '--input-border-color': '#767676',
            '--input-text-color': '#222222',
            '--icon-hover-bg-color': 'rgba(0, 0, 0, 0.05)',
          };
          const themeId = manifest.name.toLowerCase().replace(/\s+/g, '_');
          setThemes((prev) => ({...prev, [themeId]: newTheme}));
          setTheme(themeId);
          alert(`Theme "${manifest.name}" imported successfully!`);
        } else {
          alert('Invalid manifest.json: missing theme or name.');
        }
      } catch (err) {
        alert('Failed to parse manifest.json.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const isDesktop = !isAppViewVisible && !isParametersOpen;

  return (
    <div
      className="desktop-bg w-full h-screen bg-cover bg-center font-sans"
      style={{
        backgroundColor: 'var(--desktop-bg-color)',
        backgroundImage: `var(--desktop-bg-image)`,
        fontFamily: 'var(--font-family)',
      }}
    >
      {isDesktop && (
        <div className="w-full h-full flex flex-wrap content-start p-4">
          {APP_DEFINITIONS_CONFIG.map((app) => (
            <Icon key={app.id} app={app} onInteract={() => handleAppOpen(app)} />
          ))}
        </div>
      )}

      {(isAppViewVisible || isParametersOpen) && (
        <div className="w-full h-full flex items-center justify-center p-4">
          <Window
            title={getWindowTitle()}
            onClose={handleMasterClose}
            isAppOpen={isAppViewVisible && !isParametersOpen}
            onToggleParameters={handleToggleParametersPanel}
            onExitToDesktop={handleCloseAppView}
            isParametersPanelOpen={isParametersOpen}
            isAboutModalOpen={isAboutModalOpen}
            onOpenAbout={() => setIsAboutModalOpen(true)}
            onCloseAbout={() => setIsAboutModalOpen(false)}
            isListening={isListening}
            isProcessingVoiceCommand={isProcessingVoiceCommand}
            onToggleListening={toggleListening}
            isVoiceSupported={isVoiceSupported}
            version={VERSION}
            glassEffectIntensity={glassEffectIntensity}
          >
            {isParametersOpen ? (
              <ParametersPanel
                currentLength={maxHistoryLength}
                onUpdateHistoryLength={setMaxHistoryLength}
                onClosePanel={handleToggleParametersPanel}
                isStatefulnessEnabled={isStatefulnessEnabled}
                onSetStatefulness={setIsStatefulnessEnabled}
                onSetDesktopBg={handleSetDesktopBg}
                onImportTheme={handleImportTheme}
                glassEffectIntensity={glassEffectIntensity}
                onSetGlassEffectIntensity={setGlassEffectIntensity}
              />
            ) : (
              <GeneratedContent
                htmlContent={htmlContent}
                onInteract={handleInteraction}
                appContext={activeApp?.id || null}
                isLoading={isLoading}
              />
            )}
          </Window>
        </div>
      )}
    </div>
  );
};
