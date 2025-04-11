let schemes = [];

// Fetch schemes from JSON file
fetch('schemes.json')
  .then(res => res.json())
  .then(data => {
    schemes = data;
  })
  .catch(() => {
    document.getElementById('results').innerHTML = `
      <p class="error">❌ Failed to load schemes. Please try again later.</p>
    `;
  });

function filterSchemes() {
  const age = parseInt(document.getElementById('age').value);
  const occupation = document.getElementById('occupation').value;
  const state = document.getElementById('state').value;

  const results = document.getElementById('results');
  results.innerHTML = `<div class="loading">⏳ Searching schemes for you...</div>`;

  setTimeout(() => {
    const filtered = schemes.filter(scheme =>
      (!isNaN(age) && age >= scheme.age) &&
      (occupation === scheme.occupation || occupation === "") &&
      (state === scheme.state || state === "")
    );

    results.innerHTML = ''; // Clear loading message

    if (filtered.length > 0) {
      filtered.forEach(scheme => {
        const card = document.createElement('div');
        card.className = 'card fade-in';
        card.innerHTML = `
          <h3>📌 ${scheme.name}</h3>
          <p>📄 ${scheme.description}</p>
          <p><strong>🧑 Age:</strong> ${scheme.age}+</p>
          <p><strong>👥 For:</strong> ${scheme.occupation}</p>
          <p><strong>📍 State:</strong> ${scheme.state}</p>
        `;
        results.appendChild(card);
      });

      results.scrollIntoView({ behavior: 'smooth' }); // Auto-scroll to results
    } else {
      results.innerHTML = `
        <p class="no-match">⚠️ No matching schemes found. Try different filters.</p>
      `;
    }
  }, 800); // Simulated delay for better UX
}

// 🔧 Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('%c✅ Service Worker registered successfully!', 'color: green; font-weight: bold;');
      console.log('📦 Scope:', registration.scope);
    } catch (error) {
      console.error('%c❌ Service Worker registration failed:', 'color: red; font-weight: bold;', error);
    }
  });
} else {
  console.warn('%c⚠️ Service Worker not supported in this browser.', 'color: orange; font-weight: bold;');
}
