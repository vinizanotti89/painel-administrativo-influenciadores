import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import '@/styles/theme/languageToggle.css';

const LanguageToggle = React.forwardRef(({ className = '', ...props }, ref) => {
    const { language, toggleLanguage } = useLanguage();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleLanguage}
            className={`language-toggle-button ${className}`}
            ref={ref}
            {...props}
        >
            {language === 'pt' ? (
                <>
                    <div className="flag-icon flag-us mr-2" aria-hidden="true"></div>
                    <span className="sr-only">Switch to English</span>
                </>
            ) : (
                <>
                    <div className="flag-icon flag-br mr-2" aria-hidden="true"></div>
                    <span className="sr-only">Mudar para Português</span>
                </>
            )}
        </Button>
    );
});

LanguageToggle.displayName = 'LanguageToggle';

export { LanguageToggle };