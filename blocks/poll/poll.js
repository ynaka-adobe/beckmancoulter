export default function decorate(block) {
  const rows = [...block.children];
  if (rows.length < 2) return;

  const question = rows[0].querySelector('p, h1, h2, h3')?.textContent.trim() || '';
  const options = [...rows].slice(1).map((row) => row.querySelector('p')?.textContent.trim()).filter(Boolean);

  const storageKey = `poll-${question}`;
  const saved = localStorage.getItem(storageKey);

  block.innerHTML = '';

  const q = document.createElement('p');
  q.className = 'poll-question';
  q.textContent = question;
  block.append(q);

  const form = document.createElement('form');
  form.className = 'poll-form';

  options.forEach((opt) => {
    const label = document.createElement('label');
    label.className = 'poll-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'poll';
    radio.value = opt;
    if (saved === opt) radio.checked = true;
    label.append(radio, document.createTextNode(opt));
    form.append(label);
  });

  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.textContent = 'Submit';
  form.append(btn);

  const result = document.createElement('p');
  result.className = 'poll-result';
  if (saved) result.textContent = `You voted: ${saved}`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const selected = form.querySelector('input[name="poll"]:checked');
    if (!selected) return;
    localStorage.setItem(storageKey, selected.value);
    result.textContent = `You voted: ${selected.value}`;
    btn.disabled = true;
  });

  block.append(form, result);
}
