import { useRef, useState } from 'react';

export type AutocompleteOption = { id: string | number, name: string };
type Props = {
  options: AutocompleteOption[],
  placeholder?: string,
  value?: string | number,
  onSelect?: (id: string | number) => void
}

export function Autocomplete(props: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const ref = useRef<HTMLInputElement>(null);

  const selectedOption = props.options.find(opt => opt.id === props.value);
  const filteredOptions = props.options.filter(option =>
    option.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleSelect = (option: AutocompleteOption) => {
    setIsOpen(false);
    setInputValue('');
    if (props.onSelect) props.onSelect(option.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev < filteredOptions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev =>
        prev > 0 ? prev - 1 : filteredOptions.length - 1
      );
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  };

  return (
    <div className="relative">
      <input
        ref={ref}
        className="p-2 rounded-md w-full border border-input text-sm"
        placeholder={props.placeholder}
        value={isOpen ? inputValue : (selectedOption?.name || '')}
        onClick={() => {
          setIsOpen(true);
          setInputValue('');
        }}
        onChange={(e) => {
          setInputValue(e.target.value);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          setTimeout(() => {
            setIsOpen(false);
            setInputValue('');
          }, 150);
        }}
      />
      {isOpen && (
        <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto text-sm">
          {filteredOptions.map((option, index) => (
            <li
              key={option.id}
              className={`px-2 py-2 cursor-pointer text-left ${index === highlightedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              onClick={() => handleSelect(option)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              {option.name}
            </li>
          ))}
          {filteredOptions.length === 0 && (
            <li className="px-2 py-2 text-gray-500">No options found</li>
          )}
        </ul>
      )}
    </div>
  );
}


