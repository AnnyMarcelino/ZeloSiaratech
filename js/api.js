(function () {
  const API_BASE = '/api';
  const TOKEN_KEY = 'zelo_token';
  const USER_KEY = 'zelo_user';

  async function request(path, options = {}) {
    const headers = {
      ...(options.headers || {})
    };

    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json';
    }

    const token = sessionStorage.getItem(TOKEN_KEY);

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers
    });

    const text = await response.text();

    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      if (response.status === 401) {
        clearSession();
      }

      const error = new Error(
        data?.error || 'Não foi possível concluir a operação.'
      );

      error.status = response.status;
      error.data = data;

      throw error;
    }

    return data;
  }

  function saveSession(token, user) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.setItem('zeloRole', user.tipo);
  }

  function getUser() {
    try {
      return JSON.parse(
        sessionStorage.getItem(USER_KEY) || 'null'
      );
    } catch {
      return null;
    }
  }

  function isAuthenticated() {
    return !!sessionStorage.getItem(TOKEN_KEY);
  }

  function clearSession() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem('zeloRole');
  }

  async function login(email, senha) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        senha
      })
    });

    saveSession(data.token, data.usuario);

    return data.usuario;
  }

  async function register(data) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async function me() {
    const data = await request('/auth/me');

    if (data.usuario) {
      sessionStorage.setItem(
        USER_KEY,
        JSON.stringify(data.usuario)
      );
    }

    return data.usuario;
  }

  async function records(type, options = {}) {
    return request(`/${type}`, options);
  }

  async function list(type) {
    return request(`/${type}`);
  }

  async function create(type, data) {
    return request(`/${type}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async function update(type, id, data) {
    return request(`/${type}/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }

  async function remove(type, id) {
    return request(`/${type}/${id}`, {
      method: 'DELETE'
    });
  }

  async function patients() {
    return request('/patients');
  }

  async function links() {
    return request('/links');
  }

  async function requestLink(email) {
    return request('/links/request', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async function updateLink(id, status, permissoes) {
    return request(`/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        status,
        permissoes
      })
    });
  }

  async function preferences() {
    return request('/preferences');
  }

  async function savePreferences(data) {
    return request('/preferences', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async function notifications() {
    return request('/notifications');
  }

  function logout() {
    clearSession();
    location.href = 'login.html';
  }

  window.ZeloAPI = {
    request,
    login,
    register,
    me,
    records,
    list,
    create,
    update,
    remove,
    patients,
    links,
    requestLink,
    updateLink,
    preferences,
    savePreferences,
    notifications,
    saveSession,
    getUser,
    isAuthenticated,
    clearSession,
    logout
  };
})();
