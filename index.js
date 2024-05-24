const fileUpload = document.createElement('input');
fileUpload.type = 'file';

function opensettings() {
  open('/settings.html', 'new-window', 'width=325,height=200');
}

async function getAPINote() {
  const res = await fetch('/api/note/' + localStorage.id, {
    method: 'GET',
    cache: 'no-cache'
  });
  if (!res.ok)
    return [false, ''];
  return [true, Buffer.from(await res.arrayBuffer()).toString('utf8')];
}

async function sendNewAPINote() {
  return (await fetch('/api/note', {
    method: 'PATCH',
    body: JSON.stringify({
      id: localStorage.id,
      value: noteArea.value
    })
  })).ok;
}

function saveLocal() {
  if (localStorage.noteValue === noteArea.value)
    return alert("There's nothing to save...");
  localStorage.noteValue = noteArea.value;
  return alert('Note saved!');
}

async function saveAPI() {
  const res = await getAPINote();
  if (!res[0]) {
    alert('ID no longer exists...');
    return switchBtn.click();
  }
  if (noteArea.value === res[1])
    return alert('There is nothing to save...');
  if (!(await sendNewAPINote()))
    return alert('Failed to save...');
  return alert('Note saved!');
}

function checkIDInput(e) {
  if (noteArea.value && noteArea.value.match(/^[-A-Za-z0-9]{0,}$/))
    settingsBtn.disabled = false;
  else settingsBtn.disabled = true;
}

function switchToLocal() {
  noteArea.disabled = true;
  saveBtn.disabled = true;
  switchBtn.disabled = true;
  settingsBtn.disabled = true;
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0s ease 0s';
    requestAnimationFrame(() => {
      noteArea.style.height = '';
      noteArea.placeholder = 'Type note here...';
      noteArea.value = localStorage.noteValue;
      noteArea.oninput = null;
      saveBtn.innerText = 'Save';
      saveBtn.onclick = saveLocal;
      switchBtn.innerText = 'Use API';
      switchBtn.onclick = switchToAPI;
      settingsBtn.innerText = 'Open settings';
      settingsBtn.onclick = opensettings;
      document.body.style.transition = '';
      requestAnimationFrame(() => {
        noteArea.disabled = false;
        saveBtn.disabled = false;
        switchBtn.disabled = false;
        settingsBtn.disabled = false;
        document.body.style.opacity = '';
      });
    });
  }, 1750);
}

async function validateIDExists() {
  return (await fetch('/api/id/' + noteArea.value, {
    method: 'GET'
  })).ok;
}

async function checkAndProceedToAPI() {
  if (!(await validateIDExists()))
    return alert('ID does not exist...');
  localStorage.id = noteArea.value;
  const res = await getAPINote();
  if (!res[0])
    return alert('Failed to get your API note...');
  noteArea.disabled = true;
  saveBtn.disabled = true;
  switchBtn.disabled = true;
  settingsBtn.disabled = true;
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0s ease 0s';
    requestAnimationFrame(async () => {
      noteArea.style.height = '';
      noteArea.placeholder = 'Type note here...';
      noteArea.value = res[1];
      noteArea.oninput = null;
      saveBtn.innerText = 'Save';
      saveBtn.onclick = saveAPI;
      switchBtn.innerText = 'Use Local';
      switchBtn.onclick = switchToLocal;
      settingsBtn.innerText = 'Open settings';
      settingsBtn.onclick = opensettings;
      document.body.style.transition = '';
      requestAnimationFrame(() => {
        noteArea.disabled = false;
        saveBtn.disabled = false;
        switchBtn.disabled = false;
        settingsBtn.disabled = false;
        document.body.style.opacity = '';
      });
    });
  }, 1750);
}

function createUUID() {
  return Math.round(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0') + '-' +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0') + '-' +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0') + '-' +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0') + '-' +
    Math.round(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0') +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0');
}

async function createID() {
  const uuid = createUUID();
  const res = (await fetch('/api/id', {
    method: 'POST',
    body: uuid
  })).ok;
  if (res)
    return uuid;
  return false;
}

async function createAndProceedToAPI() {
  const id = await createID();
  if (!id)
    return alert('Failed to create an ID...');
  localStorage.id = id;
  noteArea.disabled = true;
  saveBtn.disabled = true;
  switchBtn.disabled = true;
  settingsBtn.disabled = true;
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0s ease 0s';
    requestAnimationFrame(async () => {
      noteArea.style.height = '';
      noteArea.placeholder = 'Type note here...';
      noteArea.value = '';
      noteArea.oninput = null;
      saveBtn.innerText = 'Save';
      saveBtn.onclick = saveAPI;
      switchBtn.innerText = 'Use Local';
      switchBtn.onclick = switchToLocal;
      settingsBtn.innerText = 'Open settings';
      settingsBtn.onclick = opensettings;
      document.body.style.transition = '';
      requestAnimationFrame(() => {
        noteArea.disabled = false;
        saveBtn.disabled = false;
        switchBtn.disabled = false;
        settingsBtn.disabled = false;
        document.body.style.opacity = '';
      });
    });
  }, 1750);
}

