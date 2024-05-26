const fileUpload = document.createElement('input');
fileUpload.type = 'file';

function openSettings() {
  open('/settings.html', 'new-window', 'width=450,height=200');
}

function getAPINote() {
  return fetch('/api/note/' + localStorage.id, {
    method: 'GET'
  }).then(res => {
    if (!res.ok)
      return [false, ''];
    return res.arrayBuffer().then(abuf => {
      return [true, Buffer.from(abuf).toString('utf8')];
    }, () => [true, '']);
  }, () => [false, '']);
}

async function sendNewAPINote() {
  return fetch('/api/note', {
    method: 'POST',
    body: JSON.stringify({
      id: localStorage.id,
      value: noteArea.value
    })
  }).then(res => res.ok, () => false);
}

function saveLocal() {
  if (localStorage.noteValue === noteArea.value)
    return alert("There's nothing to save...");
  localStorage.noteValue = noteArea.value;
  return alert('Note saved!');
}

function createUUID() {
  return Math.round(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0') + '-' +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0') + '-' +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0') + '-' +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0') + '-' +
    Math.round(Math.random() * 0xFFFFFFFF).toString(16).padStart(8, '0') +
    Math.round(Math.random() * 0xFFFF).toString(16).padStart(4, '0');
}

function createID() {
  const uuid = createUUID();
  return fetch('/api/id', {
    method: 'POST',
    body: uuid
  }).then(res => {
    if (res.ok)
      return uuid;
    return false;
  }, () => false);
}

async function saveAPI() {
  let res = await getAPINote();
  if (!res[0]) {
    delete localStorage.id;
    let res2 = await createID();
    if (!res2)
      return alert('Failed to save...');
    localStorage.id = res2;
    res = [true, ''];
  }
  if (noteArea.value === res[1])
    return alert('There is nothing to save...');
  if (!(await sendNewAPINote()))
    return alert('Failed to save...');
  return alert('Note saved!');
}

function checkIDInput() {
  if (noteArea.value && noteArea.value.match(/^[-A-Za-z0-9]{0,}$/))
    settingsBtn.disabled = false;
  else settingsBtn.disabled = true;
}

function recursiveAssign(target, source) {
  for (const key of Object.keys(source)) {
    const targetValue = target[key];
    const sourceValue = source[key];
    if (Array.isArray(sourceValue)) {
      if (!Array.isArray(targetValue))
        target[key] = [];
      recursiveAssign(target[key], sourceValue);
    } else if (typeof sourceValue === 'object' && sourceValue !== null) {
      if (typeof targetValue !== 'object' || targetValue === null)
        target[key] = {};
      recursiveAssign(target[key], sourceValue);
    } else target[key] = sourceValue;
  }
}

function transitionUI(data) {
  noteArea.disabled = true;
  saveBtn.disabled = true;
  switchBtn.disabled = true;
  settingsBtn.disabled = true;
  document.body.style.opacity = '0';
  setTimeout(() => {
    requestAnimationFrame(() => {
      recursiveAssign(noteArea, data.noteArea);
      recursiveAssign(saveBtn, data.saveBtn);
      recursiveAssign(switchBtn, data.switchBtn);
      recursiveAssign(settingsBtn, data.settingsBtn);
      requestAnimationFrame(() => {
        document.body.style.opacity = '';
      });
    });
  }, 1750);
}

function switchToLocal() {
  transitionUI({
    noteArea: {
      style: {
        height: ''
      },
      placeholder: 'Type note here...',
      value: localStorage.noteValue,
      oninput: null,
      disabled: false
    },
    saveBtn: {
      innerText: 'Save',
      onclick: saveLocal,
      disabled: false
    },
    switchBtn: {
      innerText: 'Use API',
      onclick: switchToAPI,
      disabled: false
    },
    settingsBtn: {
      innerText: 'Open settings',
      onclick: openSettings,
      disabled: false
    }
  });
}

function validateIDExists() {
  return fetch('/api/id/' + noteArea.value, {
    method: 'GET'
  }).then(res => res.ok, () => false);
}

