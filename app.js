(function(){
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     CONFIG - swap these in one place
     ============================================================ */
  // Paste your real Tally intake form link here. All "Get my audit" style
  // buttons and the intake link in the Process section point to it.
  const TALLY_FORM_URL = "https://tally.so/r/REPLACE_ME";
  // How many business days the audit takes to deliver (referenced in copy).
  const AUDIT_TURNAROUND_DAYS = 3;

  /* ---------- language ----------
     English lives at / and French at /fr/. Each page sets its own <html lang>
     and the EN/FR toggle is a plain link between the two routes. There is no
     auto-redirect by browser or IP. Nothing to do here in JS. */

  /* ---------- wire tier CTAs to the Tally intake ---------- */
  document.querySelectorAll('[data-cta="tally"]').forEach(a => {
    const tier = a.getAttribute('data-tier') || '';
    const sep = TALLY_FORM_URL.includes('?') ? '&' : '?';
    a.setAttribute('href', TALLY_FORM_URL + sep + 'tier=' + encodeURIComponent(tier));
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
  });

  const counted = new WeakSet();
  function formatCount(el, value) {
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    return prefix + value.toLocaleString('en-CA') + suffix;
  }

  /* ---------- nav ---------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const drawer = document.getElementById('drawer');
  const menuBtn = document.getElementById('menuBtn');
  menuBtn && menuBtn.addEventListener('click', () => drawer.classList.toggle('open'));
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', () => drawer.classList.remove('open')));

  if (prefersReduced) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  function animateCount(el) {
    if (counted.has(el)) return;
    counted.add(el);
    const target = parseFloat(el.dataset.target);
    const duration = prefersReduced ? 0 : 1600;
    if (duration === 0) { el.textContent = formatCount(el, target); return; }
    // Reserve the final width so the box never reflows while counting up.
    el.textContent = formatCount(el, target);
    el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + 'px';
    el.textContent = formatCount(el, 0);
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = formatCount(el, value);
      if (t < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  const counts = document.querySelectorAll('.count');
  if (counts.length) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counts.forEach(el => cio.observe(el));
  }

  document.querySelectorAll('.faq').forEach(faq => {
    const q = faq.querySelector('.faq-q');
    const a = faq.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = faq.classList.contains('open');
      document.querySelectorAll('.faq.open').forEach(other => {
        if (other !== faq) {
          other.classList.remove('open');
          other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-a').style.maxHeight = '0px';
        }
      });
      if (isOpen) {
        faq.classList.remove('open');
        q.setAttribute('aria-expanded', 'false');
        a.style.maxHeight = '0px';
      } else {
        faq.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // The contact form posts to FormSubmit, which emails the submission and then
  // redirects to the thank-you page (via the hidden _next field). That needs the
  // deployed site. On a local preview (python http.server can't proxy the POST),
  // just navigate to the thank-you page so the flow is previewable; no email is
  // sent locally. In production this handler does nothing and FormSubmit handles it.
  // Route the confirmation page by which tier was selected, and keep the FormSubmit
  // _next field in sync. Free teaser / "not sure" -> free-look page; Full ($500) /
  // Custom -> full-assessment page. Falls back to the free-look page if JS is off.
  const contactForm = document.querySelector('form.contact-form');
  if (contactForm) {
    const isFr = document.documentElement.lang === 'fr';
    const nextInput = contactForm.querySelector('input[name="_next"]');
    const auditChoice = () => {
      const r = contactForm.querySelector('input[name="assessment"]:checked');
      return r ? r.value : '';
    };
    const dest = {
      free: isFr ? '/fr/merci-apercu' : '/thanks-free-look',
      full: isFr ? '/fr/merci-evaluation' : '/thanks-full-assessment'
    };
    const localPage = {
      free: isFr ? 'merci-apercu.html' : 'thanks-free-look.html',
      full: isFr ? 'merci-evaluation.html' : 'thanks-full-assessment.html'
    };
    const pickKey = () => /(500|custom|mesure)/i.test(auditChoice()) ? 'full' : 'free';
    const syncNext = () => { if (nextInput) nextInput.value = 'https://progressai.ca' + dest[pickKey()]; };
    contactForm.addEventListener('change', (e) => { if (e.target.name === 'assessment') syncNext(); });
    syncNext();

    /* ---------- step-by-step flow ----------
       Without JS every fieldset shows as one long form with native validation.
       With JS we show one step at a time, validate each step before moving on,
       and auto-advance when a single-choice question is answered. */
    const steps = Array.from(contactForm.querySelectorAll('fieldset.step'));
    const progress = contactForm.querySelector('.step-progress');
    const countEl = contactForm.querySelector('.step-count');
    const barEl = contactForm.querySelector('.step-bar span');
    const backBtn = contactForm.querySelector('.step-back');
    const nextBtn = contactForm.querySelector('.step-next');
    const submitBtn = contactForm.querySelector('.form-submit');
    const label = contactForm.dataset.stepLabel || 'Step {n} of {total}';
    let current = 0;
    let advanceTimer = null;

    const stepValid = (i) => {
      const fields = Array.from(steps[i].querySelectorAll('input, textarea, select'));
      const bad = fields.find(f => !f.checkValidity());
      if (bad) { bad.reportValidity(); return false; }
      return true;
    };
    const show = (i, focus) => {
      current = Math.max(0, Math.min(steps.length - 1, i));
      steps.forEach((s, k) => { s.hidden = k !== current; });
      const last = current === steps.length - 1;
      backBtn.hidden = current === 0;
      nextBtn.hidden = last;
      submitBtn.hidden = !last;
      countEl.textContent = label.replace('{n}', current + 1).replace('{total}', steps.length);
      barEl.style.width = ((current + 1) / steps.length * 100) + '%';
      if (focus) {
        const first = steps[current].querySelector('input[type="text"], input[type="email"], textarea');
        (first || steps[current].querySelector('.step-q')).focus({ preventScroll: true });
        const top = contactForm.getBoundingClientRect().top;
        if (top < 80 || top > window.innerHeight * 0.6) {
          window.scrollTo({ top: window.scrollY + top - 120, behavior: prefersReduced ? 'auto' : 'smooth' });
        }
      }
    };
    const go = (dir) => {
      clearTimeout(advanceTimer);
      if (dir > 0 && !stepValid(current)) return;
      show(current + dir, true);
    };

    if (steps.length) {
      contactForm.classList.add('is-stepped');
      contactForm.noValidate = true;
      progress.hidden = false;
      nextBtn.addEventListener('click', () => go(1));
      backBtn.addEventListener('click', () => go(-1));
      contactForm.addEventListener('change', (e) => {
        if (e.target.type !== 'radio') return;
        clearTimeout(advanceTimer);
        advanceTimer = setTimeout(() => go(1), prefersReduced ? 0 : 280);
      });
      // Enter in a text field moves to the next step instead of submitting early.
      contactForm.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && current < steps.length - 1) {
          e.preventDefault();
          go(1);
        }
      });
      // Pricing buttons (data-pick) pre-select the matching assessment.
      document.querySelectorAll('a[data-pick]').forEach(a => {
        a.addEventListener('click', () => {
          const r = contactForm.querySelector('input[name="assessment"][data-pick="' + a.dataset.pick + '"]');
          if (r) { r.checked = true; syncNext(); }
        });
      });
      show(0, false);
    }

    contactForm.addEventListener('submit', (e) => {
      // Final safety net: jump to the first step that is still incomplete.
      for (let i = 0; i < steps.length; i++) {
        if (!steps[i].querySelector(':invalid')) continue;
        e.preventDefault();
        show(i, true);
        stepValid(i);
        return;
      }
      syncNext();
      const host = location.hostname;
      const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '';
      if (isLocal) {
        e.preventDefault();
        window.location.href = localPage[pickKey()];
      }
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1 && document.querySelector(id)) {
        e.preventDefault();
        document.querySelector(id).scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });
})();
