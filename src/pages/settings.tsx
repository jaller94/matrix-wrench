import { createContext, FC, FormEventHandler, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Identity, NetworkLog } from "../app";
import { AppHeader } from "../components/header";
import React from "react";
import { HighUpLabelInput } from "../components/inputs";

export const Settings = createContext<{
    customTheme: string
    externalMatrixUrl: string,
    identities: Identity[],
    showNetworkLog: boolean,
    theme: string,
    setCustomTheme: (value: string) => void,
    setExternalMatrixUrl: (value: string) => void,
    setIdentities: (callback: (identities: Identity[]) => Identity[]) => void,
    setShowNetworkLog: (value: boolean) => void,
    setTheme: (value: string) => void,
}>({
    customTheme: '{}',
    externalMatrixUrl: 'https://matrix.to/#/',
    identities: [],
    showNetworkLog: true,
    theme: 'auto',
    setCustomTheme: () => {},
    setExternalMatrixUrl: () => {},
    setIdentities: () => {},
    setShowNetworkLog: () => {},
    setTheme: () => {},
});

const DEFAULT_THEME = {
    'btn-bg-color': '#e9e9ed',
    'btn-bg-hover-color': '#c9c9cb',
    'btn-text-color': '#000',
    'btn-border-color': '#000',
    'main-bg-color': '#141A13',
    'main-bg-hover-color': '#1c261b',
    'main-bg-hover-hover-color': '#273525',
    'main-border-color': 'grey',
    'main-text-color': '#cdc',
    'header-bg-color': '#1c261b',
    'primary-btn-bg-color': '#642eba',
    'primary-btn-bg-hover-color': '#311067',
    'primary-btn-border-color': '#854be0',
    'primary-btn-text-color': '#fff',
    'input-bg-color': '#000',
    'input-label-color': 'lightblue',
    'input-border-color': '#888',
    'input-text-color': '#fff',
    'input-required-color': 'darkred',
    'input-error-color': '#000',
    'link-color': '#66b3ff',
};

let IDENTITIES: Identity[] = [];
try {
    const identities = JSON.parse(localStorage.getItem('identities'));
    if (!Array.isArray(identities)) {
        throw Error(`Expected an array, got ${typeof identities}`);
    }
    IDENTITIES = identities.map(identity => ({
        ...identity,
        rememberLogin: true,
    }));
} catch (error) {
    console.warn('No identities loaded from localStorage.', error);
}
let SETTINGS = {};
try {
    const settings = JSON.parse(localStorage.getItem('settings'));
    if (typeof settings !== 'object') {
        throw Error(`Expected an object, got ${typeof settings}`);
    }
    SETTINGS = settings;
} catch (error) {
    console.warn('No settings loaded from localStorage.', error);
}

const CustomThemeEditor: FC = () => {
    const { customTheme, setCustomTheme } = useContext(Settings);

    return <>
        <textarea
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={customTheme}
            onChange={useCallback(({target}) => setCustomTheme(target.value), [])}
        />
        <div className="card">
            <form onSubmit={useCallback(() => {return false}, [])}>
                <h3>Component showcase</h3>
                <HighUpLabelInput
                    label="Required input"
                    required
                    defaultValue="Some text"
                />
                <HighUpLabelInput
                    label="Input with error"
                    pattern="correct"
                    defaultValue="incorrect"
                />
                <button
                    type="button"
                >Regular button</button>
                <button
                    className="primary"
                    type="button"
                >Primary button</button>
            </form>
        </div>
    </>;
};

export const saveIdentitiesToLocalStorage = (identities: Identity[]) => {
    if (!localStorage) return;
    // Filter out identities where the user said to not remember them.
    const identitiesToStore = identities.filter(identity => identity.rememberLogin).map(identity => {
        const copyOfIdentity = {...identity};
        delete copyOfIdentity.rememberLogin;
        return copyOfIdentity;
    });
    localStorage.setItem('identities', JSON.stringify(identitiesToStore));
};

const saveSettingsToLocalStorage = (settings: object) => {
    if (!localStorage) return;
    const settingsToStore = {
        ...settings,
        identities: undefined,
    };
    localStorage.setItem('settings', JSON.stringify(settingsToStore));
};

