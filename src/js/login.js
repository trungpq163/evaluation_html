// constant
const BASE_URL = "http://localhost:9000";
const ADMIN_ACCOUNT = "admin";
const ADMIN_PASSWORD = "admin123";
const STORAGE_KEY = "account";

const userStorage = localStorage.getItem(STORAGE_KEY);

// util
const saveStorage = ({ username }) => {
  const usernameCyrb53 = cyrb53(username);
  localStorage.setItem(STORAGE_KEY, usernameCyrb53);
};

const cyrb53 = function (str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

// if has localStorage then redirect to index page
if (userStorage === cyrb53(ADMIN_ACCOUNT).toString()) {
  window.location.href = `${BASE_URL}/index.html`;
}

//
const btnLogin = document.getElementById("btn-login");

btnLogin.onclick = () => {
  const usernameValue = document.getElementById("username").value;
  const passwordValue = document.getElementById("password").value;
  const pass =
    usernameValue === ADMIN_ACCOUNT && passwordValue === ADMIN_PASSWORD;
  if (!pass) {
    const required = document.getElementById("required");
    required.innerHTML = "Wrong username or password!";
  }

  if (pass) {
    saveStorage({ username: usernameValue });
    window.location.href = `${BASE_URL}/index.html`;
  }
};
