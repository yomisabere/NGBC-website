
(function () {
  const SUPABASE_URL = 'https://qljcllxruouuqclgxbxj.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_-3N7xN1HaIv1cDREKnKmeg_82l9UQxI';

  const statusEl = document.getElementById('devotional-status');
  const featureEl = document.getElementById('devotional-feature');
  const archiveEl = document.getElementById('devotional-archive');
  const refreshBtn = document.getElementById('devotional-refresh');

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (c) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[c];
    });
  }

  function formatDate(value) {
    if (!value) return '';
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric', month: 'long', year: 'numeric'
    }).format(new Date(value + 'T00:00:00'));
  }

  function jsonText(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (Array.isArray(value)) return value.map(x => typeof x === 'string' ? x : JSON.stringify(x)).join('\\n');
    if (typeof value === 'object') {
      if (value.text) return value.text;
      if (value.content) return value.content;
      if (value.reference) return value.reference;
      return Object.values(value).filter(Boolean).map(x => typeof x === 'string' ? x : JSON.stringify(x)).join(' ');
    }
    return String(value);
  }

  function devotionalTitle(d) {
    return d.theme || d.series_title || 'Daily Devotional';
  }

  function renderHymn(hymn) {
    if (!hymn) return '';
    const title = hymn.title || '';
    const number = hymn.number || '';
    const verses = Array.isArray(hymn.verses) ? hymn.verses : [];

    return `
      <div class="devotional-block devotional-hymn">
        <h4>Hymn${number ? ` · ${escapeHtml(number)}` : ''}</h4>
        ${title ? `<h5>${escapeHtml(title)}</h5>` : ''}
        ${verses.map((verse, i) => `
          <div class="hymn-verse">
            ${verses.length > 1 ? `<span class="hymn-verse-label">Verse ${i + 1}</span>` : ''}
            <p>${escapeHtml(String(verse))}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderScripture(scripture, d) {
    if (!scripture) return '';

    if (Array.isArray(scripture)) {
      return `
        <div class="devotional-block">
          <h4>Scripture Reading${d.passage ? ` <span class="scripture-reference">· ${escapeHtml(d.passage)}</span>` : ''}</h4>
          <div class="scripture-verses">
            ${scripture.map(v => `
              <p><sup>${escapeHtml(v.verse ?? '')}</sup> ${escapeHtml(v.text ?? '')}</p>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="devotional-block">
        <h4>Scripture Reading</h4>
        <p>${escapeHtml(jsonText(scripture))}</p>
      </div>
    `;
  }

  function renderDevotionalSections(d) {
    const sections = [];

    if (d.hymn) sections.push(renderHymn(d.hymn));

    const golden = jsonText(d.golden_text);
    if (golden) {
      sections.push(`
        <div class="devotional-block devotional-golden-text">
          <h4>Golden Text</h4>
          <p>${escapeHtml(golden)}</p>
          ${d.golden_text && d.golden_text.reference ? `<div class="golden-reference">${escapeHtml(d.golden_text.reference)}</div>` : ''}
        </div>
      `);
    }

    sections.push(renderScripture(d.scripture, d));

    if (d.reflection) sections.push(`<div class="devotional-block"><h4>Reflection</h4><p>${escapeHtml(d.reflection)}</p></div>`);
    if (d.wisdom) sections.push(`<div class="devotional-block"><h4>Wisdom</h4><p>${escapeHtml(d.wisdom)}</p></div>`);
    if (d.food_for_thought) sections.push(`<div class="devotional-block"><h4>Food for Thought</h4><p>${escapeHtml(d.food_for_thought)}</p></div>`);
    if (d.follow_up_action) sections.push(`<div class="devotional-block"><h4>Take Action</h4><p>${escapeHtml(d.follow_up_action)}</p></div>`);
    if (d.prayer) sections.push(`<div class="devotional-block devotional-prayer"><h4>Prayer</h4><p>${escapeHtml(d.prayer)}</p></div>`);
    if (d.additional_prayer) sections.push(`<div class="devotional-block devotional-prayer"><h4>Additional Prayer</h4><p>${escapeHtml(d.additional_prayer)}</p></div>`);
    if (d.pray_for_ministers) sections.push(`<div class="devotional-block devotional-ministers"><h4>Prayer for Ministers</h4><p>${escapeHtml(d.pray_for_ministers)}</p></div>`);
    if (d.reading_plan) sections.push(`<div class="devotional-block devotional-reading-plan"><h4>Reading Plan</h4><p>${escapeHtml(d.reading_plan)}</p></div>`);

    return sections.filter(Boolean).join('');
  }

  function renderFeature(d) {
    if (!d) {
      featureEl.innerHTML = '<div class="devotional-empty">No devotional has been published yet. Please check back soon.</div>';
      statusEl.textContent = 'No devotional available yet.';
      return;
    }

    featureEl.innerHTML = `
      <div class="devotional-kicker">${escapeHtml(d.series_title || 'Daily Devotional')}</div>
      <h3>${escapeHtml(devotionalTitle(d))}</h3>
      <div class="devotional-meta">
        <span>${escapeHtml(formatDate(d.date))}</span>
        ${d.passage ? `<span>Scripture: ${escapeHtml(d.passage)}</span>` : ''}
      </div>
      <div class="devotional-body devotional-complete">
        ${renderDevotionalSections(d)}
      </div>
    `;
    statusEl.textContent = 'Latest devotional from New Glory Baptist Church.';
  }

  function renderArchive(rows) {
    if (!rows.length) {
      archiveEl.innerHTML = '<div class="devotional-empty">There are no previous devotionals to display.</div>';
      return;
    }

    archiveEl.innerHTML = rows.map((d, index) => {
      const preview = d.reflection || d.wisdom || d.food_for_thought || '';
      const cardId = 'devotional-archive-' + index;

      return `
        <article class="card devotional-card devotional-expandable">
          <div class="date">${escapeHtml(formatDate(d.date))}</div>
          <h4>${escapeHtml(devotionalTitle(d))}</h4>
          ${d.passage ? `<div class="passage">${escapeHtml(d.passage)}</div>` : ''}
          <p class="preview">${escapeHtml(preview.slice(0, 180))}${preview.length > 180 ? '…' : ''}</p>

          <button class="devotional-read-more" type="button"
                  aria-expanded="false" aria-controls="${cardId}">
            <span class="read-more-label">Read more</span>
            <span class="read-more-icon" aria-hidden="true">+</span>
          </button>

          <div id="${cardId}" class="devotional-details" hidden>
            ${renderDevotionalSections(d)}
          </div>
        </article>
      `;
    }).join('');
  }

  archiveEl.addEventListener('click', function (event) {
    const button = event.target.closest('.devotional-read-more');
    if (!button) return;

    const details = document.getElementById(button.getAttribute('aria-controls'));
    if (!details) return;

    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    details.hidden = expanded;

    const label = button.querySelector('.read-more-label');
    const icon = button.querySelector('.read-more-icon');
    if (label) label.textContent = expanded ? 'Read more' : 'Read less';
    if (icon) icon.textContent = expanded ? '+' : '−';
  });

  async function loadDevotionals() {
    statusEl.textContent = "Loading today's devotional…";
    featureEl.innerHTML = '<div class="devotional-loading"><span class="loading-dot"></span><span>Fetching live devotional content…</span></div>';

    try {
      if (!window.supabase || !window.supabase.createClient) {
        throw new Error('Supabase library failed to load.');
      }

      const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      const { data, error } = await client
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false })
        .limit(12);

      if (error) throw error;

      const rows = data || [];
      renderFeature(rows[0] || null);
      renderArchive(rows.slice(1));
    } catch (error) {
      console.error('NGBC devotional fetch error:', error);
      statusEl.textContent = 'We could not load the devotional right now.';
      featureEl.innerHTML = `<div class="devotional-error"><strong>Unable to load devotional content.</strong><br>Please refresh the page and try again.</div>`;
      archiveEl.innerHTML = '';
    }
  }

  refreshBtn && refreshBtn.addEventListener('click', loadDevotionals);
  loadDevotionals();
})();
