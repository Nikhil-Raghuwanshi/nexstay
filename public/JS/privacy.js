  // Smooth-scroll for the table of contents and active-section highlighting.
  document.addEventListener("DOMContentLoaded", () => {
    const links = [...document.querySelectorAll('.privacy-toc-card a')];
    const sections = links
      .map(link => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    links.forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        history.replaceState(null, '', link.getAttribute('href'));
      });
    });

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => link.classList.remove('active'));
          const active = links.find(link => link.getAttribute('href') === `#${entry.target.id}`);
          active?.classList.add('active');
        });
      },
      { rootMargin: '-20% 0px -65% 0px', threshold: 0 }
    );

    sections.forEach(section => observer.observe(section));
  });