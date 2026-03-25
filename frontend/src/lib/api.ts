const API_URL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== 'undefined'
        ? `${window.location.protocol}//${window.location.hostname}:8200`
        : 'http://localhost:8200');

export async function fetchClient(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        // Redirect to login if unauthorized
        // window.location.href = '/login';
    }

    return response;
}
