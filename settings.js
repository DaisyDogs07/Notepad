function updateTheme(light) {
  if (light) {
    document.body.classList.remove('dark');
    {
      const elems = document.getElementsByTagName('text');
      for (let i = 0; i !== elems.length; ++i)
        elems.item(i).classList.remove('dark');
    }
    themeSelect.classList.remove('dark');
    IDInput.classList.remove('dark');
    IDCopy.classList.remove('dark');
    IDSave.classList.remove('dark');
    IDClear.classList.remove('dark');
    wrapSelect.classList.remove('dark');
  } else {
    document.body.classList.add('dark');
    {
      const elems = document.getElementsByTagName('text');
      for (let i = 0; i !== elems.length; ++i)
        elems.item(i).classList.add('dark');
    }
    themeSelect.classList.add('dark');
    IDInput.classList.add('dark');
    IDCopy.classList.add('dark');
    IDSave.classList.add('dark');
    IDClear.classList.add('dark');
    wrapSelect.classList.add('dark');
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

let opt;

addEventListener('storage', e => {
  opt = JSON.parse(e.newValue);
  updateTheme(opt.theme.value);
  noteArea.style.whiteSpace = opt.wrap ? null : 'nowrap';
});

addEventListener('DOMContentLoaded', () => {
  if (!localStorage.settings)
    localStorage.settings = JSON.stringify({
      theme: {
        system: true,
        value: matchMedia("(prefers-color-scheme: light)").matches
      },
      wrap: false
    });
  opt = JSON.parse(localStorage.settings);
  if (!opt.theme.system)
    themeSelect.value = opt.theme.value ? 'Light' : 'Dark';
  updateTheme(opt.theme.value);
  IDInput.value = localStorage.id || '';
  IDSave.disabled = true;
  if (!IDInput.value) {
    IDClear.disabled = true;
    IDCopy.disabled = true;
  } else IDInput.disabled = true;
  wrapSelect.value = opt.wrap ? 'Yes' : 'No';
  themeSelect.addEventListener('change', () => {
    opt.theme.system = (themeSelect.value == 'System');
    if (opt.theme.system)
      opt.theme.value = matchMedia("(prefers-color-scheme: light)").matches;
    else opt.theme.value = (themeSelect.value == 'Light');
    updateTheme(opt.theme.value);
    localStorage.settings = JSON.stringify(opt);
  });
  IDInput.addEventListener('input', e => {
    if (IDInput.value && IDInput.value.match(/^[-A-Za-z0-9]{0,}$/))
      IDSave.disabled = false;
    else IDSave.disabled = true;
  });
  IDCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(IDInput.value);
  });
  IDSave.addEventListener('click', () => {
    localStorage.id = IDInput.value;
    IDInput.disabled = true;
    IDSave.disabled = true;
    IDClear.disabled = false;
    IDCopy.disabled = false;
  });
  IDClear.addEventListener('click', () => {
    delete localStorage.id;
    IDInput.value = '';
    IDInput.disabled = false;
    IDClear.disabled = true;
    IDCopy.disabled = true;
  });
  wrapSelect.addEventListener('change', () => {
    opt.wrap = (wrapSelect.value == 'Yes');
    localStorage.settings = JSON.stringify(opt);
  });
});