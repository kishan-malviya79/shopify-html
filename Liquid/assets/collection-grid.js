/*
  collection_grid — category filter tabs.
  Imported page-wise by sections/collection_grid.liquid (defer). It binds
  every .collection on the page and guards with a data-collectionReady flag,
  so two collection_grid sections on one page still load one script.

  Clicking a tab toggles `hidden` on every .collection__group whose
  data-category does not match the tab's data-filter, moves .is-active
  between the tabs, and shows the empty-state line when nothing matched.
  The "all" tab shows every group.

  The tabs themselves are rendered server-side, one per collection_group
  block. syncTabs() back-fills a tab for any group that came through
  without one (its data-filter-label carries the label), so the row can
  never go stale against the groups.

  In a store that would rather use real collection-filter links, drop this
  script and point the tabs at collection URLs instead — the markup works
  either way.
*/
(function () {
  function syncTabs(section, tabRow, groups) {
    if (!tabRow) return;

    groups.forEach(function (group) {
      var key = group.dataset.category;
      if (!key || key === 'all') return;
      if (tabRow.querySelector('[data-filter="' + key + '"]')) return;

      var tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'filter-tab';
      tab.dataset.filter = key;
      tab.setAttribute('aria-pressed', 'false');
      tab.textContent = group.dataset.filterLabel || key;
      tabRow.appendChild(tab);
    });
  }

  function initSection(section) {
    if (section.dataset.collectionReady === 'true') return;
    section.dataset.collectionReady = 'true';

    var tabRow = section.querySelector('[data-collection-filters]');
    var groups = section.querySelectorAll('.collection__group');
    var empty = section.querySelector('[data-collection-empty]');

    if (!groups.length) return;

    syncTabs(section, tabRow, groups);

    var tabs = section.querySelectorAll('.filter-tab');
    if (!tabs.length) return;

    function applyFilter(value) {
      var visible = 0;

      groups.forEach(function (group) {
        var match = value === 'all' || group.dataset.category === value;
        group.hidden = !match;
        if (match) visible++;
      });

      if (empty) empty.hidden = visible > 0;
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (other) {
          var isCurrent = other === tab;
          other.classList.toggle('is-active', isCurrent);
          other.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
        });

        applyFilter(tab.dataset.filter);
      });
    });

    /* Honour whichever tab the section rendered as active. */
    var active = section.querySelector('.filter-tab.is-active');
    applyFilter(active ? active.dataset.filter : 'all');
  }

  function initAll(root) {
    (root || document).querySelectorAll('.collection').forEach(initSection);
  }

  initAll();

  /* Theme editor: re-bind when a section is added or re-rendered. */
  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
