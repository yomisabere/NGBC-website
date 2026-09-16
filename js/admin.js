(function(){
  const ADMIN_EMAIL='yomisabere@gmail.com';
  const sb=getSupabaseClient();
  const tables={
    prayer_requests:{label:'Prayer Requests',statuses:['new','praying','contacted','closed'],title:r=>r.name||'Anonymous',preview:r=>r.request||'',body:r=>r.request||'',private:r=>r.is_private?'Confidential':'Standard'},
    counselling_requests:{label:'Counselling',statuses:['new','contacted','closed'],title:r=>r.name||'Unnamed',preview:r=>r.nature||'',body:r=>r.nature||'',private:r=>r.is_private?'Confidential':'Standard'},
    testimonies:{label:'Testimonies',statuses:['new','reviewed','published','archived'],title:r=>r.title||'Untitled testimony',preview:r=>r.testimony||'',body:r=>r.testimony||'',private:r=>r.public_consent?'Public consent given':'Public consent not given'}
  };
  let currentTable='prayer_requests', records=[], selectedId=null;
  const $=id=>document.getElementById(id);
  const loginView=$('login-view'), appView=$('app-view');
  function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function formatDate(v){return v?new Intl.DateTimeFormat('en-NG',{dateStyle:'medium',timeStyle:'short'}).format(new Date(v)):'—';}
  function showToast(text){const el=document.createElement('div');el.className='admin-toast';el.textContent=text;document.body.appendChild(el);setTimeout(()=>el.remove(),2600)}
  function setView(loginVisible){
    loginView.classList.toggle('admin-view-hidden', !loginVisible);
    appView.classList.toggle('admin-view-hidden', loginVisible);
    loginView.hidden=!loginVisible;
    appView.hidden=loginVisible;
  }
  function showLogin(msg=''){setView(true);$('login-message').textContent=msg||'';}
  function showApp(email){setView(false);$('admin-user-email').textContent=email||ADMIN_EMAIL;}
  async function verifySession(){
    if(!sb){showLogin('The secure connection could not be loaded.');return;}
    setView(true);
    const {data:{session},error}=await sb.auth.getSession();
    if(error){showLogin('Could not restore your session. Please sign in again.');return;}
    if(session?.user?.email?.toLowerCase()===ADMIN_EMAIL){showApp(session.user.email);await loadAll();}
    else if(session){await sb.auth.signOut();showLogin('This account is not authorised for the NGBC admin portal.');}
    else showLogin();
  }
  $('login-form').addEventListener('submit',async e=>{
    e.preventDefault();
    const email=$('admin-email').value.trim().toLowerCase(), password=$('admin-password').value;
    $('login-message').textContent='';$('login-button').disabled=true;$('login-button').textContent='Signing in...';
    try{
      if(email!==ADMIN_EMAIL) throw new Error('Use the authorised admin email for this portal.');
      const {data,error}=await sb.auth.signInWithPassword({email,password});
      if(error) throw error;
      if(data.user?.email?.toLowerCase()!==ADMIN_EMAIL){await sb.auth.signOut();throw new Error('This account is not authorised for the NGBC admin portal.');}
      showApp(data.user.email);await loadAll();
    }catch(err){$('login-message').textContent=err.message||'Sign in failed. Please try again.'}
    finally{$('login-button').disabled=false;$('login-button').textContent='Sign In'}
  });
  $('logout-button').addEventListener('click',async()=>{await sb.auth.signOut();showLogin();$('admin-password').value='';});
  $('refresh-button').addEventListener('click',loadAll);
  document.querySelectorAll('.admin-tab').forEach(tab=>tab.addEventListener('click',()=>{currentTable=tab.dataset.table;selectedId=null;document.querySelectorAll('.admin-tab').forEach(x=>x.classList.toggle('active',x===tab));populateStatusFilter();renderList();renderDetail();}));
  $('status-filter').addEventListener('change',renderList);
  async function count(table){const {count,error}=await sb.from(table).select('id',{count:'exact',head:true});if(error)throw error;return count||0}
  async function loadAll(){
    $('refresh-button').disabled=true;$('refresh-button').textContent='Refreshing...';
    try{const vals=await Promise.all(Object.keys(tables).map(count));['prayer_requests','counselling_requests','testimonies'].forEach((t,i)=>{$('count-'+t).textContent=vals[i]});$('stats').innerHTML=Object.keys(tables).map((t,i)=>`<div class="admin-stat"><div class="label">${tables[t].label}</div><div class="value">${vals[i]}</div></div>`).join('');await loadRecords();}
    catch(err){showToast(err.message||'Could not load submissions.');}
    finally{$('refresh-button').disabled=false;$('refresh-button').textContent='Refresh'}
  }
  async function loadRecords(){
    const {data,error}=await sb.from(currentTable).select('*').order('created_at',{ascending:false}).limit(200);
    if(error){$('record-list').innerHTML='<div class="empty-list">Could not load submissions.</div>';showToast(error.message);return}
    records=data||[];populateStatusFilter();renderList();renderDetail();
  }
  function populateStatusFilter(){const statuses=tables[currentTable].statuses;$('status-filter').innerHTML='<option value="all">All statuses</option>'+statuses.map(s=>`<option value="${s}">${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}
  function renderList(){
    const filter=$('status-filter').value;const shown=filter==='all'?records:records.filter(r=>r.status===filter);$('list-meta').textContent=`${shown.length} submission${shown.length===1?'':'s'}`;
    if(!shown.length){$('record-list').innerHTML='<div class="empty-list">No submissions match this filter.</div>';return}
    const cfg=tables[currentTable];$('record-list').innerHTML=shown.map(r=>`<button class="record-card ${r.id===selectedId?'selected':''}" data-id="${r.id}"><div class="record-top"><span class="record-title">${escapeHtml(cfg.title(r))}</span><span class="record-date">${formatDate(r.created_at)}</span></div><div class="record-preview">${escapeHtml(cfg.preview(r))}</div><span class="status-pill ${escapeHtml(r.status||'new')}">${escapeHtml(r.status||'new')}</span></button>`).join('');document.querySelectorAll('.record-card').forEach(el=>el.addEventListener('click',()=>{selectedId=el.dataset.id;renderList();renderDetail()}));
  }
  function renderDetail(){
    const r=records.find(x=>x.id===selectedId);if(!r){$('detail-panel').innerHTML='<div class="empty-detail">Select a submission to view its details.</div>';return}
    let fields='';if(currentTable==='prayer_requests') fields=`<div class="detail-grid"><div class="detail-field"><div class="detail-label">Name</div><div class="detail-value">${escapeHtml(r.name||'Anonymous')}</div></div><div class="detail-field"><div class="detail-label">Phone</div><div class="detail-value">${r.phone?`<a href="tel:${escapeHtml(r.phone)}">${escapeHtml(r.phone)}</a>`:'—'}</div></div></div><div class="detail-field"><div class="detail-label">Prayer Request</div><div class="detail-value">${escapeHtml(r.request)}</div></div><div class="detail-field"><div class="detail-label">Privacy</div><div class="detail-value">${r.is_private?'Confidential — pastoral team only':'Standard request'}</div></div>`;
    if(currentTable==='counselling_requests') fields=`<div class="detail-grid"><div class="detail-field"><div class="detail-label">Name</div><div class="detail-value">${escapeHtml(r.name)}</div></div><div class="detail-field"><div class="detail-label">Phone</div><div class="detail-value"><a href="tel:${escapeHtml(r.phone)}">${escapeHtml(r.phone)}</a></div></div></div><div class="detail-field"><div class="detail-label">Preferred Contact</div><div class="detail-value">${escapeHtml(r.preferred_contact||'Not specified')}</div></div><div class="detail-field"><div class="detail-label">What they want to discuss</div><div class="detail-value">${escapeHtml(r.nature)}</div></div><div class="detail-field"><div class="detail-label">Privacy</div><div class="detail-value">${r.is_private?'Confidential — pastoral team only':'Standard request'}</div></div>`;
    if(currentTable==='testimonies') fields=`<div class="detail-grid"><div class="detail-field"><div class="detail-label">Name</div><div class="detail-value">${escapeHtml(r.name)}</div></div><div class="detail-field"><div class="detail-label">Phone</div><div class="detail-value">${r.phone?`<a href="tel:${escapeHtml(r.phone)}">${escapeHtml(r.phone)}</a>`:'—'}</div></div></div><div class="detail-field"><div class="detail-label">Testimony</div><div class="detail-value">${escapeHtml(r.testimony)}</div></div><div class="detail-field"><div class="detail-label">Public consent</div><div class="detail-value">${r.public_consent?'Yes — may be considered for public use':'No — do not publish'}</div></div>`;
    $('detail-panel').innerHTML=`<div class="detail-inner"><div class="detail-header"><div><div class="admin-kicker" style="margin:0 0 6px">${tables[currentTable].label}</div><h2>${escapeHtml(tables[currentTable].title(r))}</h2></div><span class="status-pill ${escapeHtml(r.status||'new')}">${escapeHtml(r.status||'new')}</span></div>${fields}<div class="detail-field"><div class="detail-label">Submitted</div><div class="detail-value">${formatDate(r.created_at)}</div></div><div class="detail-actions"><div class="detail-label">Update record</div><div class="row"><select id="detail-status">${tables[currentTable].statuses.map(s=>`<option value="${s}" ${s===r.status?'selected':''}>${s[0].toUpperCase()+s.slice(1)}</option>`).join('')}</select><button id="save-status">Save</button></div><textarea id="detail-notes" placeholder="Private admin notes...">${escapeHtml(r.admin_notes||'')}</textarea><button id="save-notes" style="margin-top:10px;width:100%">Save Notes</button><button class="delete" id="delete-record" style="margin-top:10px;width:100%">Delete Submission</button></div></div>`;
    $('save-status').onclick=()=>updateRecord({status:$('detail-status').value});$('save-notes').onclick=()=>updateRecord({admin_notes:$('detail-notes').value.trim()});$('delete-record').onclick=deleteRecord;
  }
  async function updateRecord(patch){const r=records.find(x=>x.id===selectedId);if(!r)return;const {data,error}=await sb.from(currentTable).update({...patch,updated_at:new Date().toISOString()}).eq('id',r.id).select().single();if(error){showToast(error.message);return}Object.assign(r,data);renderList();renderDetail();showToast('Submission updated.');}
  async function deleteRecord(){if(!confirm('Delete this submission permanently?'))return;const r=records.find(x=>x.id===selectedId);const {error}=await sb.from(currentTable).delete().eq('id',r.id);if(error){showToast(error.message);return}selectedId=null;await loadAll();showToast('Submission deleted.');}
  sb?.auth.onAuthStateChange((event,session)=>{
    if(event==='SIGNED_OUT'){showLogin();return;}
    if(event==='SIGNED_IN' || event==='TOKEN_REFRESHED' || event==='INITIAL_SESSION'){
      if(session?.user?.email?.toLowerCase()===ADMIN_EMAIL){showApp(session.user.email);}
      else if(event==='SIGNED_IN'){showLogin('This account is not authorised for the NGBC admin portal.');}
    }
  });
  verifySession();
})();