function switchToUserIDPrompt() {
  noteArea.disabled = true;
  saveBtn.disabled = true;
  switchBtn.disabled = true;
  settingsBtn.disabled = true;
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0s ease 0s';
    requestAnimationFrame(() => {
      noteArea.style.height = '10%';
      noteArea.placeholder = 'Enter User ID here...';
      noteArea.value = '';
      noteArea.oninput = checkIDInput;
      saveBtn.innerText = 'Back';
      saveBtn.onclick = switchToLocal;
      switchBtn.innerText = 'Create New';
      switchBtn.onclick = createAndProceedToAPI;
      settingsBtn.innerText = 'Proceed To API';
      settingsBtn.onclick = checkAndProceedToAPI;
      document.body.style.transition = '';
      requestAnimationFrame(() => {
        noteArea.disabled = false;
        saveBtn.disabled = false;
        switchBtn.disabled = false;
        document.body.style.opacity = '';
      });
    });
  }, 1750);
}

async function switchToAPI() {
  if (!localStorage.id)
    return switchToUserIDPrompt();
  const res = await getAPINote();
  if (!res[0]) {
    delete localStorage.id;
    return switchToUserIDPrompt();
  }
  noteArea.disabled = true;
  saveBtn.disabled = true;
  switchBtn.disabled = true;
  settingsBtn.disabled = true;
  document.body.style.opacity = '0';
  setTimeout(() => {
    document.body.style.transition = 'opacity 0s ease 0s';
    requestAnimationFrame(async () => {
      noteArea.value = res[1];
      noteArea.oninput = null;
      saveBtn.innerText = 'Save';
      saveBtn.onclick = saveAPI;
      switchBtn.innerText = 'Use Local';
      switchBtn.onclick = switchToLocal;
      settingsBtn.innerText = 'Open settings';
      settingsBtn.onclick = opensettings;
      document.body.style.transition = '';
      requestAnimationFrame(() => {
        noteArea.disabled = false;
        saveBtn.disabled = false;
        switchBtn.disabled = false;
        settingsBtn.disabled = false;
        document.body.style.opacity = '';
      });
    });
  }, 1750);
}

function updateTheme(light) {
  if (light) {
    document.body.classList.remove('dark');
    noteArea.classList.remove('dark');
    saveBtn.classList.remove('dark');
    switchBtn.classList.remove('dark');
    settingsBtn.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
    noteArea.classList.add('dark');
    saveBtn.classList.add('dark');
    switchBtn.classList.add('dark');
    settingsBtn.classList.add('dark');
  }
}

matchMedia("(prefers-color-scheme: light)").onchange = e => {
  const opt = JSON.parse(localStorage.settings);
  if (opt.theme.system) {
    updateTheme(e.matches);
    opt.theme.value = e.matches;
    localStorage.settings = JSON.stringify(opt);
  }
}

addEventListener('storage', e => {
  if (e.key == 'settings') {
    const opt = JSON.parse(e.newValue);
    updateTheme(opt.theme.value);
    noteArea.style.whiteSpace = opt.wrap ? null : 'nowrap';
  }
});

addEventListener('DOMContentLoaded', () => {
  if (!localStorage.noteValue)
    localStorage.noteValue = '';
  else noteArea.value = localStorage.noteValue;
  if (!localStorage.settings)
    localStorage.settings = JSON.stringify({
      theme: {
        system: true,
        value: matchMedia("(prefers-color-scheme: light)").matches
      },
      wrap: false
    });
  {
    const opt = JSON.parse(localStorage.settings);
    if (opt.theme.system) {
      const theme = matchMedia("(prefers-color-scheme: light)").matches;
      if (opt.theme.value !== theme) {
        opt.theme.value = theme;
        localStorage.settings = JSON.stringify(opt);
      } else if (!opt.theme.value)
        updateTheme(false);
    } else if (!opt.theme.value)
      updateTheme(false);
    if (!opt.wrap)
      noteArea.style.whiteSpace = 'nowrap';
  }
  saveBtn.onclick = saveLocal;
  switchBtn.onclick = switchToAPI;
  settingsBtn.onclick = opensettings;
}, {
  once: true
});