async function checkAndProceedToAPI() {
  if (!(await validateIDExists()))
    return alert('ID does not exist...');
  localStorage.id = noteArea.value;
  const res = await getAPINote();
  if (!res[0])
    return alert('Failed to get your API note...');
  transitionUI({
    noteArea: {
      style: {
        height: ''
      },
      placeholder: 'Type note here...',
      value: res[1],
      oninput: null,
      disabled: false
    },
    saveBtn: {
      innerText: 'Save',
      onclick: saveAPI,
      disabled: false
    },
    switchBtn: {
      innerText: 'Use Local',
      onclick: switchToLocal,
      disabled: false
    },
    settingsBtn: {
      innerText: 'Open settings',
      onclick: openSettings,
      disabled: false
    }
  });
}

async function createAndProceedToAPI() {
  const id = await createID();
  if (!id)
    return alert('Failed to create an ID...');
  localStorage.id = id;
  transitionUI({
    noteArea: {
      style: {
        height: ''
      },
      placeholder: 'Type note here...',
      value: '',
      oninput: null,
      disabled: false
    },
    saveBtn: {
      innerText: 'Save',
      onclick: saveAPI,
      disabled: false
    },
    switchBtn: {
      innerText: 'Use Local',
      onclick: switchToLocal,
      disabled: false
    },
    settingsBtn: {
      innerText: 'Open settings',
      onclick: openSettings,
      disabled: false
    }
  });
}

function switchToUserIDPrompt() {
  transitionUI({
    noteArea: {
      style: {
        height: '10%'
      },
      placeholder: 'Enter User ID here...',
      value: '',
      oninput: checkIDInput,
      disabled: false
    },
    saveBtn: {
      innerText: 'Back',
      onclick: switchToLocal,
      disabled: false
    },
    switchBtn: {
      innerText: 'Create New',
      onclick: createAndProceedToAPI,
      disabled: false
    },
    settingsBtn: {
      innerText: 'Procees To API',
      onclick: checkAndProceedToAPI,
      disabled: true
    }
  });
}

async function switchToAPI() {
  if (!localStorage.id)
    return switchToUserIDPrompt();
  const res = await getAPINote();
  if (!res[0]) {
    delete localStorage.id;
    return switchToUserIDPrompt();
  }
  transitionUI({
    noteArea: {
      style: {
        height: ''
      },
      placeholder: 'Type note here...',
      value: res[1],
      oninput: null,
      disabled: false
    },
    saveBtn: {
      innerText: 'Save',
      onclick: saveAPI,
      disabled: false
    },
    switchBtn: {
      innerText: 'Use Local',
      onclick: switchToLocal,
      disabled: false
    },
    settingsBtn: {
      innerText: 'Open settings',
      onclick: openSettings,
      disabled: false
    }
  });
}

function updateTheme(light) {
  const method = light ? 'remove' : 'add';
  document.body.classList[method]('dark');
  noteArea.classList[method]('dark');
  saveBtn.classList[method]('dark');
  switchBtn.classList[method]('dark');
  settingsBtn.classList[method]('dark');
  document.head.children.namedItem('theme-color').content = light ? '#fff' : '#000';
}

matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  const opt = JSON.parse(localStorage.settings);
  if (opt.theme.system) {
    updateTheme(e.matches);
    opt.theme.value = e.matches;
    localStorage.settings = JSON.stringify(opt);
  }
});

addEventListener('storage', e => {
  if (e.key == 'settings') {
    const opt = JSON.parse(e.newValue);
    updateTheme(opt.theme.value);
    noteArea.style.whiteSpace = opt.wrap ? null : 'nowrap';
  }
});

if (navigator.onLine &&
    parent.location === location &&
    'serviceWorker' in navigator &&
    (window.isSecureContext || location.protocol === 'https:'))
  navigator.serviceWorker.register('/serviceWorker.js', {
    scope: '/'
  }).catch(() => {});

function onLoad() {
  if (!localStorage.noteValue)
    localStorage.noteValue = '';
  else noteArea.value = localStorage.noteValue;
  if (!localStorage.settings)
    localStorage.settings = JSON.stringify({
      theme: {
        system: true,
        value: matchMedia('(prefers-color-scheme: light)').matches
      },
      wrap: false
    });
  {
    const opt = JSON.parse(localStorage.settings);
    if (opt.theme.system) {
      const theme = matchMedia('(prefers-color-scheme: light)').matches;
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
  settingsBtn.onclick = openSettings;
};