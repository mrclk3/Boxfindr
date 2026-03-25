function unique(values: string[]) {
    return [...new Set(values.filter(Boolean))]
}

function normalizePublicApiUrl(rawUrl: string) {
    const value = rawUrl.trim()
    if (!value) return ''

    // Docker internal hostname is never reachable from the browser.
    if (value.includes('://api:')) {
        return '/api'
    }

    if (typeof window !== 'undefined') {
        // Prevent mixed-content when app runs on HTTPS.
        if (window.location.protocol === 'https:' && value.startsWith('http://')) {
            return '/api'
        }
    }

    return value
}

function getApiBaseCandidates() {
    if (process.env.NEXT_PUBLIC_API_URL) {
        const normalized = normalizePublicApiUrl(process.env.NEXT_PUBLIC_API_URL)
        return unique([
            normalized,
            '/api',
        ])
    }

    if (typeof window === 'undefined') {
        return ['/api', 'http://boxfindr.it-lab.cc:8200'] //geändert!!!!!
    }

    const host = window.location.hostname
    const protocol = window.location.protocol

    return unique([
        '/api',
        `${protocol}//${host}:8200`,
        `http://${host}:8200`,
        'http://127.0.0.1:8200',
        'http://localhost:8200',
    ])
}

const REQUEST_TIMEOUT_MS = 7000

export async function fetchClient(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const candidates = getApiBaseCandidates()
    let lastError: unknown = null

    for (const baseUrl of candidates) {
        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
        try {
            const response = await fetch(`${baseUrl}${endpoint}`, {
                ...options,
                headers,
                signal: options.signal ?? controller.signal,
            });

            // Try next candidate if this base URL clearly does not host the API.
            if (response.status === 404 && baseUrl === '/api') {
                continue
            }

            if (response.status === 401) {
                // Redirect to login if unauthorized
                // window.location.href = '/login';
            }

            return response;
        } catch (error) {
            lastError = error
        } finally {
            window.clearTimeout(timeoutId)
        }
    }

    if (lastError) {
        throw lastError
    }

    throw new Error('API request failed')
}
