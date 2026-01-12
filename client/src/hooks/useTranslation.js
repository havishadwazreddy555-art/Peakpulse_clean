import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import en from '../locales/en/translation.json';
import fr from '../locales/fr/translation.json';
import de from '../locales/de/translation.json';

const translations = { en, fr, de };

export function useTranslation() {
    const { user } = useAuth();
    const [lang, setLang] = useState('en');

    useEffect(() => {
        if (user && user.language) {
            setLang(user.language);
        }
    }, [user]);

    const t = (key) => {
        return translations[lang][key] || key;
    };

    return { t, lang };
}
