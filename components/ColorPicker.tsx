import React from 'react';
import { CheckIcon } from './icons';

interface ColorPickerProps {
  colors: string[];
  currentColor: string;
  onColorSelect: (color: string) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ colors, currentColor, onColorSelect }) => {
  return (
    <div className="bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-700">
      <div className="grid grid-cols-4 gap-2">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => onColorSelect(color)}
            className="w-8 h-8 rounded-full cursor-pointer border-2 flex items-center justify-center transition-transform transform hover:scale-110"
            style={{ 
                backgroundColor: color,
                borderColor: currentColor.toLowerCase() === color.toLowerCase() ? '#ffffff' : 'transparent'
             }}
             aria-label={`Select color ${color}`}
          >
            {currentColor.toLowerCase() === color.toLowerCase() && (
                <CheckIcon className="w-5 h-5 text-black/70" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;