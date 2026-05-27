/* ============================================
   Admin CMS Panel — JavaScript
   ============================================ */

(function () {
  'use strict';

  // --- State ---
  let hasUnsavedChanges = false;
  let isSaving = false;

  // Only initialize dashboard features if we're on the dashboard page
  if (document.body.classList.contains('dashboard-page')) {
    initDashboard();
  }

  function initDashboard() {
    initSidebar();
    initSidebarNavigation();
    initFileUploads();
    initUnsavedChangesTracking();
  }

  // =====================
  // SIDEBAR
  // =====================
  function initSidebar() {
    const toggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');

    if (!toggle || !sidebar) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    toggle.addEventListener('click', function () {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('visible');
    });

    overlay.addEventListener('click', function () {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }

  // =====================
  // SIDEBAR NAVIGATION
  // =====================
  function initSidebarNavigation() {
    const links = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.admin-section');

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-section');
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Close mobile sidebar
        const sidebar = document.getElementById('sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        if (sidebar) sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('visible');

        // Active state
        links.forEach(function (l) { l.classList.remove('active'); });
        this.classList.add('active');
      });
    });

    // Update active link on scroll
    const content = document.getElementById('content');
    if (content) {
      window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(function (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= 120) {
            current = section.id;
          }
        });
        if (current) {
          links.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('data-section') === current) {
              link.classList.add('active');
            }
          });
        }
      }, { passive: true });
    }
  }

  // =====================
  // FILE UPLOADS
  // =====================
  function initFileUploads() {
    document.addEventListener('change', function (e) {
      if (e.target.classList.contains('file-input')) {
        handleFileUpload(e.target);
      }
    });
  }

  function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    const targetType = input.getAttribute('data-target');
    const formData = new FormData();
    formData.append('photo', file);

    // Find the parent upload area
    const uploadArea = input.closest('.photo-upload-area');
    const preview = uploadArea.querySelector('.photo-preview');
    const pathInput = uploadArea.querySelector('input[type="hidden"]');

    // Show loading state
    preview.innerHTML = '<div class="uploading-spinner"></div>';

    fetch('/admin/upload', {
      method: 'POST',
      body: formData
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.success && data.path) {
        // Update preview
        preview.innerHTML = '<img src="' + data.path + '" alt="Preview">';
        // Update hidden input
        if (pathInput) {
          pathInput.value = data.path;
        }
        hasUnsavedChanges = true;
        showToast('Фото успешно загружено', 'success');
      } else {
        preview.innerHTML = '<span class="material-icons">error</span>';
        showToast('Ошибка загрузки фото', 'error');
      }
    })
    .catch(function (err) {
      console.error('Upload error:', err);
      preview.innerHTML = '<span class="material-icons">error</span>';
      showToast('Ошибка загрузки фото', 'error');
    });

    // Reset file input so the same file can be re-selected
    input.value = '';
  }

  // =====================
  // DYNAMIC ITEMS — ADD
  // =====================

  // Achievements
  window.addAchievement = function () {
    const list = document.getElementById('achievements-list');
    const index = list.children.length;
    const html = '\
      <div class="dynamic-item" data-index="' + index + '">\
        <div class="dynamic-item-header">\
          <span class="item-number">Достижение #' + (index + 1) + '</span>\
          <button type="button" class="btn btn-icon btn-delete" onclick="removeDynamicItem(this)" title="Удалить">\
            <span class="material-icons">delete</span>\
          </button>\
        </div>\
        <div class="dynamic-item-body">\
          <div class="form-row">\
            <div class="md-field flex-2">\
              <input type="text" class="achievement-title" value="" placeholder=" ">\
              <label>Название</label>\
            </div>\
            <div class="md-field flex-1">\
              <input type="text" class="achievement-year" value="" placeholder=" ">\
              <label>Год</label>\
            </div>\
          </div>\
          <div class="md-field">\
            <textarea class="achievement-description" rows="3" placeholder=" "></textarea>\
            <label>Описание</label>\
          </div>\
          <div class="photo-upload-group">\
            <div class="photo-upload-area">\
              <div class="photo-preview achievement-photo-preview">\
                <span class="material-icons">add_a_photo</span>\
              </div>\
              <input type="hidden" class="achievement-photo-path" value="">\
              <label class="btn btn-outline btn-upload">\
                <span class="material-icons">upload</span> Загрузить\
                <input type="file" accept="image/*" class="file-input" data-target="achievement-photo" data-index="' + index + '">\
              </label>\
            </div>\
          </div>\
        </div>\
      </div>';

    list.insertAdjacentHTML('beforeend', html);
    hasUnsavedChanges = true;
    renumberItems(list, 'Достижение');
  };

  // Methods
  window.addMethod = function () {
    const list = document.getElementById('methods-list');
    const index = list.children.length;
    const html = '\
      <div class="dynamic-item" data-index="' + index + '">\
        <div class="dynamic-item-header">\
          <span class="item-number">Методика #' + (index + 1) + '</span>\
          <button type="button" class="btn btn-icon btn-delete" onclick="removeDynamicItem(this)" title="Удалить">\
            <span class="material-icons">delete</span>\
          </button>\
        </div>\
        <div class="dynamic-item-body">\
          <div class="form-row">\
            <div class="md-field flex-2">\
              <input type="text" class="method-title" value="" placeholder=" ">\
              <label>Название</label>\
            </div>\
            <div class="md-field flex-1">\
              <input type="text" class="method-icon" value="" placeholder=" ">\
              <label>Иконка (Material Icon)</label>\
            </div>\
          </div>\
          <div class="md-field">\
            <textarea class="method-description" rows="3" placeholder=" "></textarea>\
            <label>Описание</label>\
          </div>\
        </div>\
      </div>';

    list.insertAdjacentHTML('beforeend', html);
    hasUnsavedChanges = true;
    renumberItems(list, 'Методика');
  };

  // Gallery
  window.addGalleryItem = function () {
    const list = document.getElementById('gallery-list');
    const index = list.children.length;
    const html = '\
      <div class="dynamic-item gallery-item" data-index="' + index + '">\
        <div class="dynamic-item-header">\
          <span class="item-number">Фото #' + (index + 1) + '</span>\
          <button type="button" class="btn btn-icon btn-delete" onclick="removeDynamicItem(this)" title="Удалить">\
            <span class="material-icons">delete</span>\
          </button>\
        </div>\
        <div class="dynamic-item-body">\
          <div class="photo-upload-group">\
            <div class="photo-upload-area">\
              <div class="photo-preview gallery-photo-preview">\
                <span class="material-icons">add_a_photo</span>\
              </div>\
              <input type="hidden" class="gallery-photo-path" value="">\
              <label class="btn btn-outline btn-upload">\
                <span class="material-icons">upload</span> Загрузить\
                <input type="file" accept="image/*" class="file-input" data-target="gallery-photo" data-index="' + index + '">\
              </label>\
            </div>\
          </div>\
          <div class="md-field">\
            <input type="text" class="gallery-caption" value="" placeholder=" ">\
            <label>Подпись</label>\
          </div>\
        </div>\
      </div>';

    list.insertAdjacentHTML('beforeend', html);
    hasUnsavedChanges = true;
    renumberItems(list, 'Фото');
  };

  // Testimonials
  window.addTestimonial = function () {
    const list = document.getElementById('testimonials-list');
    const index = list.children.length;
    const html = '\
      <div class="dynamic-item" data-index="' + index + '">\
        <div class="dynamic-item-header">\
          <span class="item-number">Отзыв #' + (index + 1) + '</span>\
          <button type="button" class="btn btn-icon btn-delete" onclick="removeDynamicItem(this)" title="Удалить">\
            <span class="material-icons">delete</span>\
          </button>\
        </div>\
        <div class="dynamic-item-body">\
          <div class="form-row">\
            <div class="md-field flex-1">\
              <input type="text" class="testimonial-name" value="" placeholder=" ">\
              <label>Имя</label>\
            </div>\
            <div class="md-field flex-1">\
              <input type="text" class="testimonial-role" value="" placeholder=" ">\
              <label>Должность / Роль</label>\
            </div>\
          </div>\
          <div class="md-field">\
            <textarea class="testimonial-text" rows="4" placeholder=" "></textarea>\
            <label>Текст отзыва</label>\
          </div>\
          <div class="photo-upload-group">\
            <div class="photo-upload-area">\
              <div class="photo-preview testimonial-photo-preview">\
                <span class="material-icons">add_a_photo</span>\
              </div>\
              <input type="hidden" class="testimonial-photo-path" value="">\
              <label class="btn btn-outline btn-upload">\
                <span class="material-icons">upload</span> Загрузить\
                <input type="file" accept="image/*" class="file-input" data-target="testimonial-photo" data-index="' + index + '">\
              </label>\
            </div>\
          </div>\
        </div>\
      </div>';

    list.insertAdjacentHTML('beforeend', html);
    hasUnsavedChanges = true;
    renumberItems(list, 'Отзыв');
  };

  // =====================
  // DYNAMIC ITEMS — REMOVE
  // =====================
  window.removeDynamicItem = function (btn) {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;

    const item = btn.closest('.dynamic-item');
    const list = item.parentElement;

    // Check if there's a photo to potentially delete
    const photoPath = item.querySelector('input[type="hidden"]');
    if (photoPath && photoPath.value) {
      // Optionally delete the file from server
      fetch('/admin/delete-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: photoPath.value })
      }).catch(function (err) {
        console.warn('Could not delete file:', err);
      });
    }

    // Determine label prefix for renumbering
    const labelEl = item.querySelector('.item-number');
    let prefix = 'Элемент';
    if (labelEl) {
      const text = labelEl.textContent;
      const match = text.match(/^(.+)\s#\d+$/);
      if (match) prefix = match[1];
    }

    item.remove();
    hasUnsavedChanges = true;
    renumberItems(list, prefix);
  };

  // Renumber items after add/delete
  function renumberItems(list, prefix) {
    const items = list.querySelectorAll('.dynamic-item');
    items.forEach(function (item, i) {
      item.setAttribute('data-index', i);
      const numberEl = item.querySelector('.item-number');
      if (numberEl) {
        numberEl.textContent = prefix + ' #' + (i + 1);
      }
    });
  }

  // =====================
  // COLLECT FORM DATA
  // =====================
  function collectHighlights() {
    const container = document.getElementById('highlights-container');
    if (!container) return [];

    const items = container.querySelectorAll('.highlight-item');
    var highlights = [];
    items.forEach(function (item) {
      highlights.push({
        icon: item.querySelector('.highlight-icon').value,
        label: item.querySelector('.highlight-label').value,
        value: item.querySelector('.highlight-value').value
      });
    });
    return highlights;
  }

  function collectDynamicItems(section) {
    var list = document.getElementById(section + '-list');
    if (!list) return [];

    var items = list.querySelectorAll('.dynamic-item');
    var result = [];
    items.forEach(function (item) {
      result.push({
        title: item.querySelector('.achievement-title').value,
        description: item.querySelector('.achievement-description').value,
        year: item.querySelector('.achievement-year').value,
        photo: item.querySelector('.achievement-photo-path').value
      });
    });
    return result;
  }

  function collectDynamicMethods() {
    var list = document.getElementById('methods-list');
    if (!list) return [];

    var items = list.querySelectorAll('.dynamic-item');
    var result = [];
    items.forEach(function (item) {
      result.push({
        title: item.querySelector('.method-title').value,
        description: item.querySelector('.method-description').value,
        icon: item.querySelector('.method-icon').value
      });
    });
    return result;
  }

  function collectGalleryItems() {
    var list = document.getElementById('gallery-list');
    if (!list) return [];

    var items = list.querySelectorAll('.dynamic-item');
    var result = [];
    items.forEach(function (item) {
      result.push({
        photo: item.querySelector('.gallery-photo-path').value,
        caption: item.querySelector('.gallery-caption').value
      });
    });
    return result;
  }

  function collectTestimonials() {
    var list = document.getElementById('testimonials-list');
    if (!list) return [];

    var items = list.querySelectorAll('.dynamic-item');
    var result = [];
    items.forEach(function (item) {
      result.push({
        name: item.querySelector('.testimonial-name').value,
        role: item.querySelector('.testimonial-role').value,
        text: item.querySelector('.testimonial-text').value,
        photo: item.querySelector('.testimonial-photo-path').value
      });
    });
    return result;
  }

  function collectFormData() {
    return {
      siteSettings: {
        title: document.getElementById('site-title').value,
        metaDescription: document.getElementById('site-meta').value
      },
      hero: {
        name: document.getElementById('hero-name').value,
        title: document.getElementById('hero-title').value,
        school: document.getElementById('hero-school').value,
        motto: document.getElementById('hero-motto').value,
        photo: document.getElementById('hero-photo-path').value,
        experience: document.getElementById('hero-experience').value
      },
      about: {
        text: document.getElementById('about-text').value,
        education: document.getElementById('about-education').value,
        specialization: document.getElementById('about-specialization').value,
        category: document.getElementById('about-category').value,
        photo: document.getElementById('about-photo-path').value,
        highlights: collectHighlights()
      },
      credo: {
        text: document.getElementById('credo-text').value,
        quote: document.getElementById('credo-quote').value,
        quoteAuthor: document.getElementById('credo-author').value
      },
      achievements: collectDynamicItems('achievements'),
      methods: collectDynamicMethods(),
      gallery: collectGalleryItems(),
      testimonials: collectTestimonials(),
      contacts: {
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        address: document.getElementById('contact-address').value,
        social: {
          vk: document.getElementById('social-vk').value,
          telegram: document.getElementById('social-telegram').value,
          youtube: document.getElementById('social-youtube').value
        }
      }
    };
  }

  // =====================
  // SAVE ALL CONTENT
  // =====================
  window.saveAllContent = function () {
    if (isSaving) return;
    isSaving = true;

    var saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
      saveBtn.classList.add('saving');
      saveBtn.innerHTML = '<div class="uploading-spinner" style="width:20px;height:20px;border-width:2px;"></div> Сохранение...';
    }

    var data = collectFormData();

    fetch('/admin/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(function (res) { return res.json(); })
    .then(function (result) {
      if (result.success) {
        showToast('Все изменения успешно сохранены!', 'success');
        hasUnsavedChanges = false;
      } else {
        showToast('Ошибка при сохранении: ' + (result.error || 'Неизвестная ошибка'), 'error');
      }
    })
    .catch(function (err) {
      console.error('Save error:', err);
      showToast('Ошибка сети при сохранении', 'error');
    })
    .finally(function () {
      isSaving = false;
      if (saveBtn) {
        saveBtn.classList.remove('saving');
        saveBtn.innerHTML = '<span class="material-icons">save</span> 💾 Сохранить все изменения';
      }
    });
  };

  // =====================
  // TOAST NOTIFICATIONS
  // =====================
  function showToast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;

    var iconName = type === 'success' ? 'check_circle' : 'error';
    toast.innerHTML = '<span class="material-icons">' + iconName + '</span><span>' + message + '</span>';

    container.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(function () {
      toast.classList.add('toast-out');
      setTimeout(function () {
        if (toast.parentElement) {
          toast.remove();
        }
      }, 300);
    }, 4000);
  }

  // Make showToast available globally for external use
  window.showToast = showToast;

  // =====================
  // UNSAVED CHANGES
  // =====================
  function initUnsavedChangesTracking() {
    // Track input changes
    document.addEventListener('input', function (e) {
      if (e.target.closest('.content')) {
        hasUnsavedChanges = true;
      }
    });

    // Warn before leaving
    window.addEventListener('beforeunload', function (e) {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'У вас есть несохранённые изменения. Вы уверены, что хотите покинуть страницу?';
        return e.returnValue;
      }
    });
  }

})();
