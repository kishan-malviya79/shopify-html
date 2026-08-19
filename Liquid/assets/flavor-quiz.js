/*
  flavor_quiz — branching step flow (crunch-or-sip -> mood/craving ->
  flavour intensity -> result). Imported page-wise by
  sections/flavor_quiz.liquid (defer).

  Every possible result is rendered as ordinary block markup
  (quiz_character_result / quiz_soda_result), so this only ever copies the
  matched block's content into the visible result slot — no content lives
  in JS.
*/
(function () {
  function initQuiz(section) {
    if (section.dataset.quizReady === 'true') return;
    section.dataset.quizReady = 'true';

    var steps = section.querySelectorAll('[data-quiz-step]');
    var dots = section.querySelectorAll('[data-quiz-dot]');

    function showStep(id) {
      steps.forEach(function (step) {
        step.classList.toggle('is-active', step.dataset.quizStep === id);
      });
    }

    function updateDots(count) {
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-done', i < count);
      });
    }

    section.querySelectorAll('[data-quiz-world]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateDots(1);
        showStep(btn.dataset.quizWorld === 'crunch' ? '2-crunch' : '2-sip');
      });
    });

    section.querySelectorAll('[data-quiz-match]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        section.dataset.quizSelectedMatch = btn.dataset.quizMatch;
        updateDots(2);
        showStep('3');
      });
    });

    section.querySelectorAll('[data-quiz-intensity]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        updateDots(3);

        var key = section.dataset.quizSelectedMatch;
        var data = section.querySelector('[data-quiz-key="' + key + '"]');
        if (data) {
          var sourceImg = data.querySelector('img');
          var resultImg = section.querySelector('[data-quiz-result-img]');
          if (sourceImg && resultImg) {
            resultImg.src = sourceImg.getAttribute('src');
            resultImg.alt = sourceImg.getAttribute('alt') || '';
          }
          section.querySelector('[data-quiz-result-name]').textContent = data.dataset.name;
          section.querySelector('[data-quiz-result-quote]').textContent = data.dataset.quote;
          var cta = section.querySelector('[data-quiz-result-cta]');
          cta.textContent = data.dataset.cta;
          cta.href = data.dataset.link;
        }

        updateDots(4);
        showStep('4');
      });
    });

    var restart = section.querySelector('[data-quiz-restart]');
    if (restart) {
      restart.addEventListener('click', function () {
        updateDots(0);
        showStep('1');
      });
    }
  }

  function initAll(root) {
    (root || document).querySelectorAll('.flavor-quiz').forEach(initQuiz);
  }

  initAll();

  document.addEventListener('shopify:section:load', function (event) {
    initAll(event.target);
  });
})();
