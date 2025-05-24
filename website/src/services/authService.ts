const API_URL = import.meta.env.VITE_API_URL;

export async function getCaptcha() {
  const res = await fetch(`${API_URL}/api/auth/captcha`);
  return res.json();
}

export async function login(
  captchaId: string,
  captchaToken: string,
  location: {
    latitude: number;
    longitude: number;
  }
) {
  const res = await fetch(`${API_URL}/api/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ captchaId, captchaToken, location }),
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error);
  }
}

export async function getCurrentSession() {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error);
  }
  return res.json();
}

export async function logout() {
  await fetch(`${API_URL}/api/auth/revoke`, {
    method: "POST",
    credentials: "include",
  });
}