export const SettingsPage: FC = () => {
    const {
        externalMatrixUrl, setExternalMatrixUrl,
        showNetworkLog, setShowNetworkLog,
        theme, setTheme,
    } = useContext(Settings);

    const ignoreSubmit: FormEventHandler<HTMLFormElement> = useCallback((event) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    return <>
        <AppHeader
            backUrl="#"
        >Settings</AppHeader>
        <main>
            <form onSubmit={ignoreSubmit}>
                <HighUpLabelInput
                    label="Prefix for external Matrix links"
                    name="external_matrix_links"
                    value={externalMatrixUrl}
                    onInput={useCallback(({target}) => setExternalMatrixUrl(target.value), [setExternalMatrixUrl])}
                />
                <ul className="checkbox-list">
                    <li><label>
                        <input
                            name="show_network_log"
                            checked={showNetworkLog}
                            type="checkbox"
                            onChange={useCallback(({target}) => setShowNetworkLog(target.checked), [setShowNetworkLog])}
                        />
                        Show network log
                    </label></li>
                </ul>
                <h3>Theme</h3>
                <ul className="checkbox-list">
                    {['auto', 'light', 'dark', 'custom'].map(themeKey => (
                        <li key={themeKey}><label>
                            <input
                                checked={themeKey === theme}
                                name="theme"
                                type="radio"
                                onChange={useCallback(() => setTheme(themeKey), [setTheme])}
                            />
                            {themeKey}
                        </label></li>
                    ))}
                </ul>
                {theme === 'custom' && (
                    <CustomThemeEditor />
                )}
            </form>
        </main>
        <NetworkLog />
    </>;
}

export const SettingsProvider: FC<PropsWithChildren> = ({children}) => {
    const [state, setState] = useState({
        customTheme: JSON.stringify(DEFAULT_THEME, undefined, 2),
        externalMatrixUrl: 'https://matrix.to/#/',
        identities: IDENTITIES,
        showNetworkLog: true,
        theme: 'auto',
        ...SETTINGS,
    });

    const functions = useMemo(() => ({
        setCustomTheme: (customTheme: string) => {
            setState(state => ({
                ...state,
                customTheme,
            }));
        },
        setExternalMatrixUrl: (externalMatrixUrl: string) => {
            setState(state => ({
                ...state,
                externalMatrixUrl,
            }));
        },
        setIdentities: (callback: (identities: Identity[]) => Identity[]) => {
            setState(state => ({
                ...state,
                identities: callback(state.identities),
            }));
        },
        setShowNetworkLog: (showNetworkLog: boolean) => {
            setState(state => ({
                ...state,
                showNetworkLog,
            }));
        },
        setTheme: (theme: string) => {
            setState(state => ({
                ...state,
                theme,
            }));
        },
    }), []);

    useEffect(() => {
        saveSettingsToLocalStorage(state);
    }, [state.customTheme, state.externalMatrixUrl, state.showNetworkLog, state.theme]);

    return (
        <Settings.Provider value={{
            ...state,
            ...functions,
        }}>
            {children}
        </Settings.Provider>
    );
};

export const ThemeSetter: FC = () => {
    const { customTheme, theme } = useContext(Settings);

    useEffect(() => {
        const html = document.querySelector('html');
        if (!html) {
            return;
        }
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
        } else if (theme === 'dark') {
            html.setAttribute('data-theme', 'dark');
        } else if (theme === 'custom') {
            html.setAttribute('data-theme', 'custom');
        } else {
            const systemSettingDark = window.matchMedia('(prefers-color-scheme: dark)');
            html.setAttribute('data-theme', systemSettingDark.matches ? 'dark' : 'light');

            // Listen to changes of the browser setting
            const autoChange = (event: MediaQueryListEvent) => {
                html.setAttribute('data-theme', event.matches ? 'dark' : 'light');
            }
            systemSettingDark.addEventListener('change', autoChange);
            return () => {
                systemSettingDark.removeEventListener('change', autoChange);
            }
        }
    }, [theme]);

    const customThemeCSS = useMemo(() => {
        try {
            const parsedCustomTheme = JSON.parse(customTheme);
            let css = '';
            for (const [key, defaultValue] of Object.entries(DEFAULT_THEME)) {
                css += `--${key}: ${parsedCustomTheme[key] ?? defaultValue}; `;
            }
            return `[data-theme="custom"] { ${css}}`;
        } catch {
            return '';
        }
    }, [customTheme]);

    return <style>{customThemeCSS}</style>
}
