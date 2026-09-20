/* Zelo — login e cadastro conectados à API */
const root = document.documentElement;
const body = document.body;
let fontScale = 1;
const $ = (s) => document.querySelector(s);

$('#increaseFont')?.addEventListener('click', () => {
  if (fontScale < 1.3) { fontScale = +(fontScale + .1).toFixed(1); root.style.setProperty('--font-scale', fontScale); }
});
$('#decreaseFont')?.addEventListener('click', () => {
  if (fontScale > .8) { fontScale = +(fontScale - .1).toFixed(1); root.style.setProperty('--font-scale', fontScale); }
});
$('#highContrast')?.addEventListener('click', () => body.classList.toggle('high-contrast'));
$('#readPage')?.addEventListener('click', () => {
  if (!('speechSynthesis' in window)) return alert('Seu navegador não oferece leitura de texto.');
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(document.querySelector('main')?.innerText || 'Zelo');
  u.lang = 'pt-BR'; u.rate = .9; speechSynthesis.speak(u);
});

$('#showPassword')?.addEventListener('click', () => {
  const input = $('#password');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
});

function showLoginError(message) {
  const box = $('#loginMessage');
  if (box) { box.textContent = message; box.hidden = !message; }
}

function destinationFor(tipo) {
  if (tipo === 'paciente') return 'paciente.html';
  if (tipo === 'profissional') return 'profissional.html';
  if (tipo === 'cuidador' || tipo === 'responsavel') return 'cuidador.html';
  return 'perfis.html';
}

$('#loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#email');
  const pass = $('#password');
  $('#emailError').textContent = '';
  $('#passwordError').textContent = '';
  showLoginError('');

  let ok = true;
  if (!email.value.trim()) { $('#emailError').textContent = 'Digite seu e-mail.'; ok = false; }
  if (!pass.value) { $('#passwordError').textContent = 'Digite sua senha.'; ok = false; }
  if (!ok) return;

  const button = e.submitter || $('#loginSubmit');
  if (button) { button.disabled = true; button.dataset.oldText = button.textContent; button.textContent = 'Entrando...'; }

  try {
    const usuario = await ZeloAPI.login(email.value.trim(), pass.value);
    window.location.href = destinationFor(usuario.tipo);
  } catch (error) {
    showLoginError(error.message || 'Não foi possível entrar.');
  } finally {
    if (button) { button.disabled = false; button.textContent = button.dataset.oldText || 'Entrar'; }
  }
});

const dialog = $('#roleDialog');
$('#createAccount')?.addEventListener('click', (e) => { e.preventDefault(); dialog?.showModal(); });
$('#closeDialog')?.addEventListener('click', () => dialog?.close());

$('#registerForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const data = Object.fromEntries(new FormData(form).entries());
  const message = $('#registerMessage');
  if (message) message.hidden = true;

  if (data.senha !== data.confirmarSenha) {
    if (message) { message.textContent = 'As senhas não coincidem.'; message.hidden = false; }
    return;
  }
  if (data.senha.length < 8) {
    if (message) { message.textContent = 'A senha precisa ter pelo menos 8 caracteres.'; message.hidden = false; }
    return;
  }

  if (button) { button.disabled = true; button.textContent = 'Criando...'; }
  try {
    await ZeloAPI.register({ nome: data.nome, email: data.email, senha: data.senha, tipo: data.tipo });
    dialog?.close();
    form.reset();
    const loginEmail = $('#email');
    if (loginEmail) loginEmail.value = data.email;
    showLoginError('Conta criada. Agora entre com seu e-mail e senha.');
  } catch (error) {
    if (message) { message.textContent = error.message || 'Não foi possível criar a conta.'; message.hidden = false; }
  } finally {
    if (button) { button.disabled = false; button.textContent = 'Criar conta'; }
  }
});

$('#govLogin')?.addEventListener('click', () => {
  alert('A integração com GOV.BR será adicionada quando houver credenciais e ambiente oficial. Por enquanto, use seu cadastro Zelo.');
});

$('#forgotPassword')?.addEventListener('click', (e) => {
  e.preventDefault();
  alert('A recuperação de senha será conectada ao backend em uma próxima etapa.');
});
