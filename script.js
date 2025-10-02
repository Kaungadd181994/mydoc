let flatPages = [];
let currentIndex = -1;

async function loadPage(group, file, skipPush = false) {
  const url = `pages/${group}/${file}`;
  const res = await fetch(url);
  const text = await res.text();

  const page = flatPages.find(p => p.groupKey === group && p.file === file);
  if (page) {
    document.getElementById("page-title").textContent = page.label;
    document.title = `${page.label} – MyDocs`;
  }

  document.getElementById("doc-content").innerHTML = marked.parse(text);

  currentIndex = flatPages.findIndex(p => p.groupKey === group && p.file === file);
  updateFooterNav();

  if (!skipPush) {
    window.location.hash = `${group}/${file}`;
  }

  // 🔹 Highlight active sidebar link
  document.querySelectorAll("#sidebar-nav a").forEach(a => a.classList.remove("active"));
  const activeLink = document.querySelector(`#sidebar-nav a[href="#${group}/${file}"]`);
  if (activeLink) activeLink.classList.add("active");

  // 🔹 Auto-expand group
  const subList = activeLink?.closest("ul.subpages");
  if (subList) {
    subList.classList.add("show");
    const groupItem = subList.previousElementSibling;
    if (groupItem) groupItem.classList.add("expanded");
  }
}

function updateFooterNav() {
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");

  prevBtn.disabled = currentIndex <= 0;
  nextBtn.disabled = currentIndex >= flatPages.length - 1;

  if (currentIndex > 0) {
    prevBtn.textContent = `⬅ Previous: ${flatPages[currentIndex - 1].label}`;
    prevBtn.onclick = () => loadPage(flatPages[currentIndex - 1].groupKey, flatPages[currentIndex - 1].file);
  } else {
    prevBtn.textContent = "⬅ Previous";
    prevBtn.onclick = null;
  }

  if (currentIndex < flatPages.length - 1) {
    nextBtn.textContent = `Next: ${flatPages[currentIndex + 1].label} ➡`;
    nextBtn.onclick = () => loadPage(flatPages[currentIndex + 1].groupKey, flatPages[currentIndex + 1].file);
  } else {
    nextBtn.textContent = "Next ➡";
    nextBtn.onclick = null;
  }
}

async function initDocs() {
  const res = await fetch("pages.json");
  const docs = await res.json();

  const sidebar = document.getElementById("sidebar-nav");

  for (const groupKey in docs) {
    const group = docs[groupKey];

    const groupItem = document.createElement("li");
    groupItem.classList.add("group");
    groupItem.textContent = group.label;

    const subList = document.createElement("ul");
    subList.classList.add("subpages");

    group.pages.forEach(p => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = p.label;
      a.href = `#${groupKey}/${p.file}`;
      a.onclick = (e) => {
        e.preventDefault();
        loadPage(groupKey, p.file);
      };
      li.appendChild(a);
      subList.appendChild(li);

      flatPages.push({ groupKey, file: p.file, label: p.label });
    });

    groupItem.onclick = () => {
      groupItem.classList.toggle("expanded");
      subList.classList.toggle("show");
    };

    const container = document.createElement("ul");
    container.appendChild(groupItem);
    container.appendChild(subList);

    sidebar.appendChild(container);
  }

  // Handle URL hash if present
  if (window.location.hash) {
    const [group, file] = window.location.hash.slice(1).split("/");
    if (group && file) {
      loadPage(group, file, true);
      return;
    }
  }

  // Default to first page
  if (flatPages.length > 0) {
    loadPage(flatPages[0].groupKey, flatPages[0].file, true);
  }
}

// 🔍 Search filter
document.getElementById("search").addEventListener("input", (e) => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll("#sidebar-nav a").forEach(a => {
    a.parentElement.style.display = a.textContent.toLowerCase().includes(term) ? "block" : "none";
  });
});

window.onload = initDocs;
