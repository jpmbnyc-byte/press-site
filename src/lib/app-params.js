const isNode = typeof window === 'undefined';
const windowObj = isNode ? { localStorage: new Map() } : window;
const storage = windowObj.localStorage;

const toSnakeCase = (str) => {
	return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

/**
 * Public press site authorization: delete Base44 session tokens on boot.
 * Stale `base44_access_token` / `token` values caused an infinite login
 * redirect loop that left humanweather.vercel.app blank.
 */
const purgePublicAuthTokens = () => {
	if (isNode) return;
	try {
		storage.removeItem('base44_access_token');
		storage.removeItem('token');
	} catch {
		/* ignore quota / private mode */
	}
	try {
		const urlParams = new URLSearchParams(window.location.search);
		let changed = false;
		for (const key of ['access_token', 'clear_access_token']) {
			if (urlParams.has(key)) {
				urlParams.delete(key);
				changed = true;
			}
		}
		if (changed) {
			const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ''}${window.location.hash}`;
			window.history.replaceState({}, document.title, newUrl);
		}
	} catch {
		/* ignore */
	}
};

const getAppParamValue = (paramName, { defaultValue = undefined, removeFromUrl = false } = {}) => {
	if (isNode) {
		return defaultValue;
	}
	const storageKey = `base44_${toSnakeCase(paramName)}`;
	const urlParams = new URLSearchParams(window.location.search);
	const searchParam = urlParams.get(paramName);
	if (removeFromUrl) {
		urlParams.delete(paramName);
		const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""
			}${window.location.hash}`;
		window.history.replaceState({}, document.title, newUrl);
	}
	if (searchParam) {
		storage.setItem(storageKey, searchParam);
		return searchParam;
	}
	if (defaultValue) {
		storage.setItem(storageKey, defaultValue);
		return defaultValue;
	}
	const storedValue = storage.getItem(storageKey);
	if (storedValue) {
		return storedValue;
	}
	return null;
}

const getAppParams = () => {
	// Always purge before the SDK client is constructed.
	purgePublicAuthTokens();

	return {
		appId: getAppParamValue("app_id", { defaultValue: import.meta.env.VITE_BASE44_APP_ID }),
		// Force anonymous — this journal does not require login.
		token: null,
		fromUrl: getAppParamValue("from_url", { defaultValue: window.location.href }),
		functionsVersion: getAppParamValue("functions_version", { defaultValue: import.meta.env.VITE_BASE44_FUNCTIONS_VERSION }),
		appBaseUrl: getAppParamValue("app_base_url", { defaultValue: import.meta.env.VITE_BASE44_APP_BASE_URL }),
	}
}


export const appParams = {
	...getAppParams()
}
