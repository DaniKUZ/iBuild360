import React, { useState, useRef, useEffect } from 'react';
import './PhoneInput.css';

const COUNTRY_CODES = [
  { code: '+7', country: 'RU', name: 'Россия', flag: '🇷🇺', mask: '(999) 999-99-99' },
  { code: '+7', country: 'KZ', name: 'Казахстан', flag: '🇰🇿', mask: '(999) 999-99-99' },
  { code: '+375', country: 'BY', name: 'Беларусь', flag: '🇧🇾', mask: '(99) 999-99-99' },
  { code: '+380', country: 'UA', name: 'Украина', flag: '🇺🇦', mask: '(99) 999-99-99' },
  { code: '+1', country: 'US', name: 'США', flag: '🇺🇸', mask: '(999) 999-9999' },
  { code: '+44', country: 'GB', name: 'Великобритания', flag: '🇬🇧', mask: '9999 999999' },
  { code: '+49', country: 'DE', name: 'Германия', flag: '🇩🇪', mask: '999 99999999' },
  { code: '+33', country: 'FR', name: 'Франция', flag: '🇫🇷', mask: '9 99 99 99 99' },
  { code: '+39', country: 'IT', name: 'Италия', flag: '🇮🇹', mask: '999 999 9999' },
  { code: '+34', country: 'ES', name: 'Испания', flag: '🇪🇸', mask: '999 99 99 99' },
  { code: '+86', country: 'CN', name: 'Китай', flag: '🇨🇳', mask: '999 9999 9999' },
  { code: '+81', country: 'JP', name: 'Япония', flag: '🇯🇵', mask: '90-9999-9999' },
  { code: '+82', country: 'KR', name: 'Южная Корея', flag: '🇰🇷', mask: '99-9999-9999' },
  { code: '+91', country: 'IN', name: 'Индия', flag: '🇮🇳', mask: '99999 99999' }
];

const PhoneInput = ({ value, countryCode, onChange, error }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const selectedCountry = COUNTRY_CODES.find(country => country.code === countryCode) || COUNTRY_CODES[0];

  const filteredCountries = COUNTRY_CODES.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.includes(searchTerm) ||
    country.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const formatPhoneNumber = (phone, mask) => {
    const digits = phone.replace(/\D/g, '');
    let formatted = '';
    let digitIndex = 0;

    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
      if (mask[i] === '9') {
        formatted += digits[digitIndex];
        digitIndex++;
      } else {
        formatted += mask[i];
      }
    }

    return formatted;
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    const digits = inputValue.replace(/\D/g, '');
    
    // Ограничиваем количество цифр в зависимости от маски
    const maxDigits = selectedCountry.mask.replace(/\D/g, '').length;
    const limitedDigits = digits.slice(0, maxDigits);
    
    const formattedPhone = formatPhoneNumber(limitedDigits, selectedCountry.mask);
    onChange(formattedPhone, selectedCountry.code);
  };

  const handleCountrySelect = (country) => {
    onChange(value, country.code);
    setIsDropdownOpen(false);
    setSearchTerm('');
    
    // Фокусируемся на поле ввода телефона
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCountries.length > 0) {
        handleCountrySelect(filteredCountries[0]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <div className="phone-input-container">
      <div className={`phone-input-wrapper ${error ? 'error' : ''}`}>
        <div 
          className="country-selector"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          role="button"
          tabIndex={0}
          aria-label="Выбрать код страны"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsDropdownOpen(!isDropdownOpen);
            }
          }}
        >
          <span className="country-flag">{selectedCountry.flag}</span>
          <span className="country-code">{selectedCountry.code}</span>
          <svg 
            className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}
            width="12" 
            height="8" 
            viewBox="0 0 12 8"
            fill="none"
          >
            <path 
              d="M1 1L6 6L11 1" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="tel"
          className="phone-number-input"
          value={value}
          onChange={handlePhoneChange}
          placeholder={selectedCountry.mask.replace(/9/g, '0')}
          aria-label="Номер телефона"
        />

        {isDropdownOpen && (
          <div className="country-dropdown" ref={dropdownRef}>
            <div className="dropdown-search">
              <input
                type="text"
                className="search-input"
                placeholder="Поиск страны..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </div>
            
            <div className="countries-list">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <div
                    key={`${country.code}-${country.country}`}
                    className={`country-option ${
                      selectedCountry.code === country.code && selectedCountry.country === country.country 
                        ? 'selected' 
                        : ''
                    }`}
                    onClick={() => handleCountrySelect(country)}
                    role="option"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCountrySelect(country);
                      }
                    }}
                  >
                    <span className="country-flag">{country.flag}</span>
                    <span className="country-name">{country.name}</span>
                    <span className="country-code">{country.code}</span>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  Страна не найдена
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhoneInput; 