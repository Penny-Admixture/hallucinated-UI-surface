/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useState} from 'react';

interface ParametersPanelProps {
  currentLength: number;
  onUpdateHistoryLength: (newLength: number) => void;
  onClosePanel: () => void;
  isStatefulnessEnabled: boolean;
  onSetStatefulness: (enabled: boolean) => void;
  onSetDesktopBg: (file: File) => void;
  onImportTheme: (file: File) => void;
  glassEffectIntensity: number;
  onSetGlassEffectIntensity: (value: number) => void;
}

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  currentLength,
  onUpdateHistoryLength,
  onClosePanel,
  isStatefulnessEnabled,
  onSetStatefulness,
  onSetDesktopBg,
  onImportTheme,
  glassEffectIntensity,
  onSetGlassEffectIntensity,
}) => {
  const [localHistoryLengthInput, setLocalHistoryLengthInput] =
    useState<string>(currentLength.toString());
  const [localStatefulnessChecked, setLocalStatefulnessChecked] =
    useState<boolean>(isStatefulnessEnabled);

  useEffect(() => {
    setLocalHistoryLengthInput(currentLength.toString());
  }, [currentLength]);

  useEffect(() => {
    setLocalStatefulnessChecked(isStatefulnessEnabled);
  }, [isStatefulnessEnabled]);

  const handleHistoryLengthInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalHistoryLengthInput(event.target.value);
  };

  const handleStatefulnessCheckboxChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setLocalStatefulnessChecked(event.target.checked);
  };

  const handleApplyParameters = () => {
    // Apply history length
    const newLength = parseInt(localHistoryLengthInput, 10);
    if (!isNaN(newLength) && newLength >= 0 && newLength <= 10) {
      onUpdateHistoryLength(newLength);
    } else {
      alert('Please enter a number between 0 and 10 for history length.');
      setLocalHistoryLengthInput(currentLength.toString());
      return;
    }

    if (localStatefulnessChecked !== isStatefulnessEnabled) {
      onSetStatefulness(localStatefulnessChecked);
    }

    onClosePanel();
  };

  const handleClose = () => {
    setLocalHistoryLengthInput(currentLength.toString());
    setLocalStatefulnessChecked(isStatefulnessEnabled);
    onClosePanel();
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onSetDesktopBg(e.target.files[0]);
    }
  };
  const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportTheme(e.target.files[0]);
      e.target.value = ''; // Reset file input
    }
  };
  const handleIntensityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSetGlassEffectIntensity(Number(e.target.value));
  };

  return (
    <div className="p-6 bg-gray-50 h-full flex flex-col items-start pt-8 overflow-y-auto">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        General Settings
      </h3>
      {/* Interaction History Row */}
      <div className="w-full max-w-md mb-6">
        <div className="llm-row items-center">
          <label
            htmlFor="maxHistoryLengthInput"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0"
            style={{minWidth: '150px'}}
          >
            Max History Length:
          </label>
          <input
            type="number"
            id="maxHistoryLengthInput"
            value={localHistoryLengthInput}
            onChange={handleHistoryLengthInputChange}
            min="0"
            max="10"
            className="llm-input flex-grow"
            aria-describedby="historyLengthHelpText"
          />
        </div>
      </div>

      {/* Statefulness Row */}
      <div className="w-full max-w-md mb-4">
        <div className="llm-row items-center">
          <label
            htmlFor="statefulnessCheckbox"
            className="llm-label whitespace-nowrap mr-3 flex-shrink-0"
            style={{minWidth: '150px'}}
          >
            Enable Statefulness:
          </label>
          <input
            type="checkbox"
            id="statefulnessCheckbox"
            checked={localStatefulnessChecked}
            onChange={handleStatefulnessCheckboxChange}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
            aria-describedby="statefulnessHelpText"
          />
        </div>
      </div>

      <div className="w-full h-px bg-gray-300 my-6"></div>

      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Appearance Settings
      </h3>

      {/* Glass Effect Row */}
      <div className="w-full max-w-md mb-6">
        <div className="llm-row items-center">
          <label
            htmlFor="glassEffectSlider"
            className="llm-label whitespace-nowrap mr-3"
            style={{minWidth: '150px'}}
          >
            Glass Effect Intensity:
          </label>
          <input
            type="range"
            id="glassEffectSlider"
            min="0"
            max="20"
            value={glassEffectIntensity}
            onChange={handleIntensityChange}
            className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="ml-3 text-sm font-medium text-gray-600 w-8 text-center">
            {glassEffectIntensity}
          </span>
        </div>
      </div>

      {/* Desktop Background Row */}
      <div className="w-full max-w-md mb-6">
        <div className="llm-row items-center">
          <label
            htmlFor="desktopBgInput"
            className="llm-label whitespace-nowrap mr-3"
            style={{minWidth: '150px'}}
          >
            Desktop Background:
          </label>
          <input
            type="file"
            id="desktopBgInput"
            accept="image/*"
            onChange={handleBgChange}
            className="llm-input text-sm p-1"
          />
        </div>
      </div>

      {/* Theme Import Row */}
      <div className="w-full max-w-md mb-6">
        <div className="llm-row items-center">
          <label
            htmlFor="themeImportInput"
            className="llm-label whitespace-nowrap mr-3"
            style={{minWidth: '150px'}}
          >
            Import Chrome Theme:
          </label>
          <input
            type="file"
            id="themeImportInput"
            accept=".json,application/json"
            onChange={handleThemeChange}
            className="llm-input text-sm p-1"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 pl-[162px]">
          Select a theme's <code>manifest.json</code> file.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 w-full max-w-md flex justify-start gap-3">
        <button
          onClick={handleApplyParameters}
          className="llm-button"
          aria-label="Apply settings and close"
        >
          Apply & Close
        </button>
        <button
          onClick={handleClose}
          className="llm-button bg-gray-500 hover:bg-gray-600 active:bg-gray-700"
          aria-label="Close parameters panel without applying current changes"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
