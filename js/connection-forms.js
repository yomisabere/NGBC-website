(function () {
  const client = typeof getSupabaseClient === 'function' ? getSupabaseClient() : null;

  function setBusy(button, busy, label) {
    button.disabled = busy;
    button.textContent = busy ? label : button.dataset.defaultLabel;
  }

  function showError(note, message) {
    note.textContent = message;
    note.classList.add('form-error');
  }

  function clearError(note) {
    note.classList.remove('form-error');
  }

  async function save(table, payload) {
    if (!client) throw new Error('Our connection to the church system is unavailable. Please try again shortly.');
    const { error } = await client.from(table).insert(payload);
    if (error) throw error;
  }

  const prayer = document.getElementById('rp-submit');
  if (prayer) {
    prayer.dataset.defaultLabel = prayer.textContent;
    prayer.addEventListener('click', async function () {
      const name = document.getElementById('rp-name').value.trim();
      const phone = document.getElementById('rp-phone').value.trim();
      const request = document.getElementById('rp-request').value.trim();
      const isPrivate = document.getElementById('rp-confidential').checked;
      const note = document.getElementById('rp-note');
      clearError(note);
      if (!request) { showError(note, 'Please share your prayer request before sending.'); return; }
      setBusy(prayer, true, 'Sending...');
      try {
        await save('prayer_requests', { name: name || 'Anonymous', phone: phone || null, request, is_private: isPrivate });
        document.getElementById('rp-form-fields').style.display = 'none';
        document.getElementById('rp-success').style.display = 'block';
      } catch (err) {
        console.error(err);
        showError(note, 'We could not send your request right now. Please try again.');
        setBusy(prayer, false);
      }
    });
  }

  const counselling = document.getElementById('rc-submit');
  if (counselling) {
    counselling.dataset.defaultLabel = counselling.textContent;
    counselling.addEventListener('click', async function () {
      const name = document.getElementById('rc-name').value.trim();
      const phone = document.getElementById('rc-phone').value.trim();
      const preferredContact = document.getElementById('rc-preference').value.trim();
      const nature = document.getElementById('rc-nature').value.trim();
      const isPrivate = document.getElementById('rc-confidential').checked;
      const note = document.getElementById('rc-note');
      clearError(note);
      if (!nature) { showError(note, 'Please share a little about what you would like to talk about before sending.'); return; }
      if (!name || !phone) { showError(note, 'Please provide your name and phone number so our team can follow up.'); return; }
      setBusy(counselling, true, 'Sending...');
      try {
        await save('counselling_requests', { name, phone, preferred_contact: preferredContact || null, nature, is_private: isPrivate });
        document.getElementById('rc-form-fields').style.display = 'none';
        document.getElementById('rc-success').style.display = 'block';
      } catch (err) {
        console.error(err);
        showError(note, 'We could not send your request right now. Please try again.');
        setBusy(counselling, false);
      }
    });
  }

  const testimony = document.getElementById('st-submit');
  if (testimony) {
    testimony.dataset.defaultLabel = testimony.textContent;
    testimony.addEventListener('click', async function () {
      const name = document.getElementById('st-name').value.trim();
      const phone = document.getElementById('st-phone').value.trim();
      const title = document.getElementById('st-title').value.trim();
      const body = document.getElementById('st-testimony').value.trim();
      const publicConsent = document.getElementById('st-public').checked;
      const note = document.getElementById('st-note');
      clearError(note);
      if (!title || !body) { showError(note, 'Please provide a title and your testimony before sending.'); return; }
      if (!name) { showError(note, 'Please provide your name.'); return; }
      setBusy(testimony, true, 'Sending...');
      try {
        await save('testimonies', { name, phone: phone || null, title, testimony: body, public_consent: publicConsent });
        document.getElementById('st-form-fields').style.display = 'none';
        document.getElementById('st-success').style.display = 'block';
      } catch (err) {
        console.error(err);
        showError(note, 'We could not send your testimony right now. Please try again.');
        setBusy(testimony, false);
      }
    });
  }
})();
