const STORAGE_KEY = 'ai-chat-resume-launcher.providers.v1';

const DEFAULT_PROVIDERS = [
  { name: 'ChatGPT', homeUrl: 'https://chat.openai.com/', lastUrl: '' },
  { name: 'Claude', homeUrl: 'https://claude.ai/', lastUrl: '' },
  { name: 'Gemini', homeUrl: 'https://gemini.google.com/', lastUrl: '' }
];

const providersRoot = document.querySelector('#providers');
const template = document.querySelector('#provider-template');

const addProviderButton = document.querySelector('#add-provider');
const exportDataButton = document.querySelector('#export-data');
const importFileInput = document.querySelector('#import-file');

let providers = loadProviders();
renderProviders();

addProviderButton.addEventListener('click', () => {
  providers.push({
    name: 'New Provider',
    homeUrl: 'https://',
    lastUrl: ''
  });
  saveProviders();
  renderProviders();
});

exportDataButton.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(providers, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ai-chat-resume-launcher-data.json';
  link.click();
  URL.revokeObjectURL(url);
});

importFileInput.addEventListener('change', async (event) => {
  const [file] = event.target.files ?? [];
  if (!file) return;

  try {
    const text = await file.text();
    const candidate = JSON.parse(text);

    if (!Array.isArray(candidate)) {
      throw new Error('Data must be an array of providers.');
    }

    providers = candidate
      .map((item) => ({
        name: safeString(item.name, 'New Provider'),
        homeUrl: safeString(item.homeUrl, 'https://'),
        lastUrl: safeString(item.lastUrl, '')
      }))
      .filter((item) => item.name.trim());

    saveProviders();
    renderProviders();
  } catch (error) {
    window.alert(`Import failed: ${error.message}`);
  } finally {
    importFileInput.value = '';
  }
});

function renderProviders() {
  providersRoot.innerHTML = '';

  providers.forEach((provider, index) => {
    const node = template.content.firstElementChild.cloneNode(true);

    const providerNameInput = node.querySelector('.provider-name');
    const homeUrlInput = node.querySelector('.home-url');
    const lastUrlInput = node.querySelector('.last-url');
    const saveButton = node.querySelector('.save-provider');
    const deleteButton = node.querySelector('.delete-provider');
    const openLastButton = node.querySelector('.open-last');
    const openHomeButton = node.querySelector('.open-home');
    const status = node.querySelector('.status');

    providerNameInput.value = provider.name;
    homeUrlInput.value = provider.homeUrl;
    lastUrlInput.value = provider.lastUrl;

    saveButton.addEventListener('click', () => {
      providers[index] = {
        name: safeString(providerNameInput.value, 'New Provider'),
        homeUrl: safeString(homeUrlInput.value, 'https://'),
        lastUrl: safeString(lastUrlInput.value, '')
      };
      saveProviders();
      status.textContent = 'Saved.';
    });

    deleteButton.addEventListener('click', () => {
      providers.splice(index, 1);
      saveProviders();
      renderProviders();
    });

    openLastButton.addEventListener('click', () => {
      const url = providers[index].lastUrl || providers[index].homeUrl;
      if (!looksLikeUrl(url)) {
        status.textContent = 'Please save a valid URL first.';
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      status.textContent = providers[index].lastUrl
        ? 'Opened last chat.'
        : 'No last chat set; opened home.';
    });

    openHomeButton.addEventListener('click', () => {
      const url = providers[index].homeUrl;
      if (!looksLikeUrl(url)) {
        status.textContent = 'Please save a valid home URL first.';
        return;
      }
      window.open(url, '_blank', 'noopener,noreferrer');
      status.textContent = 'Opened home.';
    });

    providersRoot.appendChild(node);
  });
}

function saveProviders() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(providers));
}

function loadProviders() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return [...DEFAULT_PROVIDERS];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [...DEFAULT_PROVIDERS];
    }

    return parsed.map((item) => ({
      name: safeString(item.name, 'New Provider'),
      homeUrl: safeString(item.homeUrl, 'https://'),
      lastUrl: safeString(item.lastUrl, '')
    }));
  } catch {
    return [...DEFAULT_PROVIDERS];
  }
}

function looksLikeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function safeString(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed || fallback;
}
